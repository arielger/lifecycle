import Phaser from "phaser";
import { io } from "socket.io-client";

import { SocketEventNames } from "../../../server/src/types";

import { renderPlayer, removePlayer } from "./players";

import skeletonSpritesheet from "url:../assets/characters/skeleton.png";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};
export default class GameScene extends Phaser.Scene {
  // @TODO: Add types
  private player;
  private socket;
  private players;
  private cursorKeys;

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    this.load.spritesheet("skeleton", skeletonSpritesheet, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  public create(): void {
    // reference https://phaser.io/examples/v3/view/animation/create-animation-from-sprite-sheet#
    this.anims.create({
      key: "walkDown",
      frames: this.anims.generateFrameNumbers("skeleton", {
        frames: [0, 4, 8, 12],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "walkUp",
      frames: this.anims.generateFrameNumbers("skeleton", {
        frames: [1, 5, 9, 13],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "walkLeft",
      frames: this.anims.generateFrameNumbers("skeleton", {
        frames: [2, 6, 10, 14],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "walkRight",
      frames: this.anims.generateFrameNumbers("skeleton", {
        frames: [3, 7, 11, 15],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.players = this.physics.add.group();

    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.socket = io(process.env.SOCKET_SERVER_URL);

    this.socket.on("connect", () => {
      console.log("Socket connected!");
    });

    const handleNewPlayers = (players) => {
      for (const playerId in players) {
        renderPlayer(this, playerId, players[playerId]);
      }
    };

    this.socket.on(SocketEventNames.AllPlayers, handleNewPlayers);
    this.socket.on(SocketEventNames.PlayerConnected, handleNewPlayers);

    this.socket.on(SocketEventNames.PlayersUpdates, (players) => {
      // @TODO: Improve performance
      for (const playerId in players) {
        this.players.getChildren().forEach(function (player) {
          if (player.id === playerId) {
            if (
              players[playerId].pos[0] > player.x &&
              player.anims.currentAnim.key !== "walkRight"
            ) {
              player.play("walkRight");
            } else if (
              players[playerId].pos[0] < player.x &&
              player.anims.currentAnim.key !== "walkLeft"
            ) {
              player.play("walkLeft");
            } else if (
              players[playerId].pos[1] > player.y &&
              player.anims.currentAnim.key !== "walkDown"
            ) {
              player.play("walkDown");
            } else if (
              players[playerId].pos[1] < player.y &&
              player.anims.currentAnim.key !== "walkUp"
            ) {
              player.play("walkUp");
            }

            player.setPosition(
              players[playerId].pos[0],
              players[playerId].pos[1]
            );
          }
        });
      }
    });

    this.socket.on(SocketEventNames.PlayerDisconnected, (playerId) => {
      removePlayer(this, playerId);
    });
  }

  public update(): void {
    const input = { x: 0, y: 0 };
    if (this.cursorKeys.up.isDown) {
      input.y = -1;
    } else if (this.cursorKeys.down.isDown) {
      input.y = 1;
    } else if (this.cursorKeys.left.isDown) {
      input.x = -1;
    } else if (this.cursorKeys.right.isDown) {
      input.x = 1;
    }

    if (input.x !== 0 || input.y !== 0) {
      this.socket.emit(SocketEventNames.PlayerPositionUpdate, input);
    }
  }
}
