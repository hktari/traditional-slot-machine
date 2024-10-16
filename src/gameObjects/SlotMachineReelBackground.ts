import { SlotMachineReelAnimationPreferences } from "../scenes/Game";

export default class SlotMachineReelBackground extends Phaser.GameObjects
  .Image {
  private initalY = 0;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "reelBg");
    this.initalY = y;
    scene.add.existing(this);
    this.setVisible(false);
  }

  spin({
    revolutionsCount,
    singleRevolutionDurationMs,
  }: SlotMachineReelAnimationPreferences) {
    this.setVisible(true);

    const { height } = this.getBounds();

    this.scene.tweens.chain({
      targets: this,
      tweens: [
        {
          y: this.initalY + height,
          duration: singleRevolutionDurationMs,
          ease: "linear",
        },
        {
          y: this.initalY,
          duration: 0,
          ease: "linear",
        },
      ],
      onComplete: () => {
        this.setVisible(false);
      },
      repeat: revolutionsCount,
    });
  }
}
