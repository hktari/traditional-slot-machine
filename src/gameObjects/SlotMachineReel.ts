import { GameObjects, Scene } from "phaser";
import IndicatorLine from "./IndicatorLine";
import SymbolsContainer from "./SymbolsContainer";
import { DebugUtils } from "../utils/DebugUtils";

export interface SlotMachineReelAnimationPreferences {
  revolutionsCount: number;
  speed: number;
}

export class SlotMachineReel extends GameObjects.GameObject {
  static symbolWidth = 96;
  //   TODO: check if correct
  static symbolHeight = 100;

  static reelWidth = 108;
  static reelBorder = 5;
  static reelHeight = 205 + SlotMachineReel.reelBorder * 2;

  static verticalSpacing = 30;

  container1: SymbolsContainer;
  container2: SymbolsContainer;
  finishLine: IndicatorLine;
  startLine: IndicatorLine;
  payLine: IndicatorLine;

  private readonly debugUtils: DebugUtils;
  constructor(
    scene: Scene,
    private x: number,
    private y: number,
    private symbols: string[],
    private animationPreferences: SlotMachineReelAnimationPreferences
  ) {
    super(scene, "SlotMachineReel");

    this.debugUtils = DebugUtils.getInstance(scene);

    this.container1 = new SymbolsContainer(
      scene,
      x,
      y,
      SlotMachineReel.verticalSpacing,
      symbols,
      animationPreferences
    );
    this.container2 = new SymbolsContainer(
      scene,
      x,
      y,
      SlotMachineReel.verticalSpacing,
      symbols,
      animationPreferences
    );

    this.createIndicatorLines();
    this.setContainerInitialPositions();

    scene.add.existing(this);
  }
  private createIndicatorLines() {
    const width = SymbolsContainer.symbolWidth;
    const height = 2;
    this.startLine = new IndicatorLine(
      this.scene,
      this.x,
      this.y - SlotMachineReel.reelHeight / 2,
      width,
      height
    );
    this.finishLine = new IndicatorLine(
      this.scene,
      this.x,
      this.y + SlotMachineReel.reelHeight / 2,
      width,
      height
    );

    const centerPointY =
      (this.finishLine.y - this.startLine.y) / 2 + this.startLine.y;
    this.payLine = new IndicatorLine(
      this.scene,
      this.x,
      centerPointY,
      width,
      height
    );
  }

  private revolutionsCount = 0;

  animateContainerToFinishLine(container: SymbolsContainer, speed: number) {
    const distanceToFinishLine = Math.abs(
      this.finishLine.getBounds().bottom -
        container.y +
        SymbolsContainer.symbolHeight / 2
    );

    const duration = Math.round(distanceToFinishLine / speed);

    // TODO: reuse tween
    this.scene.tweens.add({
      targets: container,
      y: "+=" + distanceToFinishLine,
      duration,
      ease: "linear",
      // TODO: extract onComplete
      onComplete: () => {
        this.revolutionsCount++;
        const containerAbove = this.getTopMostContainer();
        container.placeAboveOf(containerAbove);
        if (
          this.revolutionsCount >= this.animationPreferences.revolutionsCount
        ) {
          this.stopAnimationAndDisplayResult();
        } else {
          this.animateContainerToFinishLine(container, speed);
        }
      },
    });
  }

  stopAnimationAndDisplayResult() {
    this.scene.tweens
      .getTweensOf([this.container1, this.container2])
      .forEach((tween) => tween.stop());

    /**
     * Aligns the containers. The spacing after animation the animation finishes is not correct
     */
    // this.getBottomMostContainer().placeBelowOf(this.getTopMostContainer());

    // // const randomSymbol = Phaser.Math.RND.pick(this.symbols);
    // this.animateContainerToSymbol(this.getTopMostContainer(), "slotSymbol4");

    // this.getTopMostContainer().placeAboveOf(this.getBottomMostContainer());

    this.revolutionsCount = 0;
    // // After the animation has stopped. The spacing between the containers is not correct
    this.debugUtils.redrawDebugOutlines();
  }

  setContainerInitialPositions() {
    // Align first image with payline
    this.container1.setX(this.payLine.x);
    this.container1.setY(this.payLine.y);

    const distanceBetweenFirstAndLastSymbol =
      (SymbolsContainer.symbolHeight + SlotMachineReel.verticalSpacing) *
      (this.container1.list.length - 1);

    this.container1.setY(this.container1.y - distanceBetweenFirstAndLastSymbol);

    this.container2.placeAboveOf(this.container1);
  }
  animateContainerToSymbol(
    container: Phaser.GameObjects.Container,
    symbolName: string
  ) {
    const symbolPosition = container.list.indexOf(
      container.list.find(
        (child): child is Phaser.GameObjects.Image =>
          (child as Phaser.GameObjects.Image).texture.key === symbolName
      )!
    );

    if (symbolPosition === -1) {
      throw new Error("Symbol not found. Make sure the symbolName is correct");
    }

    const currentSymbolAtPaylinePosition = container.list.length - 1;

    const numberOfPlacesToPayline = Math.abs(
      symbolPosition - currentSymbolAtPaylinePosition
    );

    const distanceBetweenSymbolAndPayline =
      numberOfPlacesToPayline *
      (SlotMachineReel.symbolWidth + SlotMachineReel.verticalSpacing);

    const durationUntilSymbolReachesPayline = Math.abs(
      Math.round(
        distanceBetweenSymbolAndPayline / this.animationPreferences.speed
      )
    );
    return this.scene.tweens.add({
      targets: container,
      y: "+=" + distanceBetweenSymbolAndPayline,
      duration: durationUntilSymbolReachesPayline,
      ease: "linear",
    });
  }

  isSpinning() {
    return (
      this.scene.tweens.isTweening(this.container1) ||
      this.scene.tweens.isTweening(this.container2)
    );
  }

  spin(resultSymbol?: string): Promise<string> {
    return new Promise((resolve) => {
      this.animateContainerToFinishLine(
        this.container1,
        this.animationPreferences.speed
      );
      this.animateContainerToFinishLine(
        this.container2,
        this.animationPreferences.speed
      );
    });
  }

  getTopMostContainer() {
    return this.container1.getBounds().top < this.container2.getBounds().top
      ? this.container1
      : this.container2;
  }

  getBottomMostContainer() {
    return this.container1.getBounds().bottom >
      this.container2.getBounds().bottom
      ? this.container1
      : this.container2;
  }
}
