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

  private symbolStripQueue: GameObjects.Container[] = [];

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
    this.symbolStripQueue = this._createAndAddSymbolStrips(
      scene,
      3,
      shuffledSymbols
    );

    this.spinResult = scene.add.image(0, 0, shuffledSymbols[0]);
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

  _duplicateAndShuffle(symbols: string[]) {
    const duplicatedSymbols = [...symbols, ...symbols];
    return duplicatedSymbols.sort(() => Math.random() - 0.5);
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
      y: targetY,
      duration: singleRevolutionDurationMs * revolutionsCount,
      ease: "linear",
      repeat: 0,
      onUpdate: () => {
        // peek symbol strip queue and check if the top symbol strip is within 100px of targetY
        const topStrip = this.symbolStripQueue[0];
        const { top } = topStrip.getBounds();
        console.log("onUpdate", top, targetY);
        if (top < targetY + 100) {
          this._moveFirstStripToEnd();
        }
      },
      onComplete: () => {
        this.setY(this.initialY);
        const { top } = this.symbolStripQueue[0].getBounds();
        console.log("onComplete 1", top, this.y);

        this._translateYChildrenBy(Math.abs(targetY - this.initialY));
        
      },
    });
  }
  private _translateYChildrenBy(distance: number) {
    this.list.forEach((child) => {
      const container = child as GameObjects.Container;
      container.setY(container.y + distance);
    });
  }

  private _moveFirstStripToEnd() {
    const firstStrip = this.symbolStripQueue.shift()!; // cannot be undefined
    const lastStrip = this.symbolStripQueue[this.symbolStripQueue.length - 1];
    const { bottom } = lastStrip.getBounds();
    firstStrip.setY(bottom + SlotMachineReel.verticalSpacing);
    this.symbolStripQueue.push(firstStrip);
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

  private _createAndAddSymbolStrips(
    scene: Scene,
    stripCount: number,
    symbols: string[]
  ) {
    const symbolStrips = [];

    const spacing = SlotMachineReel.verticalSpacing;

    for (let i = 0, curY = 0; i < stripCount; i++) {
      const symbolStrip = new GameObjects.Container(scene, 0, curY);
      this._addSymbols(symbolStrip, symbols, scene);
      const { bottom } = symbolStrip.getBounds();
      curY = bottom + spacing;
      symbolStrips.push(symbolStrip);
    }
    this.add(symbolStrips);
    return symbolStrips;
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
