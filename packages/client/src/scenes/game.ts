import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import {
  ESocketEventNames,
  TClientToServerEvents,
  TServerToClientEvents,
} from "@lifecycle/common/src/types";
import {
  ECursorKey,
  getPlayerNewPosition,
  TPlayerInput,
} from "@lifecycle/common/src/modules/player";
import { MAP_SIZE } from "@lifecycle/common/src/modules/map";
import { gameConfig } from "./gui";

import { Player, PlayersManager } from "./player";
import { preloadMapAssets, createMap } from "./map";
import { HeartsUI } from "./hearts";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

export default class GameScene extends Phaser.Scene {
  private socket?: Socket<TServerToClientEvents, TClientToServerEvents>;

  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keySpace!: Phaser.Input.Keyboard.Key;

  private playersManager?: PlayersManager;
  private playerId?: string;
  private player?: Player;

  private heartsUI?: HeartsUI;

  private inputSequenceNumber = 0;
  private pendingInputs: TPlayerInput[] = [];

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    Player.preloadAssets(this);
    HeartsUI.preloadAssets(this);
    preloadMapAssets(this);
  }

  public create(): void {
    Player.loadAssets(this);

    this.socket = io(process.env.SOCKET_SERVER_URL);

    this.playersManager = new PlayersManager({ scene: this });

    // Input
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Map configuration
    const collidingLayers = createMap(this);
    this.cameras.main.setBounds(0, 0, MAP_SIZE.width, MAP_SIZE.height);
    this.physics.world.setBounds(0, 0, MAP_SIZE.width, MAP_SIZE.height);

    this.socket.on(ESocketEventNames.GameUpdate, (update) => {
      if (!gameConfig.serverSideProcessing) return;

      if (update.type === "INITIAL_GAME_STATE") {
        this.playersManager?.initializePlayers(update.playerId, update.players);

        // Initialize current player
        this.playerId = update.playerId;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.player = this.playersManager!.currentPlayer!;

        collidingLayers.forEach((collidingLayer) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.physics.add.collider(collidingLayer, this.player!);
        });

        this.player.body.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        this.heartsUI = new HeartsUI({
          scene: this,
          health: this.player.health,
        });
      } else if (update.type === "GAME_STATE") {
        this.playersManager?.updatePlayers(update.players);

        this.heartsUI?.updateHealth(this.player!.health);

        if (gameConfig.serverReconciliation) {
          const lastProcessedInput =
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            update.players[this.playerId!].lastProcessedInput;
          this.pendingInputs.forEach((input) => {
            if (input.inputNumber <= lastProcessedInput) {
              this.pendingInputs.shift();
            } else {
              const newPosition = getPlayerNewPosition(
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

    const keys: ECursorKey[] = [];

    // Movement handling
    if (this.cursorKeys?.up.isDown) {
      keys.push(ECursorKey.UP);
    } else if (this.cursorKeys?.down.isDown) {
      keys.push(ECursorKey.DOWN);
    } else if (this.cursorKeys?.left.isDown) {
      keys.push(ECursorKey.LEFT);
    } else if (this.cursorKeys?.right.isDown) {
      keys.push(ECursorKey.RIGHT);
    }

    // Attack handling
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      keys.push(ECursorKey.SPACE);
    }

    this.player.update({ keys });

    if (keys.length > 0) {
      const input: TPlayerInput = {
        keys,
        timeDelta: delta,
        inputNumber: this.inputSequenceNumber,
      };

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
