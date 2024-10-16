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
  constructor(scene: Scene, x: number, y: number, symbols: string[]) {
    super(scene, x, y);
    this.initialY = y;

    const joinedSymbols = symbols.concat(symbols.slice());
    this._addSymbols(joinedSymbols, scene);

    this._addDebugBackground(scene);

    scene.add.existing(this);
  }

  spin({
    singleRevolutionDurationMs,
    revolutionsCount,
  }: SlotMachineReelAnimationPreferences) {
    const { height } = this.getBounds();

    const targetY =
      this.initialY -
      height / 2 -
      SlotMachineReel.symbolHeight / 2 +
      SlotMachineReel.verticalSpacing / 2;

    this.scene.tweens.chain({
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
