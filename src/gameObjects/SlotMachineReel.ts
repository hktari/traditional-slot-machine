import { GameObjects, Scene } from "phaser";
import { SlotMachineZIndex } from "../scenes/Game";

export class SlotMachineReel extends GameObjects.Container {
  static symbolWidth = 96;
  static reelWidth = 108;
  static reelHeight = 210;
  static reelBorder = 5;
  //   TODO: check if correct
  static symbolHeight = 100;

  constructor(scene: Scene, x: number, y: number, symbols: string[]) {
    super(scene, x, y);

    // Add three images in a vertical layout
    for (let i = 0; i < 3; i++) {
      const symbol = scene.add.image(
        0,
        i * SlotMachineReel.symbolHeight,
        symbols[i]
      );
      symbol.setZ(SlotMachineZIndex.symbols);
      this.add(symbol);
    }

    // this._centerAlignChildren();
    this._addDebugBackground(scene);
    // Add this container to the scene
    scene.add.existing(this);
  }

  private _addDebugBackground(scene: Scene) {
    const debugBackground = scene.add.graphics();
    debugBackground.fillStyle(0x0000ff, 0.5); // Blue with 50% opacity

    const bounds = this.getBounds();
    debugBackground.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    scene.children.addAt(debugBackground, 0);
  }
}
