import Phaser from "phaser";

import GameScene from "./scenes/game";

const viewSize = 360;
const maxDimension =
  window.innerWidth > window.innerHeight ? "width" : "height";

const aspectRatio = window.innerWidth / window.innerHeight;

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
    // @TODO: Review how to handle scaling -> screens with same width and height will see more of the map
    width: maxDimension === "width" ? viewSize : viewSize * aspectRatio,
    height: maxDimension === "height" ? viewSize : viewSize / aspectRatio,
    mode: Phaser.Scale.FIT,
    parent: "game",
  },
  scene: GameScene,
  pixelArt: true,
};

new Phaser.Game(config);
