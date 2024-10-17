import { GameObjects, Scene } from "phaser";
import {
  SlotMachineReelAnimationPreferences,
  SlotMachineZIndex,
} from "../scenes/Game";

export class SlotMachineReel extends GameObjects.Container {
  static symbolWidth = 96;
  static reelWidth = 108;
  static reelHeight = 210;
  static reelBorder = 5;
  //   TODO: check if correct
  static symbolHeight = 100;

  static verticalSpacing = 60;

  private initialY = 0;

  private _isSpinning: boolean = false;
  get isSpinning(): boolean {
    return this._isSpinning;
  }

  set isSpinning(isSpinning: boolean) {
    this._isSpinning = isSpinning;

    this._updateSymbolsVisibility();
  }

  private spinResult: Phaser.GameObjects.Image;
  constructor(
    scene: Scene,
    x: number,
    y: number,
    private symbols: string[],
    private animationPreferences: SlotMachineReelAnimationPreferences
  ) {
    super(scene, x, y);
    this.initialY = y;
    const shuffledSymbols = this._duplicateAndShuffle(symbols);
    this._addSymbols(shuffledSymbols, scene);

    this.spinResult = scene.add.image(0, 0, shuffledSymbols[0]);

    this._updateSymbolsVisibility();

    this._addDebugBackground(scene);

    scene.add.existing(this);
  }

  private _updateSymbolsVisibility() {
    this.list.forEach((child) => {
      const symbolImage = child as GameObjects.Image;
      symbolImage.setVisible(this.isSpinning);
    });
    this.spinResult.setVisible(!this.isSpinning);
  }

  _duplicateAndShuffle(symbols: string[]) {
    const duplicatedSymbols = [...symbols, ...symbols];
    return duplicatedSymbols.sort(() => Math.random() - 0.5);
  }

  playSpinAnimation({
    singleRevolutionDurationMs,
    revolutionsCount,
  }: SlotMachineReelAnimationPreferences) {
    const { height } = this.getBounds();

    const targetY =
      this.initialY -
      height / 2 -
      SlotMachineReel.symbolHeight / 2 +
      SlotMachineReel.verticalSpacing / 2;

    return this.scene.tweens.chain({
      targets: this,
      tweens: [
        {
          y: targetY,
          duration: singleRevolutionDurationMs,
          ease: "linear",
        },
        {
          y: this.initialY,
          duration: 0,
          ease: "linear",
        },
      ],
      repeat: revolutionsCount,
    });
  }

  spin(resultSymbol?: string) {
    this.playSpinAnimation(this.animationPreferences).on("complete", () => {
      if (!resultSymbol) {
        resultSymbol = Phaser.Utils.Array.GetRandom(this.symbols);
      }
      this.setSpinResult(resultSymbol);
    });
  }

  setSpinResult(symbol: string) {
    if (this.spinResult) {
      this.remove(this.spinResult);
    }
    const y = this.initialY - SlotMachineReel.symbolHeight / 2;
    this.spinResult = this.scene.add.image(0, y, symbol);
    this.add(this.spinResult);
  }

  private _addSymbols(symbols: string[], scene: Scene) {
    let y = 0;
    const symbolsCount = symbols.length;
    for (let i = 0; i < symbolsCount; i++) {
      const spacing = i === 0 ? 0 : SlotMachineReel.verticalSpacing;
      y = i * (SlotMachineReel.symbolHeight + spacing);
      const symbol = scene.add.image(0, y, symbols[i]);
      this.add(symbol);
    }
  }

  private _addDebugBackground(scene: Scene) {
    const debugBackground = scene.add.graphics();
    debugBackground.fillStyle(0x0000ff, 0.5); // Blue with 50% opacity

    const bounds = this.getBounds();
    debugBackground.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    scene.children.addAt(debugBackground, 0);
  }
}
