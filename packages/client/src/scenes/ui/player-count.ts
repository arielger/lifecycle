export class PlayerCountUI {
  scene: Phaser.Scene;
  playerCount: number;
  text: Phaser.GameObjects.Text;

  constructor({
    scene,
    playerCount,
  }: {
    scene: Phaser.Scene;
    playerCount: number;
  }) {
    this.scene = scene;
    this.playerCount = playerCount;

    this.text = this.scene.add.text(100, 100, `Players: ${this.playerCount}`);
  }

  public updatePlayerCount(playerCount: number): void {
    this.playerCount = playerCount;
    this.text.setText(`Players: ${this.playerCount}`);
  }
}
