import { Scene } from "phaser";

export class DebugUtils {
  private scene: Scene;
  private debugGraphics: Phaser.GameObjects.Graphics[] = [];
  private containers: Phaser.GameObjects.Container[] = [];
  private static instance: DebugUtils;

  static getInstance(scene: Scene): DebugUtils {
    if (!DebugUtils.instance) {
      DebugUtils.instance = new DebugUtils(scene);
    }
    return DebugUtils.instance;
  }
  constructor(scene: Scene) {
    this.scene = scene;
  }

  addContainer(container: Phaser.GameObjects.Container) {
    this.containers.push(container);
  }

  redrawDebugOutlines() {
    this.debugGraphics.forEach((graphic) => graphic.destroy());
    this.debugGraphics = [];

    this.containers.forEach((container) => {
      this.drawDebugOutlinesForContainerRecursively(container, 5);
    });
  }

  private drawDebugOutlinesForContainerRecursively(
    gameObject: Phaser.GameObjects.Container,
    depth: number
  ) {
    if (depth <= 0) {
      return;
    }

    const imageColor = 0xffaa33;
    const containerColorsByDepth = [
      0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00, 0x00ffff,
    ];
    const color = containerColorsByDepth[depth - 1];

    const bounds = gameObject.getBounds();
    this.drawDebug(color, bounds);

    gameObject.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Container) {
        this.drawDebugOutlinesForContainerRecursively(child, depth - 1);
      } else if (child instanceof Phaser.GameObjects.Image) {
        const childBounds = child.getBounds();
        this.drawDebug(imageColor, childBounds);
      }
    });
  }

  private drawDebug(color: number, bounds: Phaser.Geom.Rectangle) {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, color, 1);
    graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.debugGraphics.push(graphics);
    return graphics;
  }
}
