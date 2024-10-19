import { GameObjects, Scene } from "phaser";
import IndicatorLine from "./IndicatorLine";
import SymbolsContainer from "./SymbolsContainer";
import { DebugUtils } from "../utils/DebugUtils";
import ReelAnimationManager from "../ReelAnimationManager";

export interface SlotMachineReelAnimationPreferences {
  revolutionsCount: number;
  speed: number;
}

export class SlotMachineReel extends GameObjects.GameObject {
  static symbolWidth = 96;
  //   TODO: check if correct
  static symbolHeight = 100;

  static reelWidth = 108;
  static reelBorder = 5;
  static reelHeight = 205 + SlotMachineReel.reelBorder * 2;

  static verticalSpacing = 30;

  container1: SymbolsContainer;
  container2: SymbolsContainer;
  finishLine: IndicatorLine;
  startLine: IndicatorLine;
  payLine: IndicatorLine;

  private readonly debugUtils: DebugUtils;
  private readonly reelAnimationManager: ReelAnimationManager;

  constructor(
    scene: Scene,
    private x: number,
    private y: number,
    private symbols: string[],
    private animationPreferences: SlotMachineReelAnimationPreferences
  ) {
    super(scene, "SlotMachineReel");

    this.debugUtils = DebugUtils.getInstance(scene);

    this.container1 = new SymbolsContainer(
      scene,
      x,
      y,
      SlotMachineReel.verticalSpacing,
      symbols,
      animationPreferences
    );
    this.container2 = new SymbolsContainer(
      scene,
      x,
      y,
      SlotMachineReel.verticalSpacing,
      symbols,
      animationPreferences
    );

    this.createIndicatorLines();
    this.setContainerInitialPositions();

    this.reelAnimationManager = new ReelAnimationManager(
      scene,
      this.container1,
      this.container2,
      this.finishLine,
      this.payLine,
      animationPreferences
    );
    scene.add.existing(this);
  }

  private createIndicatorLines() {
    const width = SymbolsContainer.symbolWidth;
    const height = 2;
    this.startLine = new IndicatorLine(
      this.scene,
      this.x,
      this.y - SlotMachineReel.reelHeight / 2,
      width,
      height
    );
    this.finishLine = new IndicatorLine(
      this.scene,
      this.x,
      this.y + SlotMachineReel.reelHeight / 2,
      width,
      height
    );

    const centerPointY =
      (this.finishLine.y - this.startLine.y) / 2 + this.startLine.y;
    this.payLine = new IndicatorLine(
      this.scene,
      this.x,
      centerPointY,
      width,
      height
    );
  }

  setContainerInitialPositions() {
    this.container1.setX(this.payLine.x);
    this.container1.setY(this.payLine.y);
    
    // TODO: refactor
    const distanceBetweenFirstAndLastSymbol =
    (SymbolsContainer.symbolHeight + SlotMachineReel.verticalSpacing) *
    (this.container1.list.length - 1);
    
    // Align last symbol with payline
    this.container1.setY(this.container1.y - distanceBetweenFirstAndLastSymbol);

    this.container2.placeAboveOf(this.container1);
  }

  isSpinning() {
    return this.reelAnimationManager.isSpinning();
  }
  spin(resultSymbol: string): Promise<void> {
    if (this.reelAnimationManager.isSpinning()) {
      throw new Error("Already spinning");
    }

    return this.reelAnimationManager.spinToSymbol(resultSymbol);
  }
}
