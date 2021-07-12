import Phaser from "phaser";

import GameScene from "./scenes/game";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
  },
  // @TODO: Review how to adapt to changing viewport size
  width: 500,
  height: 500,
  scene: GameScene,
};

new Phaser.Game(config);
