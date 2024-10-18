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

    this.createSlit(
      this.camera.width / 2,
      this.camera.height / 2,
      this.symbolWidth,
      100
    );

    this.container1 = this.createContainerWithSymbols(0, 0);

    this.container2 = this.createContainerWithSymbols(0, 0);
    this.setContainerInitialPositions();

    const speed = 3;

    // TODO: refactor
    this.slit.forEach((slit) => slit.setToTop());
    [this.startLine, this.finishLine, this.payLine].forEach((line) =>
      line.setToTop()
    );

    this.redrawDebugOutlines();

    this.input.on("pointerdown", () => {
      if (!this.isSpinning()) {
        this.animateXToFinishLine(this.container1, speed);
        this.animateXToFinishLine(this.container2, speed);
      }
    });
  }

  private slit: Phaser.GameObjects.Rectangle[] = [];

  createSlit(x: number, y: number, width: number, height: number) {
    const slitLeftPart = this.add.rectangle(
      0,
      y,
      x - width / 2,
      height,
      0x000000
    );
    slitLeftPart.setOrigin(0, 0.5);
    const slitRightPart = this.add.rectangle(
      x + this.symbolWidth / 2,
      y,
      x - this.symbolWidth / 2,
      height,
      0x000000
    );
    slitRightPart.setOrigin(0, 0.5);
    this.slit.push(slitLeftPart);
    this.slit.push(slitRightPart);

    this.createIndicatorLines({
      startX: slitLeftPart.getBounds().right,
      finishX: slitRightPart.getBounds().left,
      y,
    });
  }

  private debugGraphics: Phaser.GameObjects.Graphics[] = [];

  private createIndicatorLines({
    startX,
    finishX,
    y,
  }: {
    startX: number;
    finishX: number;
    y: number;
  }) {
    this.startLine = new IndicatorLine(this, startX, y);
    this.finishLine = new IndicatorLine(this, finishX, y);

    const centerPointX = (finishX - startX) / 2 + startX;
    this.payLine = new IndicatorLine(this, centerPointX, y);
  }

  /**
   * Aligns the containers so that the leftmost container is placed behind the rightmost container
   */
  alignContainers() {
    const leftMostContainer = this.getLeftMostContainer();
    this.placeContainerBehindOther(leftMostContainer);
  }

  redrawDebugOutlines() {
    this.debugGraphics.forEach((graphic) => graphic.destroy());
    this.debugGraphics = [];
    const containerColor = 0x00ff00;
    const symbolColor = 0xff00ff;

    [this.container1, this.container2].forEach((container) => {
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
    const graphics = this.add.graphics();
    graphics.lineStyle(2, color, 1);
    const bounds = gameObject.getBounds();
    graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.debugGraphics.push(graphics);
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
  private spinCountMax = 11;

  isSpinning() {
    return (
      this.tweens.isTweening(this.container1) ||
      this.tweens.isTweening(this.container2)
    );
  }

  private spinnerStopTimer: Phaser.Time.TimerEvent | null = null;

  animateXToFinishLine(container: Phaser.GameObjects.Container, speed: number) {
    const distanceToFinishLine =
      this.finishLine.getBounds().left - container.getBounds().left;

    const duration = Math.round(distanceToFinishLine / speed);

    // TODO: reuse tween
    this.tweens.add({
      targets: container,
      x: "+=" + distanceToFinishLine,
      duration,
      ease: "linear",
      // TODO: extract onComplete
      onComplete: () => {
        this.spinCounter++;
        if (this.spinCounter >= this.spinCountMax && !this.spinnerStopTimer) {
          // const randomDelay = Phaser.Math.Between(1000, 3000);
          // this.spinnerStopTimer = this.time.delayedCall(randomDelay, () => {
          this.stopAnimationAndDisplayResult();
          // });
        } else {
          this.placeContainerBehindOther(container);

          this.animateXToFinishLine(container, speed);
        }
      },
    });
  }
  stopAnimationAndDisplayResult() {
    this.stopAnimations();
    this.spinCounter = 0;
    // TODO: needed ?
    this.spinnerStopTimer = null;
    // After the animation has stopped. The spacing between the containers is not correct
    this.alignContainers();
    this.redrawDebugOutlines();
  }
  stopAnimations() {
    // TODO: forward animation so that the image center aligns with the payline

    this.tweens.killAll();
  }

  setContainerInitialPositions() {
    // TODO: position container1 so that its right most symbols aligns with the payline
    this.container1.setX(this.payLine.x);
    this.container1.setY(this.payLine.y);
    const rightMostSymbol = this.container1.getAt(
      this.container1.list.length - 1
    ) as Phaser.GameObjects.Image;
    const translate = this.payLine.x - rightMostSymbol.getCenter().x;
    this.container1.setX(this.container1.x - translate);

    // this.placeContainerBehindOther(this.container2);
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
    container.setY(leftMostContainer.y);
  }
}
