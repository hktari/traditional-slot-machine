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

  private readonly symbolWidth = 100;

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
    "slotSymbol5",
  ];

  private spacing = 10;
  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xaabb00);

    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    this.finishLine = this.add.rectangle(
      (this.camera.width * 2) / 3,
      384,
      (this.camera.width * 1) / 3,
      50,
      0x000000,
      1
    );
    this.finishLine.setOrigin(0, 0.5);

    this.startLine = this.add.rectangle(
      0,
      384,
      (this.camera.width * 1) / 3,
      50,
      0x000000,
      1
    );

    this.startLine.setOrigin(0, 0.5);

    this.container1 = this.createContainerWithSymbols(
      this.startLine.getBounds().right + this.symbolWidth / 2,
      this.startLine.y
    );

    this.container2 = this.createContainerWithSymbols(
      this.startLine.getBounds().right,
      this.startLine.y
    );

    this.container2.setX(
      this.container1.getBounds().left -
        this.container2.getBounds().width +
        this.symbolWidth / 2 -
        this.spacing
    );
    // const graphics = this.add.graphics();
    // graphics.lineStyle(2, 0xff0000, 1);
    // graphics.strokeRect(
    //   this.container1.getBounds().x,
    //   this.container1.getBounds().y,
    //   this.container1.getBounds().width,
    //   this.container1.getBounds().height
    // );

    const speed = 0.1;

    this.startLine.setToTop();
    this.finishLine.setToTop();

    this.input.once("pointerdown", () => {
      this.animateXToFinishLine(this.container1, speed);
      this.animateXToFinishLine(this.container2, speed);
    });
  }

  createContainerWithSymbols(x: number, y: number) {
    const container = this.add.container(x, y);
    for (let i = 0; i < this.symbols.length; i++) {
      const symbolImage = this.add.image(
        i * this.symbolWidth + this.spacing,
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

  animateXToFinishLine(container: Phaser.GameObjects.Container, speed: number) {
    const distance = this.finishLine.getBounds().left - container.x;
    const duration = Math.round(distance / speed);

    this.tweens.add({
      targets: container,
      x: this.finishLine.getBounds().left + this.symbolWidth / 2,
      duration,
      ease: "linear",
      onComplete: () => {
        const otherContainer = this.getLeftMostContainer();
        container.setX(
          otherContainer.x - container.getBounds().width - this.spacing
        );
        this.animateXToFinishLine(container, speed);
      },
    });
  }
}
