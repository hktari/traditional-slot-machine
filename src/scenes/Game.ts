import { Scene } from "phaser";
import { SlotMachineReel } from "../gameObjects/SlotMachineReel";
import SlotMachineReelBackground from "../gameObjects/SlotMachineReelBackground";
import { DebugUtils } from "../utils/DebugUtils";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  slotMachine: Phaser.GameObjects.Image;
  slotMachineSymbols: Phaser.GameObjects.Image[];
  slotMachineLeverUp: Phaser.GameObjects.Image;
  slotMachineLeverDown: Phaser.GameObjects.Image;
  slotMachineReels: SlotMachineReel[];

  spinAnimationPreferences = {
    speed: 1.6,
    revolutionsCount: 5,
  };

  get isSpinning(): boolean {
    return this._isSpinning;
  }

  set isSpinning(value: boolean) {
    this._isSpinning = value;
    this._updateLeverVisibility();
  }

  private _isSpinning: boolean = false;

  private readonly debugUtils: DebugUtils;
  constructor() {
    super("Game");

    this.debugUtils = DebugUtils.getInstance(this);
  }

  preload() {
    this.load.image("leverUp", "assets/lever-up.png");
    this.load.image("leverDown", "assets/lever-down.png");
    this.load.image(
      "slotMachineBackground",
      "assets/slot-machine.png"
    );
    this.load.image("slotMachine1", "assets/slot-machine1.png");
    this.load.image("slotSymbol1", "assets/slot-symbol1.png");
    this.load.image("slotSymbol2", "assets/slot-symbol2.png");
    this.load.image("slotSymbol3", "assets/slot-symbol3.png");
    this.load.image("slotSymbol4", "assets/slot-symbol4.png");
    this.load.image("slotSymbol5", "assets/slot-symbol5.png");
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
  }

  private reelSymbols = [
    "slotSymbol1",
    "slotSymbol2",
    "slotSymbol3",
    "slotSymbol4",
  ];
  _createReels() {
    this.slotMachineReels = [];

    const offsetXToCenter = 5;
    const distanceBetweennReels = 130;
    const offsetYToCenter = 39;

    const reelOffsetX = distanceBetweennReels * -1 + offsetXToCenter;

    const leftReelX = this.cameras.main.centerX + reelOffsetX;
    const leftReelY = this.cameras.main.centerY + offsetYToCenter;

    for (let i = 0; i < 3; i++) {
      const revolutionsCountDifference = 1;
      const spinAnimation = {
        ...this.spinAnimationPreferences,
        revolutionsCount:
          this.spinAnimationPreferences.revolutionsCount +
          i * revolutionsCountDifference,
      };

      const reel = new SlotMachineReel(
        this,
        leftReelX + i * distanceBetweennReels,
        leftReelY,
        this.reelSymbols,
        spinAnimation
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
