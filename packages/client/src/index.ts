import Phaser from "phaser";

import GameScene from "./scenes/game";
import MenuScene from "./scenes/menu";

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
    width: 480,
    height: 240,
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
  },
  scene: [MenuScene, GameScene],
  pixelArt: true,
};

new Phaser.Game(config);
