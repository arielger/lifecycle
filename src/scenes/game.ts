import Phaser from "phaser";

import playerSprite from "url:../assets/characters/player.png";

// @TODO: Probably we should move all the player logic to a separate module
let cursorKeys;

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

export default class GameScene extends Phaser.Scene {
  // @TODO: Add types
  private player;

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
    this.player = this.physics.add.sprite(200, 200, "player");

    this.player.setCollideWorldBounds(true);

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

    cursorKeys = this.input.keyboard.createCursorKeys();
  }

  public update() {
    if (cursorKeys.up.isDown) {
      this.player.setVelocityY(-100);
      this.player.play("walk-up");
    } else if (cursorKeys.down.isDown) {
      this.player.setVelocityY(100);
      this.player.play("walk-down");
    } else {
      this.player.setVelocityY(0);
    }

    if (cursorKeys.left.isDown) {
      this.player.setVelocityX(-100);
      this.player.play("walk-left");
    } else if (cursorKeys.right.isDown) {
      this.player.setVelocityX(100);
      this.player.play("walk-right");
    } else {
      this.player.setVelocityX(0);
    }
  }
}
