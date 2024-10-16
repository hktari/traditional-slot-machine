import { GameObjects, Scene } from "phaser";
import { SlotMachineZIndex } from "../scenes/Game";

export class SlotMachineReel extends GameObjects.Container {
  static symbolWidth = 96;
  static reelWidth = 108;
  static reelHeight = 210;
  static reelBorder = 5;
  static symbolHeight = 100;

  static symbolOffsetX =
    (SlotMachineReel.reelWidth - SlotMachineReel.symbolWidth) / 2; // Calculate the offset

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

    this.setSize(SlotMachineReel.reelWidth, SlotMachineReel.reelHeight); // Set the size of the container
    this.setPosition(x, y); // Set the position of the container

    // Center align images inside the container
    this.list.forEach((child) => {
      if (child instanceof GameObjects.Image) {
        child.x = SlotMachineReel.symbolOffsetX;
      }
    });

    // Add this container to the scene
    scene.add.existing(this);
  }

  private _addDebugBackground(scene: Scene) {
    const debugBackground = scene.add.graphics();
    debugBackground.fillStyle(0x0000ff, 0.5); // Blue with 50% opacity

    debugBackground.fillRect(
      -SlotMachineReel.reelWidth / 2,
      -SlotMachineReel.reelBorder,
      SlotMachineReel.reelWidth + SlotMachineReel.reelBorder * 2,
      SlotMachineReel.reelHeight + SlotMachineReel.reelBorder * 2
    );
    this.addAt(debugBackground, 0);
  }
}
