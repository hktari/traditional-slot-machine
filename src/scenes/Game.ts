import { Scene } from "phaser";
import { SlotMachineReel } from "../gameObjects/SlotMachineReel";
import SlotMachineReelBackground from "../gameObjects/SlotMachineReelBackground";

export enum SlotMachineZIndex {
  reelsBackground = 1000,
  slotMachine = 200,
  symbols = 300,
}

export interface SlotMachineReelAnimationPreferences {
  singleRevolutionDurationMs: number;
  revolutionsCount: number;
}

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  slotMachine: Phaser.GameObjects.Image;
  slotMachineSymbols: Phaser.GameObjects.Image[];
  slotMachineLeverUp: Phaser.GameObjects.Image;
  slotMachineLeverDown: Phaser.GameObjects.Image;
  slotMachineReels: SlotMachineReel[];
  slotMachineReelsBackground: SlotMachineReelBackground;

  private isSpinning: boolean = false;

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
    this.camera.setBackgroundColor(0xddf6f7);

    // TODO: move to container
    // TODO: add symbols to container in 3x3 grid
    this.slotMachineReelsBackground = new SlotMachineReelBackground(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY
    );

    this._createReels();
    this.slotMachine = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "slotMachineBackground"
    );
    this._createLever();
    this.updateLeverVisibility();

    this._drawDebugCenter();
  }

  _createReels() {
    this.slotMachineReels = [];
    const reelSymbols = [
      "slotSymbol1",
      "slotSymbol2",
      "slotSymbol3",
      "slotSymbol4",
      "slotSymbol5",
    ];

    const offsetXToCenter = 5;
    const distanceBetweennReels = 130;
    const offsetYToCenter = 35;

    const reelOffsetX = distanceBetweennReels * -1 + offsetXToCenter;

    const leftReelX = this.cameras.main.centerX + reelOffsetX;
    const leftReelY = this.cameras.main.centerY + offsetYToCenter;

    for (let i = 0; i < 3; i++) {
      const reel = new SlotMachineReel(
        this,
        leftReelX + i * distanceBetweennReels,
        leftReelY,
        reelSymbols
      );
      this.slotMachineReels.push(reel);
    }
  }

  private _createLever() {
    this.slotMachineLeverUp = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "leverUp"
    );
    this.slotMachineLeverUp.setInteractive();
    this.slotMachineLeverUp.on("pointerdown", this.spin, this);

    this.slotMachineLeverDown = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "leverDown"
    );
  }
  private _drawDebugCenter() {
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      10,
      10,
      0x00ff00,
      0.5
    );
    this.add.circle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      2,
      0xff0000,
      0.5
    );
  }

  spin() {
    console.log("Spin the reels!");
    this.isSpinning = true;
    this.updateLeverVisibility();

    const SpinDurationMs = 3000;
    const revolutionsCount = 30;

    const singleRevolutionDurationMs = SpinDurationMs / revolutionsCount;

    const animationPreferences = {
      singleRevolutionDurationMs,
      revolutionsCount,
    };
    const tween = this.slotMachineReelsBackground.spin(animationPreferences);

    tween.on("complete", () => {
      this.isSpinning = false;
      this.updateLeverVisibility();
    });
    this.slotMachineReels.forEach((reel) => reel.spin(animationPreferences));
  }
  
  private updateLeverVisibility() {
    this.slotMachineLeverUp.setVisible(!this.isSpinning);
    this.slotMachineLeverDown.setVisible(this.isSpinning);
  }
}
