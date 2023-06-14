import Phaser from "phaser";

import MonogramFontPNG from "url:../assets/fonts/monogram.png";
import MonogramFontXML from "url:../assets/fonts/monogram.xml";
import { getScreenCenter } from "../utils/text";
import { GameAssets, Scenes } from "../types";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: Scenes.MENU,
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    this.load.bitmapFont(
      GameAssets.TYPOGRAPHY,
      MonogramFontPNG,
      MonogramFontXML
    );
  }

  public create(): void {
    const screenCenter = getScreenCenter(this);

    this.add
      .bitmapText(
        screenCenter.x,
        screenCenter.y,
        GameAssets.TYPOGRAPHY,
        "PIXELCYCLE"
      )
      .setOrigin(0.5)
      .setTintFill(0xffffff);

    const startButton = this.add
      .bitmapText(
        screenCenter.x,
        screenCenter.y + 30,
        GameAssets.TYPOGRAPHY,
        "START"
      )
      .setOrigin(0.5)
      .setTintFill(0xffff00);

    startButton.setInteractive({ useHandCursor: true });

    startButton.on("pointerdown", () => {
      this.scene.start(Scenes.GAME);
      this.scene.launch(Scenes.UI);
    });
  }
}
