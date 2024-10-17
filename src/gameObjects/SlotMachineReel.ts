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

  private isSpinning: boolean = false;

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

    this.spinResult = scene.add.image(
      0,
      y - SlotMachineReel.symbolHeight / 2,
      shuffledSymbols[0]
    );
    this.add(this.spinResult);
    this.spinResult.setVisible(false);

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

  private _playSpinAnimation() {
    const { height } = this.getBounds();

    const targetY =
      this.initialY -
      height / 2 -
      SlotMachineReel.symbolHeight / 2 +
      SlotMachineReel.verticalSpacing / 2;

    const { singleRevolutionDurationMs, revolutionsCount } =
      this.animationPreferences;

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

  spin(resultSymbol?: string): Promise<string> {
    if (this.isSpinning) {
      console.warn("Reel is already spinning. Ignoring spin request.");
      return Promise.reject(false);
    }

    return new Promise((resolve) => {
      this._playSpinAnimation().on("complete", () => {
        if (!resultSymbol) {
          // TODO: extract into utility file
          resultSymbol = Phaser.Utils.Array.GetRandom(this.symbols);
        }

        this.spinResult.setTexture(resultSymbol);
        this.isSpinning = false;
        this._updateSymbolsVisibility();
        resolve(resultSymbol);
      });
    });
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
