import { Scene } from "phaser";
import { SlotMachineReel } from "../gameObjects/SlotMachineReel";
import SlotMachineReelBackground from "../gameObjects/SlotMachineReelBackground";

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
  slotMachineReels: SlotMachineReel[];
  slotMachineReelsBackground: SlotMachineReelBackground;

  spinAnimationPreferences = {
    speed: 3,
    revolutionsCount: 30,
  };

  get isSpinning(): boolean {
    return this._isSpinning;
  }

  set isSpinning(value: boolean) {
    this._isSpinning = value;
    this._updateLeverVisibility();
  }

  private _isSpinning: boolean = false;

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

    this._createReels();

    this.slotMachine = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "slotMachineBackground"
    );
    this._createLever();

    this._updateLeverVisibility();

    this._drawDebugCenter();
    this.redrawDebugOutlines();
  }

  private reelSymbols = [
    "slotSymbol1",
    "slotSymbol2",
    "slotSymbol3",
    "slotSymbol4",
    // TODO: add more symbols
    // "slotSymbol5",
  ];
  _createReels() {
    this.slotMachineReels = [];

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
        this.reelSymbols,
        this.spinAnimationPreferences
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

  private debugGraphics: Phaser.GameObjects.Graphics[] = [];

  // TODO: move into utils
  redrawDebugOutlines() {
    this.debugGraphics.forEach((graphic) => graphic.destroy());
    this.debugGraphics = [];
    const containerColor = 0x00ff00;
    const symbolColor = 0xff00ff;

    this.slotMachineReels.forEach((container) => {
      this.drawDebugOutlinesForContainer(containerColor, container);
      container.list.forEach((child) => {
        this.drawDebugOutlinesForContainer(
          symbolColor,
          child as Phaser.GameObjects.Container
        );
      });
    });
  }

  private drawDebugOutlinesForContainer(
    color: number,
    gameObject: Phaser.GameObjects.Container
  ) {
    const bounds = gameObject.getBounds();
    return this.drawDebug(color, bounds);
  }

  private drawDebug(color: number, bounds: Phaser.Geom.Rectangle) {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, color, 1);
    graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.debugGraphics.push(graphics);
    return graphics;
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

  async spin() {
    this.isSpinning = true;

    const spinResult = this._getRandomSpinResult();

    const spinRequests = [];
    for (let i = 0; i < this.slotMachineReels.length; i++) {
      const spinRequest = this.slotMachineReels[i].spin(spinResult[i]);
      spinRequests.push(spinRequest);
    }

    await Promise.all(spinRequests);

    this.isSpinning = false;
  }

  private _getRandomSpinResult() {
    const results = [];
    for (let i = 0; i < this.slotMachineReels.length; i++) {
      // TODO: extract into utility file
      const randomSymbol = Phaser.Utils.Array.GetRandom(this.reelSymbols);
      results.push(randomSymbol);
    }
    return results;
  }

  private _updateLeverVisibility() {
    this.slotMachineLeverUp.setVisible(!this.isSpinning);
    this.slotMachineLeverDown.setVisible(this.isSpinning);
  }
}
