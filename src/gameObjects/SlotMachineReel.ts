import { GameObjects, Scene } from "phaser";

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

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private symbols: string[],
    private animationPreferences: SlotMachineReelAnimationPreferences
  ) {
    super(scene, x, y);

    scene.add.existing(this);
  }

  spin(resultSymbol?: string): Promise<string> {
    throw new Error("Method not implemented.");
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
