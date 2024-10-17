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

    const symbolsPrepared = this._createSymbolsDuplicates(
      this._shuffleSymbols(),
      this.animationPreferences.revolutionsCount
    );
    this._addSymbols(this, symbolsPrepared, scene);

    this.spinResult = scene.add.image(0, 0, symbolsPrepared[0]);
    this.add(this.spinResult);

    this._updateSymbolsVisibility();

    this._addDebugBackground(scene);

    scene.add.existing(this);
  }

  private _updateSymbolsVisibility() {
    this.list.forEach((child) => {
      const symbolImage = child as GameObjects.Image;
      symbolImage.setVisible(true);
    });
    this.spinResult.setVisible(false);
  }

  _shuffleSymbols() {
    return this.symbols.sort(() => Math.random() - 0.5);
  }

  _createSymbolsDuplicates(symbols: string[], count: number) {
    return Array.from({ length: count }, () => symbols).flat();
  }

  private _playSpinAnimation() {
    const { height } = this.getBounds();
    const { singleRevolutionDurationMs, revolutionsCount } =
      this.animationPreferences;

    const targetY = this.initialY - revolutionsCount * height;

    // -
    // SlotMachineReel.symbolHeight +
    // SlotMachineReel.verticalSpacing / 2

    return this.scene.tweens.add({
      targets: this,
      yoyo: true,
      y: targetY,
      duration: singleRevolutionDurationMs * revolutionsCount,
      ease: "Cubic.inOut",
      repeat: 0,
    });
  }

  spin(resultSymbol?: string): Promise<string> {
    if (this.isSpinning) {
      console.warn("Reel is already spinning. Ignoring spin request.");
      return Promise.reject(false);
    }

    return new Promise((resolve) => {
      this.isSpinning = true;
      this._updateSymbolsVisibility();

      this._playSpinAnimation().on("complete", () => {
        console.log("onComplete 2");
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

  private _addSymbols(
    container: GameObjects.Container,
    symbols: string[],
    scene: Scene
  ) {
    let y = 0;
    const symbolsCount = symbols.length;
    for (let i = 0; i < symbolsCount; i++) {
      const spacing = i === 0 ? 0 : SlotMachineReel.verticalSpacing;
      y = i * (SlotMachineReel.symbolHeight + spacing);
      const symbol = scene.add.image(0, y, symbols[i]);
      container.add(symbol);
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
