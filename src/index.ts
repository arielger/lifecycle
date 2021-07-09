import Phaser from "phaser";

import playerSprite from "url:./assets/characters/player.png";

// @TODO: Probably we should move all the player logic to a separate module
let keys;

function preload() {
  this.load.spritesheet("player", playerSprite, {
    frameWidth: 16,
    frameHeight: 32,
  });
}

function create() {
  const player = this.add.sprite(200, 200, "player");

  this.anims.create({
    key: "walk-down",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
    frameRate: 24,
    repeat: -1,
  });

  this.anims.create({
    key: "walk-right",
    frames: this.anims.generateFrameNumbers("player", { start: 4, end: 7 }),
    frameRate: 24,
    repeat: -1,
  });

  this.anims.create({
    key: "walk-up",
    frames: this.anims.generateFrameNumbers("player", {
      start: 8,
      end: 11,
    }),
    frameRate: 24,
    repeat: -1,
  });

  this.anims.create({
    key: "walk-left",
    frames: this.anims.generateFrameNumbers("player", {
      start: 12,
      end: 15,
    }),
    frameRate: 24,
    repeat: -1,
  });

  keys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
  });

  player.play("walk-left");
}

function update() {
  if (keys.up.isDown) {
    console.log("Key up is down");
  }
}

const config = {
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
  },
  // @TODO: Review how to adapt to changing viewport size
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

new Phaser.Game(config);
