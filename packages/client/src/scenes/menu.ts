import Phaser from "phaser";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Menu",
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const titleText = this.add
      .text(screenCenterX, screenCenterY, "Lifecycle", {
        fontFamily: "Sabo",
        fontSize: "32px",
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(screenCenterX, screenCenterY + 50, "Start", {
        fontFamily: "Sabo",
        fontSize: "16px",
        color: "#ffe724",
      })
      .setOrigin(0.5);

    startButton.setInteractive({ useHandCursor: true });

    startButton.on("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
