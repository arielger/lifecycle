import Phaser from "phaser";

import GameScene from "./scenes/game";
import MenuScene from "./scenes/menu";
import UIScene from "./scenes/ui/scene";
import { resolution } from "./resolution";

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
    width: resolution.width,
    height: resolution.height,
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
  },
  scene: [MenuScene, GameScene, UIScene],
  pixelArt: true,
  dom: {
    // required for inputtext-plugin
    // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/inputtext/#import-class
    createContainer: true,
  },
};

new Phaser.Game(config);
