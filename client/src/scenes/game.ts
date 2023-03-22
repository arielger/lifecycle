import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import {
  ESocketEventNames,
  TClientToServerEvents,
  TServerToClientEvents,
} from "../../../common/src/types";
import {
  ECursorKey,
  processPlayerInput,
} from "../../../common/src/modules/player";
import { gameConfig } from "./gui";

import { Player, PlayersManager } from "./player";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

export default class GameScene extends Phaser.Scene {
  private socket?: Socket<TServerToClientEvents, TClientToServerEvents>;
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  private inputSequenceNumber = 0;

  private playersManager?: PlayersManager;

  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    Player.preloadAssets(this);
  }

  public create(): void {
    Player.loadAssets(this);

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.socket = io(process.env.SOCKET_SERVER_URL);

    this.playersManager = new PlayersManager({ scene: this });

    this.socket.on(ESocketEventNames.GameUpdate, (update) => {
      if (update.type === "INITIAL_GAME_STATE") {
        this.playersManager?.initializePlayers(update.playerId, update.players);
      } else if (update.type === "GAME_STATE") {
        this.playersManager?.updatePlayers(update.players);
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

    if (key) {
      const input = {
        key,
        timeDelta: delta,
        sequenceNumber: this.inputSequenceNumber,
      };

      if (gameConfig.clientSidePrediction) {
        const player = this.playersManager?.currentPlayer;
        const newPosition = processPlayerInput(
          { x: player?.x, y: player?.y },
          input
        );
        player?.updatePosition(newPosition);
      }

      this.socket?.emit(ESocketEventNames.PlayerPositionUpdate, input);

      this.inputSequenceNumber++;
    }
  }
}
