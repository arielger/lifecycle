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
import { gameConfig } from "./gui";

import { Player, PlayersManager } from "./player";
import { Monster, MonstersManager } from "./monster";
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
  private monstersManager?: MonstersManager;
  private playerId?: string;
  private player?: Player;
  private isPlayerDead = false;

  private heartsUI?: HeartsUI;

  private inputSequenceNumber = 0;
  private pendingInputs: TPlayerInput[] = [];

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    Player.preloadAssets(this);
    Monster.preloadAssets(this);
    HeartsUI.preloadAssets(this);
    preloadMapAssets(this);
  }

  public create(): void {
    Player.loadAssets(this);
    Monster.loadAssets(this);

    this.socket = io(process.env.SOCKET_SERVER_URL);

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
    this.matter.world.setBounds(0, 0, MAP_SIZE.width, MAP_SIZE.height);

    this.socket.on(ESocketEventNames.GameUpdate, (update) => {
      if (!gameConfig.serverSideProcessing) return;

      if (update.type === "INITIAL_GAME_STATE") {
        this.playersManager?.initializePlayers(update.playerId, update.players);
        this.monstersManager?.initializeMonsters(update.monsters);

        // Initialize current player
        this.playerId = update.playerId;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.player = this.playersManager!.currentPlayer!;

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        this.heartsUI = new HeartsUI({
          scene: this,
          health: this.player.health,
        });
      } else if (update.type === "GAME_STATE") {
        // @TODO: Review => we should be sending deltas of game state
        this.playersManager?.updatePlayers(
          update.players,
          this.handlePlayerDeath.bind(this)
        );
        this.monstersManager?.updateMonsters(update.monsters);

        this.heartsUI?.updateHealth(this.player!.health);

        if (gameConfig.serverReconciliation && !this.isPlayerDead) {
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
      } else if (update.type === "PLAYER_LEFT") {
        this.playersManager?.removePlayer(update.playerId);
      }
    });
  }

  public update(time: number, delta: number): void {
    if (!this.player || this.isPlayerDead) return;

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

  public handlePlayerDeath(): void {
    this.isPlayerDead = true;

    // @TODO: Move to util
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const restartButton = this.add
      .text(screenCenterX, screenCenterY, "Try again", {
        fontFamily: "Sabo",
        fontSize: "32px",
      })
      .setOrigin(0.5);

    restartButton.setInteractive({ useHandCursor: true });

    restartButton.on("pointerdown", () => {
      console.log("@TODO: Restart game");
    });
  }
}
