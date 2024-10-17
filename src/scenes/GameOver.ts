import { Scene } from "phaser";

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

  constructor() {
    super("GameOver");
  }

  private spacing = 10;
  private rectangleWidth = 50;
  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xaabb00);

    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    this.finishLine = this.add.rectangle(675, 384, 5, 50, 0x00aa44, 0.8);
    this.startLine = this.add.rectangle(175, 384, 5, 50, 0x44aa00, 0.8);

    this.container1 = this.add.container(
      this.startLine.x + this.rectangleWidth / 2,
      this.startLine.y
    );
    for (let i = 0; i < 5; i++) {
      const rectangle = this.add.rectangle(
        i * (this.rectangleWidth + 10),
        0,
        this.rectangleWidth,
        this.rectangleWidth,
        0xaa0044,
        1
      );
      this.container1.add(rectangle);
    }

    this.container2 = this.add.container(this.startLine.x, this.startLine.y);

    for (let i = 0; i < 5; i++) {
      const rectangle = this.add.rectangle(
        i * (this.rectangleWidth + this.spacing),
        0,
        this.rectangleWidth,
        this.rectangleWidth,
        0xaa4400,
        1
      );
      this.container2.add(rectangle);
    }
    this.container2.setX(
      this.container1.getBounds().left -
        this.container2.getBounds().width +
        this.rectangleWidth / 2 -
        this.spacing
    );

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.strokeRect(
      this.container1.getBounds().x,
      this.container1.getBounds().y,
      this.container1.getBounds().width,
      this.container1.getBounds().height
    );

    const speed = 0.1;

    this.input.once("pointerdown", () => {
      this.animateXToFinishLine(this.container1, speed);
      this.animateXToFinishLine(this.container2, speed);
    });
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

  animateXToFinishLine(container: Phaser.GameObjects.Container, speed: number) {
    const distance = this.finishLine.x - container.x;
    const duration = distance / speed;

    this.tweens.add({
      targets: container,
      x: this.finishLine.x + this.rectangleWidth / 2,
      duration,
      ease: "linear",
      onComplete: () => {
        const otherContainer = this.getLeftMostContainer();
        container.setX(otherContainer.x - container.getBounds().width  - this.spacing);
        this.animateXToFinishLine(container, speed);
      }
    });
  }
}
