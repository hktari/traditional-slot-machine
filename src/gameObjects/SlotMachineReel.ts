import { GameObjects, Scene } from "phaser";
import IndicatorLine from "./IndicatorLine";
import SymbolsContainer from "./SymbolsContainer";

export interface SlotMachineReelAnimationPreferences {
  revolutionsCount: number;
  speed: number;
}

export class SlotMachineReel extends GameObjects.Container {
  static symbolWidth = 96;
  //   TODO: check if correct
  static symbolHeight = 100;

  static reelWidth = 108;
  static reelHeight = 210;
  static reelBorder = 5;

  static verticalSpacing = 60;

  container1: Phaser.GameObjects.Container;
  container2: Phaser.GameObjects.Container;
  finishLine: IndicatorLine;
  startLine: IndicatorLine;
  payLine: IndicatorLine;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private symbols: string[],
    private animationPreferences: SlotMachineReelAnimationPreferences
  ) {
    super(scene, x, y);

    this.container1 = new SymbolsContainer(
      scene,
      0,
      0,
      SlotMachineReel.verticalSpacing,
      symbols,
      animationPreferences
    );
    this.container2 = new SymbolsContainer(
      scene,
      0,
      0,
      SlotMachineReel.verticalSpacing,
      symbols,
      animationPreferences
    );
    this.add(this.container1);
    this.add(this.container2);
    
    // this.createIndicatorLines({startY: })
    // this.setContainerInitialPositions();

    scene.add.existing(this);
  }
  private createIndicatorLines({
    startY,
    finishY,
    x,
  }: {
    startY: number;
    finishY: number;
    x: number;
  }) {
    const width = SymbolsContainer.symbolWidth;
    const height = 5;
    this.startLine = new IndicatorLine(this.scene, x, startY, width, height);
    this.finishLine = new IndicatorLine(this.scene, x, finishY, width, height);

    const centerPointY = (finishY - startY) / 2 + startY;
    this.payLine = new IndicatorLine(
      this.scene,
      x,
      centerPointY,
      width,
      height
    );
  }

  setContainerInitialPositions() {
    // Align first image with payline
    this.container1.setX(this.payLine.x);
    this.container1.setY(this.payLine.y);
    // const translateXToLastSymbol =
    //   (SymbolsContainer.symbolWidth / 2 + this.spacing) * this.container1.list.length +
    //   SymbolsContainer.symbolWidth / 2;

    // this.container1.setX(this.container1.x - translateXToLastSymbol);

    // this.placeContainerInfrontOfOther(this.container2, this.container1);
  }

  isSpinning() {
    return (
      this.scene.tweens.isTweening(this.container1) ||
      this.scene.tweens.isTweening(this.container2)
    );
  }

  spin(resultSymbol?: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getTopMostContainer() {
    return this.container1.getBounds().top < this.container2.getBounds().top
      ? this.container1
      : this.container2;
  }

  getBottomMostContainer() {
    return this.container1.getBounds().bottom >
      this.container2.getBounds().bottom
      ? this.container1
      : this.container2;
  }

  private _addSymbols(
    container: GameObjects.Container,
    symbols: string[],
    scene: Scene
  ) {
    let y = 0;
    const symbolsCount = symbols.length;
    for (let i = 0; i < symbolsCount; i++) {
      const spacing = i === 0 ? 0 : SlotMachineReel.verticalSpacing;
      y = i * (SlotMachineReel.symbolHeight + spacing);
      const symbol = scene.add.image(0, y, symbols[i]);
      container.add(symbol);
    }
  }
}
