import Phaser from "phaser";

import GameScene from "./scenes/game";
import MenuScene from "./scenes/menu";
import UIScene from "./scenes/ui/scene";
import { resolution } from "./config";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  scale: {
    width: resolution.originalWidth * resolution.zoom,
    height: resolution.originalHeight * resolution.zoom,
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
  },
  scene: [MenuScene, GameScene, UIScene],
  pixelArt: true,
};

new Phaser.Game(config);
