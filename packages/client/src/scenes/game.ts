import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import {
  ESocketEventNames,
  TClientToServerEvents,
  TServerToClientEvents,
} from "@lifecycle/common/src/types";
import {
  ECursorKey,
  getPlayerVelocity,
  TPlayerInput,
} from "@lifecycle/common/src/modules/player";
import { MAP_SIZE } from "@lifecycle/common/src/modules/map";
import { getDirectionFromInputKeys } from "@lifecycle/common/src/utils/input";

import { resolution } from "../config";
import { Player, PlayersManager } from "./player";
import { Monster, MonstersManager } from "./monster";
import { preloadMapAssets, createMap } from "./map";
import { gameConfig } from "./ui/config";
import { getScreenCenter } from "../utils/text";
import { GameAssets, Scenes } from "../types";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  key: Scenes.GAME,
  active: false,
  visible: false,
};

export enum GameSceneEvents {
  INITIALIZE_HEALTHBAR = "INITIALIZE_HEALTHBAR",
  UPDATE_HEALTH_VALUE = "UPDATE_HEALTH_VALUE",
  INITIALIZE_PLAYER_COUNT = "INITIALIZE_PLAYER_COUNT",
  UPDATE_PLAYER_COUNT = "UPDATE_PLAYER_COUNT",
}

export default class GameScene extends Phaser.Scene {
  private socket?: Socket<TServerToClientEvents, TClientToServerEvents>;

  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keySpace!: Phaser.Input.Keyboard.Key;

  private playersManager?: PlayersManager;
  private monstersManager?: MonstersManager;
  private playerId?: string;
  private player?: Player;

  /**
   * INITIALIZED - Initial state - wait for initial game state from server
   * IN_PROCESS - Game is in process (server updates coming)
   * PLAYER_DEAD - Player is dead, wait for restart (server updates coming)
   * **/
  private gameState: "INITIALIZED" | "IN_PROCESS" | "PLAYER_DEAD" =
    "INITIALIZED";

  // UI
  private restartOverlay?: Phaser.GameObjects.BitmapText;

