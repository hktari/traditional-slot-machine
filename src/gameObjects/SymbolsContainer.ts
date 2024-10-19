import { DebugUtils } from "../utils/DebugUtils";
import IndicatorLine from "./IndicatorLine";
import { SlotMachineReelAnimationPreferences } from "./SlotMachineReel";

export default class SymbolsContainer extends Phaser.GameObjects.Container {
  static symbolWidth: number = 100;
  static symbolHeight: number = 100;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private spacing: number,
    private symbols: string[],
    private animationPreferences: SlotMachineReelAnimationPreferences
  ) {
    super(scene, x, y);

    this._addSymbols(symbols);

    const debugUtils = DebugUtils.getInstance(scene);
    debugUtils.addContainer(this);

    scene.add.existing(this);
  }

  animateAlignSymbolToYPosition(symbolName: string, y: number) {
    const symbol = this._findSymbol(symbolName);

    const offsetFromSymbolToPayline =
      y - symbol.y + SymbolsContainer.symbolHeight / 2;

    const durationUntilSymbolReachesPayline =
      Math.abs(offsetFromSymbolToPayline) / this.animationPreferences.speed;

    return this.scene.tweens.add({
      targets: this,
      y: "+=" + offsetFromSymbolToPayline,
      duration: durationUntilSymbolReachesPayline,
      ease: "Elastic",
      easeParams: [1.5, 1],
    });
  }

  private _findSymbol(symbolName: string): Phaser.GameObjects.Image {
    const symbol = this.list.find(
      (child): child is Phaser.GameObjects.Image =>
        (child as Phaser.GameObjects.Image).texture.key === symbolName
    );

    if (!symbol) {
      throw new Error("Symbol not found. Make sure the symbolName is correct");
    }
    return symbol;
  }

  animateAlignTopToYPosition(y: number) {
    const distanceToFinishLine = y - this.y + SymbolsContainer.symbolHeight / 2;
    const duration = distanceToFinishLine / this.animationPreferences.speed;

    return this.scene.tweens.add({
      targets: this,
      y: "+=" + distanceToFinishLine,
      duration,
      ease: "linear",
    });
  }

  private _addSymbols(symbols: string[]) {
    const symbolsCount = symbols.length;
    for (let i = 0; i < symbolsCount; i++) {
      const symbol = this.scene.add.image(
        0,
        i * (SymbolsContainer.symbolHeight + this.spacing),
        symbols[i]
      );
      this.add(symbol);
    }
  }

  placeAboveOf(other: Phaser.GameObjects.Container) {
    this.setX(other.x);
    this.setY(
      other.getBounds().top -
        this.getBounds().height +
        SymbolsContainer.symbolHeight / 2 -
        this.spacing
    );
  }

  placeBelowOf(other: Phaser.GameObjects.Container) {
    this.setX(other.x);
    this.setY(
      other.getBounds().bottom +
        this.getBounds().height -
        SymbolsContainer.symbolHeight / 2 +
        this.spacing
    );
  }
}
