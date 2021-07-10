import Phaser from "phaser";

import GameScene from "./scenes/game";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
  },
  // @TODO: Review how to adapt to changing viewport size
  width: window.innerWidth,
  height: window.innerHeight,
  scene: GameScene,
};

new Phaser.Game(config);