  private inputSequenceNumber = 0;
  private pendingInputs: TPlayerInput[] = [];

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    Player.preloadAssets(this);
    Monster.preloadAssets(this);
    preloadMapAssets(this);
  }

  public create({ playerName }: { playerName: string }): void {
    Player.loadAssets(this);
    Monster.loadAssets(this);

    this.socket = io(process.env.SOCKET_SERVER_URL, {
      query: {
        playerName,
      },
    });

    this.playersManager = new PlayersManager({ scene: this });
    this.monstersManager = new MonstersManager({ scene: this });

    // Input
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Map configuration
    createMap(this);
    this.cameras.main.setBounds(0, 0, MAP_SIZE.width, MAP_SIZE.height);
    // @TODO: Review this solution => are we doing more
    // graphic processing when increasing resolution and adding zoom?
    this.cameras.main.setZoom(resolution.zoom);
    this.matter.world.setBounds(0, 0, MAP_SIZE.width, MAP_SIZE.height);

    // UI
    this.createRestartOverlay();

    this.socket.on(ESocketEventNames.GameUpdate, (update) => {
      if (!gameConfig.serverSideProcessing) return;

      if (update.type === "INITIAL_GAME_STATE") {
        this.setRestartOverlayVisibility(false);

        this.gameState = "IN_PROCESS";
        this.playersManager?.initializePlayers(update.playerId, update.players);
        this.monstersManager?.initializeMonsters(update.monsters);

        // Initialize current player
        this.playerId = update.playerId;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.player = this.playersManager!.currentPlayer!;

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        this.events.emit(GameSceneEvents.INITIALIZE_HEALTHBAR);
        this.events.emit(
          GameSceneEvents.INITIALIZE_PLAYER_COUNT,
          Object.keys(update.players).length
        );
      } else if (update.type === "GAME_STATE") {
        // @TODO: Review => we should be sending deltas of game state
        this.playersManager?.updatePlayers({
          playersUpdate: update.players,
          isPlayerAlreadyDead: this.gameState === "PLAYER_DEAD",
          handlePlayerDeath: this.handlePlayerDeath.bind(this),
        });
        this.monstersManager?.updateMonsters(update.monsters);

        this.events.emit(
          GameSceneEvents.UPDATE_HEALTH_VALUE,
          this.player!.health
        );

        if (
          gameConfig.serverReconciliation &&
          this.gameState === "IN_PROCESS"
        ) {
          const lastProcessedInput =
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            update.players[this.playerId!].lastProcessedInput;

          let newPosition = {
            x: this.player!.x,
            y: this.player!.y,
          };

          this.pendingInputs.forEach((input, index) => {
            // Discard inputs already processed by the server
            if (input.inputNumber <= lastProcessedInput) {
              this.pendingInputs.splice(index, 1);
              return;
            }

            const positionDelta = getPlayerVelocity({
              delta: input.timeDelta,
              direction: getDirectionFromInputKeys(input.keys),
            });

            newPosition = {
              x: newPosition.x + positionDelta.x,
              y: newPosition.y + positionDelta.y,
            };

            if (index === this.pendingInputs.length - 1) {
              this.player!.setPosition(newPosition.x, newPosition.y);
            }
          });
        } else {
          this.pendingInputs = [];
        }
      } else if (update.type === "PLAYER_JOINED") {
        this.playersManager?.addPlayer(update.playerId, update.player);
        this.events.emit(
          GameSceneEvents.UPDATE_PLAYER_COUNT,
          this.playersManager!.players.getLength()
        );
      } else if (update.type === "PLAYER_LEFT") {
        this.playersManager?.removePlayer(update.playerId);
        this.events.emit(
          GameSceneEvents.UPDATE_PLAYER_COUNT,
          this.playersManager!.players.getLength()
        );
      }
    });
  }

  public update(time: number, delta: number): void {
    if (!this.player || this.gameState !== "IN_PROCESS") return;

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

    this.player.update({ keys, delta });

    // Prevent sending movements to the server if player is colliding in that direction
    // (quick fix to simplify server reconciliation process)
    const filteredKeys = keys.filter(
      (key) => key !== this.player?.collisionDirection
    );

    if (filteredKeys.length > 0) {
      const input: TPlayerInput = {
        keys: filteredKeys,
        timeDelta: delta,
        inputNumber: this.inputSequenceNumber,
      };

      if (gameConfig.serverSideProcessing) {
        setTimeout(() => {
          this.socket?.emit(ESocketEventNames.PlayerInput, input);
        }, gameConfig.lag || 0);

        this.inputSequenceNumber++;

        if (gameConfig.serverReconciliation) {
          this.pendingInputs.push(input);
        }
      }
    }
  }

  public createRestartOverlay(): void {
    const screenCenter = getScreenCenter(this);

    this.restartOverlay = this.add
      .bitmapText(
        screenCenter.x,
        screenCenter.y,
        GameAssets.TYPOGRAPHY,
        "TRY AGAIN"
      )
      .setOrigin(0.5)
      .setScrollFactor(0, 0)
      .setDepth(99999);

    this.restartOverlay.setInteractive({ useHandCursor: true });

    this.restartOverlay.on("pointerdown", () => {
      this.restartGame();
    });

    // Hide overlay by default
    this.setRestartOverlayVisibility(false);
  }

  public setRestartOverlayVisibility(show: boolean): void {
    this.restartOverlay?.setVisible(show);
  }

  public handlePlayerDeath(): void {
    this.gameState = "PLAYER_DEAD";
    this.setRestartOverlayVisibility(true);
  }

  public restartGame(): void {
    this.socket!.emit(ESocketEventNames.RestartGame);
  }
}
