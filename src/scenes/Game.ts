import { Scene } from "phaser";
import { SlotMachineReel } from "../gameObjects/SlotMachineReel";

export enum SlotMachineZIndex {
  reelsBackground = 1000,
  slotMachine = 200,
  symbols = 300,
}

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  slotMachine: Phaser.GameObjects.Image;
  slotMachineSymbols: Phaser.GameObjects.Image[];
  slotMachineLeverUp: Phaser.GameObjects.Image;
  slotMachineLeverDown: Phaser.GameObjects.Image;
  slotMachineReelsBackground: Phaser.GameObjects.Image;
  slotMachineReels: SlotMachineReel[];

  private isSpinning: boolean = false;

  private readonly SpinDurationMs = 1500;

  constructor() {
    super("Game");
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

    const reelWidth = 100;
    const reelOffsetX = 5;
    const reelOffsetY = -1 * reelSymbols.length * 96 / 2;
    const reelSpacing = reelWidth;
    const reelHorizontalSpacing = 15;

    const leftReelX = this.cameras.main.centerX + reelOffsetX;
    const leftReelY = this.cameras.main.centerY + reelOffsetY;

    for (let i = 0; i < 1; i++) {
      const reel = new SlotMachineReel(this, leftReelX, leftReelY, reelSymbols);
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
    this.camera.setBackgroundColor(0xddf6f7);

    // TODO: move to container
    // TODO: add symbols to container in 3x3 grid
    this.slotMachineReelsBackground = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 150,
      "reelBg"
    );

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


    this.slotMachine = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "slotMachineBackground"
      );
    this._createReels();
    this.updateLeverVisibility();


    this._drawDebugCenter();
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
    // Add logic to spin the reels
    this.isSpinning = true;
    this.updateLeverVisibility();
    setTimeout(() => {
      this.isSpinning = false;
      this.updateLeverVisibility();
    }, this.SpinDurationMs);

    const revolutionsCount = 5;

    const singleRevolutionDurationMs = this.SpinDurationMs / revolutionsCount;

    this.tweens.chain({
      targets: this.slotMachineReelsBackground,
      tweens: [
        {
          y: this.cameras.main.centerY + SlotMachineReel.reelHeight,
          duration: singleRevolutionDurationMs,
          ease: "linear",
        },
        {
          y: this.cameras.main.centerY,
          duration: 0,
          ease: "linear",
        },
      ],
      repeat: revolutionsCount,
    });

    this.tweens.chain({
        targets: this.slotMachineReels,
        tweens: [
          {
            y: this.cameras.main.centerY - SlotMachineReel.reelHeight,
            duration: singleRevolutionDurationMs,
            ease: "linear",
          },
          {
            y: this.cameras.main.centerY,
            duration: 0,
            ease: "linear",
          },
        ],
        repeat: revolutionsCount,
      });

    // this.tweens.add({
    //     targets: this.slotMachineReelsOverlay,
    //     y: SlotMachineReel.reelHeight,
    //     duration: this.SpinDurationMs,
    //     ease: 'Cubic.easeInOut',
    //     repeat: -1,
    //     onComplete: () => {
    //         this.slotMachineReelsOverlay.angle = 0;
    //     }
    // });
  }
  private updateLeverVisibility() {
    this.slotMachineLeverUp.setVisible(!this.isSpinning);
    this.slotMachineLeverDown.setVisible(this.isSpinning);
  }
}
