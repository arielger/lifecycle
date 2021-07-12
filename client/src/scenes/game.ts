import Phaser from "phaser";
import { io } from "socket.io-client";

import { SocketEventNames } from "../../../server/src/types";

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

    // @TODO: Replace with production URL after deploying
    this.socket = io("ws://localhost:3000");

    this.socket.on("connect", () => {
      console.log("Socket connected!");
    });

    this.socket.on(SocketEventNames.AllPlayers, (players) => {
      console.log("currentPlayers", players);
      players.forEach((player) => renderPlayer(this, player));
    });

    this.socket.on(SocketEventNames.PlayerConnected, (player) => {
      console.log("playerConnected", player);
      renderPlayer(this, player);
    });

    this.socket.on(SocketEventNames.PlayerDisconnected, (playerId) => {
      this.players.getChildren().forEach((player) => {
        if (player.id === playerId) {
          player.destroy();
        }
      });
    });
  }

  public update(): void {
    // console.log("update");
  }
}

function renderPlayer(phaser, player) {
  const playerSprite = phaser.add.sprite(
    player.pos[0],
    player.pos[1],
    "player"
  );
  playerSprite.id = player.id;
  phaser.players.add(playerSprite);
}
