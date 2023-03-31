import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import {
  ESocketEventNames,
  TClientToServerEvents,
  TServerToClientEvents,
} from "common/src/types";
import {
  ECursorKey,
  processPlayerInput,
  TPlayerInput,
  PLAYER_VELOCITY,
} from "common/src/modules/player";
import { gameConfig } from "./gui";

import { Player, PlayersManager } from "./player";
import { preloadMapAssets, createMap } from "./map";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

export default class GameScene extends Phaser.Scene {
  private socket?: Socket<TServerToClientEvents, TClientToServerEvents>;
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  private playersManager?: PlayersManager;
  private playerId?: string;
  private player?: Player;

  private inputSequenceNumber = 0;
  private pendingInputs: TPlayerInput[] = [];

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    Player.preloadAssets(this);
    preloadMapAssets(this);
  }

  public create(): void {
    Player.loadAssets(this);

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.socket = io(process.env.SOCKET_SERVER_URL);

    this.playersManager = new PlayersManager({ scene: this });

    const collidingLayer = createMap(this);

    this.socket.on(ESocketEventNames.GameUpdate, (update) => {
      if (!gameConfig.serverSideProcessing) return;

      if (update.type === "INITIAL_GAME_STATE") {
        this.playersManager?.initializePlayers(update.playerId, update.players);

        // Initialize current player
        this.playerId = update.playerId;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.player = this.playersManager!.currentPlayer!;

        this.physics.add.collider(collidingLayer, this.player);
      } else if (update.type === "GAME_STATE") {
        this.playersManager?.updatePlayers(update.players);

        if (gameConfig.serverReconciliation) {
          const lastProcessedInput =
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            update.players[this.playerId!].lastProcessedInput;
          this.pendingInputs.forEach((input) => {
            if (input.inputNumber <= lastProcessedInput) {
              this.pendingInputs.shift();
            } else {
              const newPosition = processPlayerInput(
                { x: this.player?.x, y: this.player?.y },
                input
              );
              this.player?.setPosition(newPosition.x, newPosition.y);
            }
          });
        } else {
          this.pendingInputs = [];
        }
      } else if (update.type === "PLAYER_JOINED") {
        this.playersManager?.addPlayer(update.playerId, update.player);
      } else if (update.type === "PLAYER_LEFT") {
        this.playersManager?.removePlayer(update.playerId);
      }
    });
  }

  public update(time: number, delta: number): void {
    /*
    Handle input (sends input messages to server)
    Update position (using client prediction)
    Move the other clients based on the server position (interpolation)
    Draw players on canvas
    */

    if (!this.player) return;

    // Stop any previous movement from the last frame
    this.player.setVelocity(0);

    let key: ECursorKey | undefined;

    if (this.cursorKeys?.up.isDown) {
      key = ECursorKey.UP;
    } else if (this.cursorKeys?.down.isDown) {
      key = ECursorKey.DOWN;
    } else if (this.cursorKeys?.left.isDown) {
      key = ECursorKey.LEFT;
    } else if (this.cursorKeys?.right.isDown) {
      key = ECursorKey.RIGHT;
    }

    this.player.updateAnimation(key);

    if (key) {
      const input: TPlayerInput = {
        key,
        timeDelta: delta,
        inputNumber: this.inputSequenceNumber,
      };

      if (gameConfig.clientSidePrediction) {
        this.player.setVelocityX(
          key === ECursorKey.LEFT
            ? -PLAYER_VELOCITY
            : key === ECursorKey.RIGHT
            ? PLAYER_VELOCITY
            : 0
        );
        this.player.setVelocityY(
          key === ECursorKey.UP
            ? -PLAYER_VELOCITY
            : key === ECursorKey.DOWN
            ? PLAYER_VELOCITY
            : 0
        );
      }

      if (gameConfig.serverSideProcessing) {
        setTimeout(() => {
          this.socket?.emit(ESocketEventNames.PlayerPositionUpdate, input);
        }, gameConfig.lag || 0);

        this.inputSequenceNumber++;

        if (gameConfig.serverReconciliation) {
          this.pendingInputs.push(input);
        }
      }
    }
  }
}