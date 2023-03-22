import Phaser from "phaser";

import GameScene from "./scenes/game";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
  },
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  parent: document.getElementById("game")!,
  width: 250,
  height: 250,
  scene: GameScene,
  pixelArt: true,
  zoom: 4,
};

new Phaser.Game(config);
