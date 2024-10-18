export default class IndicatorLine extends Phaser.GameObjects.Rectangle {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 5,
    height: number = 100,
    color: number = 0x00ddff,
    alpha: number = 1
  ) {
    super(scene, x, y, width, height, color, alpha);
    this.setDepth(1000);
    scene.add.existing(this);
  }
}
