import Phaser from "phaser";
import InputText from "phaser3-rex-plugins/plugins/inputtext.js";

import { randomInt } from "@lifecycle/common/src/utils/numbers";

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
  nameInput?: InputText;

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

    this.nameInput = new InputText(
      this,
      screenCenter.x,
      screenCenter.y + 30,
      300,
      16,
      {
        text: `PLAYER_${randomInt(1, 999)}`,
        align: "center",
        fontSize: "16px",
        maxLength: 14,
      }
    );
    this.add.existing(this.nameInput);

    this.nameInput.setFocus();

    const startButton = this.add
      .bitmapText(
        screenCenter.x,
        screenCenter.y + 60,
        GameAssets.TYPOGRAPHY,
        "START"
      )
      .setOrigin(0.5)
      .setTintFill(0xffff00);

    startButton.setInteractive({ useHandCursor: true });

    startButton.on("pointerdown", () => {
      this.scene.start(Scenes.GAME, { playerName: this.nameInput?.text });
      this.scene.launch(Scenes.UI);
    });
  }
}
