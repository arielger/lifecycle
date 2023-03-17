import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import {
  ESocketEventNames,
  TClientToServerEvents,
  TServerToClientEvents,
} from "../../../server/src/types";

import { renderPlayer, removePlayer, updatePlayerSprite } from "./players";
import { preloadAssets, loadAssets } from "./assets";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};
export default class GameScene extends Phaser.Scene {
  private socket?: Socket<TServerToClientEvents, TClientToServerEvents>;
  private players?: Phaser.Physics.Arcade.Group;
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerId?: string;

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    preloadAssets(this);
  }

  public create(): void {
    loadAssets(this);
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.players = this.physics.add.group();

    this.socket = io(process.env.SOCKET_SERVER_URL);

    this.socket.on(ESocketEventNames.GameUpdate, (update) => {
      if (update.type === "INITIAL_GAME_STATE") {
        this.playerId = update.playerId;

        for (const playerId in update.players) {
          const player = update.players[playerId];

          renderPlayer(this, playerId, player);
        }
      } else if (update.type === "GAME_STATE") {
        for (const playerToUpdateId in update.players) {
          this.players?.getChildren().forEach(function (player) {
            if (player.id === playerToUpdateId) {
              const currentPosition = {
                x: player.x,
                y: player.y,
              };
              updatePlayerSprite(
                player,
                currentPosition,
                update.players[playerToUpdateId].position
              );
            }
          });
        }
      } else if (update.type === "PLAYER_JOINED") {
        renderPlayer(this, update.playerId, update.player);
      } else if (update.type === "PLAYER_LEFT") {
        removePlayer(this, update.playerId);
      }
    });
  }

  public update(time, delta): void {
    /*
    Handle input (sends input messages to server)
    Update position (using client prediction)
    Move the other clients based on the server position (interpolation)
    Draw players on canvas
    */
    const movement = 0.15 * delta;

    const input = { x: 0, y: 0 };

    if (this.cursorKeys.up.isDown) {
      input.y = -movement;
    } else if (this.cursorKeys.down.isDown) {
      input.y = movement;
    } else if (this.cursorKeys.left.isDown) {
      input.x = -movement;
    } else if (this.cursorKeys.right.isDown) {
      input.x = movement;
    }

    // this.players.getChildren().find((player) => {
    //   if (player.id === this.playerId)
    //     player.setPosition(player.x + input.x, player.y + input.y);
    // });

    if (input.x !== 0 || input.y !== 0) {
      this.socket.emit(ESocketEventNames.PlayerPositionUpdate, input);
    }
  }
}
