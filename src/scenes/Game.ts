import { Scene } from "phaser";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  slotMachineBackground: Phaser.GameObjects.Image;
  slotMachineSymbols: Phaser.GameObjects.Image[];
  slotMachineLeverUp: Phaser.GameObjects.Image;
  slotMachineLeverDown: Phaser.GameObjects.Image;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("leverUp", "assets/Slot Machine/lever-up.png");
    this.load.image("leverDown", "assets/Slot Machine/lever-down.png");
    this.load.image("reelBg", "assets/Slot Machine/reel-bg.png");
    this.load.image(
      "slotMachineBackground",
      "assets/Slot Machine/slot-machine.png"
    );
    this.load.image("slotMachine1", "assets/Slot Machine/slot-machine1.png");
    this.load.image("slotSymbol1", "assets/Slot Machine/slot-symbol1.png");
    this.load.image("slotSymbol2", "assets/Slot Machine/slot-symbol2.png");
    this.load.image("slotSymbol3", "assets/Slot Machine/slot-symbol3.png");
    this.load.image("slotSymbol4", "assets/Slot Machine/slot-symbol4.png");
    this.load.image("slotSymbol5", "assets/Slot Machine/slot-symbol5.png");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);

    this.slotMachineBackground = this.add.image(0, 0, "slotMachineBackground");
    this.slotMachineSymbols = [
      this.add.image(0, 0, "slotSymbol1"),
      this.add.image(0, 0, "slotSymbol2"),
      this.add.image(0, 0, "slotSymbol3"),
      this.add.image(0, 0, "slotSymbol4"),
      this.add.image(0, 0, "slotSymbol5"),
    ];

    this.slotMachineLeverUp = this.add.image(0, 0, "leverUp");
    this.slotMachineLeverDown = this.add.image(0, 0, "leverDown");

    this.input.once("pointerdown", () => {
      this.scene.start("GameOver");
    });
  }
}
