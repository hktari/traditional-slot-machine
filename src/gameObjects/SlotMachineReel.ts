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
  static reelBorder = 5;
  static reelHeight = 205 + SlotMachineReel.reelBorder * 2;

  static verticalSpacing = 30;

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

    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xff22ff);
    graphics.strokeRect(
      -SlotMachineReel.reelWidth / 2,
      -SlotMachineReel.reelHeight / 2,
      SlotMachineReel.reelWidth,
      SlotMachineReel.reelHeight
    );
    graphics.setDepth(2000);
    this.add(graphics);

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

    this.createIndicatorLines();
    this.setContainerInitialPositions();

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

  private spinCounter = 0;
  private spinCountMax = 11;

  animateContainerToFinishLine(container: SymbolsContainer, speed: number) {
    const distanceToFinishLine =
      this.finishLine.getBounds().bottom -
      container.getBounds().bottom +
      SlotMachineReel.symbolHeight / 2;

    const duration = Math.round(distanceToFinishLine / speed);

    // TODO: reuse tween
    this.scene.tweens.add({
      targets: container,
      y: "+=" + distanceToFinishLine,
      duration,
      ease: "linear",
      // TODO: extract onComplete
      onComplete: () => {
        this.spinCounter++;
        if (this.spinCounter >= this.spinCountMax) {
          this.stopAnimationAndDisplayResult();
        } else {
          const containerAbove = this.getTopMostContainer();
          container.placeBehindOf(containerAbove);

          this.animateContainerToFinishLine(container, speed);
        }
      },
    });
  }

  stopAnimationAndDisplayResult() {
    this.scene.tweens.killAll();

    // /**
    //  * Aligns the containers. The spacing after animation the animation finishes is not correct
    //  */
    // this.placeContainerBehindOther(
    //   this.getLeftMostContainer(),
    //   this.getRightMostContainer()
    // );

    // const randomSymbol = Phaser.Math.RND.pick(this.symbols);
    // this.animateContainerToSymbol(this.getLeftMostContainer(), randomSymbol);

    // this.placeContainerInfrontOfOther(
    //   this.getRightMostContainer(),
    //   this.getLeftMostContainer()
    // );

    // this.spinCounter = 0;
    // // After the animation has stopped. The spacing between the containers is not correct
    // this.redrawDebugOutlines();
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
}
