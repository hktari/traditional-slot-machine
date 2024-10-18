import { Scene } from "phaser";
import IndicatorLine from "../gameObjects/IndicatorLine";

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameover_text: Phaser.GameObjects.Text;
  rectangle: Phaser.GameObjects.Rectangle;
  circle: Phaser.GameObjects.Arc;
  container1: Phaser.GameObjects.Container;
  rectangles: Phaser.GameObjects.Rectangle[];
  finishLine: Phaser.GameObjects.Rectangle;
  startLine: Phaser.GameObjects.Rectangle;
  container2: Phaser.GameObjects.Container;

  private readonly symbolWidth = 100;
  payLine: IndicatorLine;

  constructor() {
    super("GameOver");
  }

  preload() {
    this.load.image("slotSymbol1", "assets/Slot Machine/slot-symbol1.png");
    this.load.image("slotSymbol2", "assets/Slot Machine/slot-symbol2.png");
    this.load.image("slotSymbol3", "assets/Slot Machine/slot-symbol3.png");
    this.load.image("slotSymbol4", "assets/Slot Machine/slot-symbol4.png");
    this.load.image("slotSymbol5", "assets/Slot Machine/slot-symbol5.png");
  }

  private symbols = [
    "slotSymbol1",
    "slotSymbol2",
    "slotSymbol3",
    "slotSymbol4",
  ];

  private spacing = 50;
  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xaabb00);

    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    this.createIndicatorLines();
    this.createSlit();

    this.container1 = this.createContainerWithSymbols(
      this.startLine.getBounds().right + this.symbolWidth / 2,
      this.startLine.y
    );

    this.container2 = this.createContainerWithSymbols(
      this.startLine.getBounds().right,
      this.startLine.y
    );

    this.placeContainerBehindOther(this.container2);

    const speed = 3;

    this.startLine.setToTop();
    this.finishLine.setToTop();
    this.slit.forEach((slit) => slit.setToTop());

    this.redrawDebugGraphics();

    this.input.on("pointerdown", () => {
      if (!this.isSpinning()) {
        this.animateXToFinishLine(this.container1, speed);
        this.animateXToFinishLine(this.container2, speed);
      }
    });
  }

  private slit: Phaser.GameObjects.Rectangle[] = [];

  createSlit() {
    const slitLeftPart = this.add.rectangle(
      0,
      this.camera.height / 2,
      this.camera.width / 2 - this.symbolWidth / 2,
      this.symbolWidth,
      0x000000
    );
    slitLeftPart.setOrigin(0, 0.5);
    const slitRightPart = this.add.rectangle(
      this.camera.width / 2 + this.symbolWidth / 2,
      this.camera.height / 2,
      this.camera.width / 2 - this.symbolWidth / 2,
      this.symbolWidth,
      0x000000
    );
    slitRightPart.setOrigin(0, 0.5);
    this.slit.push(slitLeftPart);
    this.slit.push(slitRightPart);
  }

  private debugGraphics: Phaser.GameObjects.Graphics[] = [];

  private createIndicatorLines() {
    const indicatorLinesY = this.camera.height / 2;
    this.startLine = new IndicatorLine(this, 0, indicatorLinesY);
    this.finishLine = new IndicatorLine(
      this,
      this.camera.width,
      indicatorLinesY
    );

    const centerPointX =
      (this.finishLine.x - this.startLine.x) / 2 + this.startLine.x;
    this.payLine = new IndicatorLine(this, centerPointX, indicatorLinesY);
  }

  alignContainers() {
    const leftMostContainer = this.getLeftMostContainer();
    this.placeContainerBehindOther(leftMostContainer);
  }
  redrawDebugGraphics() {
    this.children.remove(this.debugGraphics);
    this.debugGraphics = [];
    this.debugGraphics.push(this.drawContainerOutlines(this.container1));
    this.debugGraphics.push(this.drawContainerOutlines(this.container2));
  }

  drawContainerOutlines(container: Phaser.GameObjects.Container) {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.strokeRect(
      container.getBounds().x,
      container.getBounds().y,
      container.getBounds().width,
      container.getBounds().height
    );
    return graphics;
  }
  createContainerWithSymbols(x: number, y: number) {
    const container = this.add.container(x, y);
    for (let i = 0; i < this.symbols.length; i++) {
      const symbolImage = this.add.image(
        i * (this.symbolWidth + this.spacing),
        0,
        this.symbols[i]
      );
      container.add(symbolImage);
    }

    return container;
  }

  getRightMostContainer() {
    return this.container1.getBounds().right > this.container2.getBounds().right
      ? this.container1
      : this.container2;
  }

  getLeftMostContainer() {
    return this.container1.getBounds().left < this.container2.getBounds().left
      ? this.container1
      : this.container2;
  }

  private spinCounter = 0;
  private spinCountMax = 10;

  isSpinning() {
    return (
      this.tweens.isTweening(this.container1) ||
      this.tweens.isTweening(this.container2)
    );
  }
  stopSpinner() {
    this.tweens.killAll();
  }

  private spinnerStopTimer: Phaser.Time.TimerEvent | null = null;

  animateXToFinishLine(container: Phaser.GameObjects.Container, speed: number) {
    const distance =
      this.finishLine.getBounds().left - container.getBounds().left;
    const duration = Math.round(distance / speed);

    // TODO: reuse tween
    this.tweens.add({
      targets: container,
      x: "+=" + distance,
      duration,
      ease: "linear",
      onComplete: () => {
        this.spinCounter++;
        if (this.spinCounter >= this.spinCountMax && !this.spinnerStopTimer) {
          const randomDelay = Phaser.Math.Between(1000, 3000);
          this.spinnerStopTimer = this.time.delayedCall(randomDelay, () => {
            this.stopSpinner();
            this.spinCounter = 0;
            this.spinnerStopTimer = null;
            this.alignContainers();
            this.redrawDebugGraphics();
          });
        }

        this.placeContainerBehindOther(container);

        this.animateXToFinishLine(container, speed);
      },
    });
  }
  placeContainerBehindOther(container: Phaser.GameObjects.Container) {
    const leftMostContainer =
      this.container1 === container ? this.container2 : this.container1;
    container.setX(
      leftMostContainer.x - container.getBounds().width - this.spacing
    );

    container.setX(
      leftMostContainer.getBounds().left -
        container.getBounds().width +
        this.symbolWidth / 2 -
        this.spacing
    );
  }
}
