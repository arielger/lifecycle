import { ScrollablePanel } from "phaser3-rex-plugins/templates/ui/ui-components.js";

import { GameAssets } from "../../types";

// test only
const messagesList = [
  "player 1 joined the game",
  "player 3 left the game",
  "player 1 killed player 1",
];

export class ChatUI {
  scene: Phaser.Scene;

  constructor({ scene }: { scene: Phaser.Scene }) {
    // Reference
    // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-scrollablepanel/
    const panel = new ScrollablePanel(scene, {
      //   x: 16,
      //   y: 900,
      width: 300,
      anchor: {
        left: "0",
        bottom: "0",
      },
      panel: {},
    });
    scene.add.existing(panel);

    messagesList.forEach((message, index) => {
      scene.add
        .bitmapText(16, 900 + index * 32, GameAssets.TYPOGRAPHY, message)
        .setOrigin(0, 0)
        .setTintFill(0xffffff);
    });

    this.scene = scene;
  }

  //     static preloadAssets(scene: Phaser.Scene): void {

  //   }
}
