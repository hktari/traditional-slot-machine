import { Scene } from "phaser";
import { SlotMachineReel } from "../gameObjects/SlotMachineReel";

export enum SlotMachineZIndex {
  background = 0,
  symbols = 1,
  reelOverlay = 1,
}

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  slotMachineBackground: Phaser.GameObjects.Image;
  slotMachineSymbols: Phaser.GameObjects.Image[];
  slotMachineLeverUp: Phaser.GameObjects.Image;
  slotMachineLeverDown: Phaser.GameObjects.Image;
  slotMachineReelsOverlay: Phaser.GameObjects.Image;
  slotMachineReels: SlotMachineReel[];

  private isSpinning: boolean = false;

    private readonly SpinDurationMs = 1500;

  constructor() {
    super("Game");
  }

  _createReels() {
    this.slotMachineReels = [];
    const reelWidth = 100;
    const reelOffsetX = 0;
    const reelOffsetY = -60;
    const reelSpacing = reelWidth;
    const reelHorizontalSpacing = 15;

    const leftReelX = this.cameras.main.centerX;
    const leftReelY = this.cameras.main.centerY + reelOffsetY;

    const reelSymbols = [
      "slotSymbol1",
      "slotSymbol2",
      "slotSymbol3",
      "slotSymbol4",
      "slotSymbol5",
    ];
    for (let i = 0; i < 1; i++) {
      const reel = new SlotMachineReel(
        this,
        leftReelX + i * reelSpacing,
        leftReelY,
        reelSymbols
      );
      this.slotMachineReels.push(reel);
    }
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

    this.slotMachineBackground = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "slotMachineBackground"
    );

    this.slotMachineReelsOverlay = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "reelBg"
    );
    this.slotMachineReelsOverlay.setZ(SlotMachineZIndex.reelOverlay);

    this.slotMachineLeverUp = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "leverUp"
    );
    // Add click handler to leverUp image
    this.slotMachineLeverUp.setInteractive();
    this.slotMachineLeverUp.on("pointerdown", this.spin, this);

    this.slotMachineLeverDown = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "leverDown"
    );

    this._createReels();
    this.updateLeverVisibility();
  }

  spin() {
    console.log("Spin the reels!");
    // Add logic to spin the reels
    this.isSpinning = true;
    this.updateLeverVisibility();
    setTimeout(() => {
      this.isSpinning = false;
      this.updateLeverVisibility();
    }, this.SpinDurationMs);
  }
  private updateLeverVisibility() {
    this.slotMachineLeverUp.setVisible(!this.isSpinning);
    this.slotMachineLeverDown.setVisible(this.isSpinning);
  }
}
