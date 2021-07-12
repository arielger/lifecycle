import Phaser from "phaser";
import { io } from "socket.io-client";

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

  public preload() {
    this.player = this.load.spritesheet("player", playerSprite, {
      frameWidth: 16,
      frameHeight: 32,
    });
  }

  public create() {
    this.players = this.physics.add.group();

    // @TODO: Replace with production URL after deploying
    this.socket = io("ws://localhost:3000");

    this.socket.on("connect", () => {
      console.log("Socket connected!");
    });

    this.socket.on("currentPlayers", (players) => {
      console.log("currentPlayers", players);
      players.forEach((player) => renderPlayer(this, player));
    });

    this.socket.on("newPlayer", (player) => {
      console.log("newPlayer", player);
      renderPlayer(this, player);
    });
  }

  public update() {}
}

function renderPlayer(phaser, player) {
  const playerSprite = phaser.add.sprite(
    player.pos[0],
    player.pos[1],
    "player"
  );
  phaser.players.add(playerSprite);
}
