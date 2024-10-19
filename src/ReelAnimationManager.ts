import IndicatorLine from "./gameObjects/IndicatorLine";
import { SlotMachineReelAnimationPreferences } from "./gameObjects/SlotMachineReel";
import SymbolsContainer from "./gameObjects/SymbolsContainer";

export default class ReelAnimationManager {
  private currentSymbolToSpinTo: string | null = null;
  private resolveIsSpinningPromise: ((value: void) => void) | null = null;
  private revolutionsCount = 0;

  constructor(
    private scene: Phaser.Scene,
    private container1: SymbolsContainer,
    private container2: SymbolsContainer,
    private finishLine: IndicatorLine,
    private payLine: IndicatorLine,
    private animationPreferences: SlotMachineReelAnimationPreferences
  ) {}

  isSpinning(): boolean {
    return this.resolveIsSpinningPromise !== null;
  }

  spinToSymbol(symbol: string): Promise<void> {
    if (this.isSpinning()) {
      throw new Error("Reel is already spinning");
    }

    return new Promise((resolve) => {
      this.currentSymbolToSpinTo = symbol;
      this.resolveIsSpinningPromise = resolve;
      this._loopSymbolsSpinAnimation(this.container1);
      this._loopSymbolsSpinAnimation(this.container2);
    });
  }

  private _loopSymbolsSpinAnimation(container: SymbolsContainer) {
    container
      .animateAlignTopToYPosition(this.finishLine.y)
      .on("complete", () => {
        this.revolutionsCount++;
        const containerAbove = this._getTopMostContainer();
        container.placeAboveOf(containerAbove);
        if (
          this.revolutionsCount >= this.animationPreferences.revolutionsCount
        ) {
          this._stopAnimationAndDisplayResult();
        } else {
          this._loopSymbolsSpinAnimation(container);
        }
      });
  }

  private _stopAnimationAndDisplayResult() {
    this._stopAnimations();

    this._getBottomMostContainer()
      .animateAlignSymbolToYPosition(
        this.currentSymbolToSpinTo!,
        this.payLine.y
      )
      .on("complete", () => {
        // After the animation has stopped. The spacing between the containers is not correct. Correct it.
        this._getTopMostContainer().placeAboveOf(
          this._getBottomMostContainer()
        );

        const spinFinishedPromise = this.resolveIsSpinningPromise;
        this._resetState();
        spinFinishedPromise?.();
      });
  }

  private _resetState() {
    this.resolveIsSpinningPromise = null;
    this.revolutionsCount = 0;
  }

  private _stopAnimations() {
    this.scene.tweens
      .getTweensOf([this.container1, this.container2])
      .forEach((tween) => tween.stop());
  }

  private _getTopMostContainer() {
    return this.container1.getBounds().top < this.container2.getBounds().top
      ? this.container1
      : this.container2;
  }

  private _getBottomMostContainer() {
    return this.container1.getBounds().bottom >
      this.container2.getBounds().bottom
      ? this.container1
      : this.container2;
  }
}
