import { PLAYER_INITIAL_HEALTH } from "@lifecycle/common/src/modules/player";

import { Scenes } from "../../types";
import { GameSceneEvents } from "../game";
import { HealthBarUI } from "./healthbar";
import { PlayerCountUI } from "./player-count";
import { ChatUI } from "./chat";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  key: Scenes.UI,
  active: false,
  visible: false,
};

export default class UIScene extends Phaser.Scene {
  private healthBarUI?: HealthBarUI;
  private playerCountUI?: PlayerCountUI;
  private chatUI?: ChatUI;

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    HealthBarUI.preloadAssets(this);
  }

  public create(): void {
    const gameScene = this.scene.get(Scenes.GAME);

    this.chatUI = new ChatUI({
      scene: this,
    });

    gameScene.events.on(GameSceneEvents.PLAYER_JOINED, (playerName: string) => {
      this.chatUI?.addMessage(`${playerName} joined the game`);
    });

    gameScene.events.on(GameSceneEvents.PLAYER_LEFT, (playerName: string) => {
      this.chatUI?.addMessage(`${playerName} left the game`);
    });

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

    gameScene.events.on(
      GameSceneEvents.INITIALIZE_PLAYER_COUNT,
      (playerCount: number) => {
        this.playerCountUI = new PlayerCountUI({
          scene: this,
          playerCount,
        });
      }
    );

    gameScene.events.on(
      GameSceneEvents.UPDATE_PLAYER_COUNT,
      (playerCount: number) => {
        this.playerCountUI?.updatePlayerCount(playerCount);
      }
    );
  }
}
