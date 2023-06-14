import { PLAYER_INITIAL_HEALTH } from "@lifecycle/common/src/modules/player";

import { Scenes } from "../../types";
import { GameSceneEvents } from "../game";
import { HealthBarUI } from "./healthbar";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  key: Scenes.UI,
  active: false,
  visible: false,
};

export default class UIScene extends Phaser.Scene {
  private healthBarUI?: HealthBarUI;

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    HealthBarUI.preloadAssets(this);
  }

  public create(): void {
    const gameScene = this.scene.get(Scenes.GAME);

    gameScene.events.on(GameSceneEvents.INITIALIZE_HEALTHBAR, () => {
      // If game is restarting we shouldn't initialize the healthbar again
      this.healthBarUI =
        this.healthBarUI ||
        new HealthBarUI({
          scene: this,
          health: PLAYER_INITIAL_HEALTH,
        });
    });

    gameScene.events.on(
      GameSceneEvents.UPDATE_HEALTH_VALUE,
      (health: number) => {
        this.healthBarUI?.updateHealth(health);
      }
    );
  }
}
