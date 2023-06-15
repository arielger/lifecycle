import { GameAssets } from "../../types";

export class PlayerCountUI {
  scene: Phaser.Scene;
  playerCount: number;
  text: Phaser.GameObjects.BitmapText;

  constructor({
    scene,
    playerCount,
  }: {
    scene: Phaser.Scene;
    playerCount: number;
  }) {
    this.scene = scene;
    this.playerCount = playerCount;

    this.text = this.scene.add
      .bitmapText(8, 60, GameAssets.TYPOGRAPHY, `PLAYERS: ${this.playerCount}`)
      .setTintFill(0xffffff);
  }

  public updatePlayerCount(playerCount: number): void {
    this.playerCount = playerCount;
    this.text.setText(`PLAYERS: ${this.playerCount}`);
  }
}
