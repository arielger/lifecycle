import Phaser from "phaser";
import { io } from "socket.io-client";

import { SocketEventNames } from "../../../server/src/types";

import { renderPlayer, removePlayer } from "./players";

import playerSprite from "url:../assets/characters/player.png";

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
    this.player = this.load.spritesheet("player", playerSprite, {
      frameWidth: 16,
      frameHeight: 32,
    });
  }

  public create(): void {
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
    } else {
      input.y = 0;
    }

    if (this.cursorKeys.left.isDown) {
      input.x = -1;
    } else if (this.cursorKeys.right.isDown) {
      input.x = 1;
    } else {
      input.x = 0;
    }

    if (input.x !== 0 || input.y !== 0) {
      this.socket.emit(SocketEventNames.PlayerPositionUpdate, input);
    }
  }
}
