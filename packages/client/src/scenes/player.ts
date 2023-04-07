import { TVector2 } from "@lifecycle/common/src/modules/math";
import {
  ECursorKey,
  TPlayer,
  TPlayers,
  PLAYER_VELOCITY,
} from "@lifecycle/common/src/modules/player";

import skeletonSpritesheet from "url:../assets/characters/skeleton.png";
import stickInHandImage from "url:../assets/weapons/stick/SpriteInHand.png";

import { gameConfig } from "./gui";

enum EPlayerAnimations {
  WALK_DOWN = "WALK_DOWN",
  WALK_UP = "WALK_UP",
  WALK_LEFT = "WALK_LEFT",
  WALK_RIGHT = "WALK_RIGHT",
  ATTACK_DOWN = "ATTACK_DOWN",
  ATTACK_UP = "ATTACK_UP",
  ATTACK_LEFT = "ATTACK_LEFT",
  ATTACK_RIGHT = "ATTACK_RIGHT",
}

const resetAnimationToStart = (sprite: Phaser.GameObjects.Sprite) => {
  sprite.anims.setCurrentFrame(sprite.anims.currentAnim.frames[0]);
  sprite.anims.stop();
};

export class PlayersManager {
  scene: Phaser.Scene;
  players: Phaser.Physics.Arcade.Group;
  currentPlayer?: Player;

  constructor({ scene }: { scene: Phaser.Scene }) {
    this.scene = scene;
    // @TODO: Check if we need to include all the players in the physics group?
    this.players = this.scene.physics.add.group();
  }

  initializePlayers(currentPlayerId: string, players: TPlayers): void {
    for (const playerId in players) {
      const player = players[playerId];
      const newPlayer = new Player({
        scene: this.scene,
        id: playerId,
        position: player.position,
      });
      this.players.add(newPlayer);

      // Set reference to current player
      if (currentPlayerId === playerId) {
        this.currentPlayer = newPlayer;
      }
    }
  }

  updatePlayers(players: TPlayers): void {
    for (const playerToUpdateId in players) {
      // @TODO: Improve performance - access player by id using map
      const [playerToUpdate] = this.players?.getMatching(
        "id",
        playerToUpdateId
      ) as Player[];

      if (playerToUpdate) {
        const newPos = players[playerToUpdateId].position;

        if (playerToUpdateId !== this.currentPlayer?.id) {
          playerToUpdate.updateAnimation(newPos);
        }

        playerToUpdate.setPosition(newPos.x, newPos.y);
      }
    }
  }

  addPlayer(playerId: string, player: TPlayer): void {
    const newPlayer = new Player({
      scene: this.scene,
      id: playerId,
      position: player.position,
    });
    this.players.add(newPlayer);
  }

  removePlayer(playerId: string): void {
    this.players.getChildren().forEach((player) => {
      if (player.id === playerId) {
        player.destroy();
      }
    });
  }
}

export class Player extends Phaser.GameObjects.Container {
  scene: Phaser.Scene;
  id: string;
  playerSprite: Phaser.GameObjects.Sprite;
  // weaponSprite: Phaser.GameObjects.Sprite;
  body!: Phaser.Physics.Arcade.Body;

  constructor({
    scene,
    id,
    position,
  }: {
    scene: Phaser.Scene;
    id: string;
    position: TVector2;
  }) {
    super(scene, position.x, position.y, []);
    scene.add.existing(this);

    this.playerSprite = scene.add.sprite(0, 0, "skeleton");
    this.playerSprite.anims.play(EPlayerAnimations.WALK_DOWN);
    resetAnimationToStart(this.playerSprite);
    // this.weaponSprite = scene.add.sprite(0, 10, "stick-in-hand");

    this.setSize(this.playerSprite.width, this.playerSprite.height);
    scene.physics.world.enable(this);

    // this.add([this.playerSprite, this.weaponSprite]);
    this.add([this.playerSprite]);

    this.scene = scene;
    this.id = id;
  }

  static preloadAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet("skeleton", skeletonSpritesheet, {
      frameWidth: 16,
      frameHeight: 16,
    });

    scene.load.image("stick-in-hand", stickInHandImage);
  }

  static loadAssets(scene: Phaser.Scene): void {
    scene.anims.create({
      key: EPlayerAnimations.WALK_DOWN,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [0, 4, 8, 12],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.WALK_UP,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [1, 5, 9, 13],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.WALK_LEFT,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [2, 6, 10, 14],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.WALK_RIGHT,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [3, 7, 11, 15],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_DOWN,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [16],
      }),
      duration: 300,
      repeat: 0,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_UP,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [17],
      }),
      duration: 300,
      repeat: 0,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_LEFT,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [18],
      }),
      duration: 300,
      repeat: 0,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_RIGHT,
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [19],
      }),
      duration: 300,
      repeat: 0,
    });
  }

  update({ keys }: { keys: ECursorKey[] }): void {
    // Animation
    const startAttack = keys.includes(ECursorKey.SPACE);
    const movementDirection = keys.find((k) =>
      [
        ECursorKey.UP,
        ECursorKey.DOWN,
        ECursorKey.LEFT,
        ECursorKey.RIGHT,
      ].includes(k)
    );
    const currentAnimKey = this.playerSprite.anims.currentAnim?.key;

    if (startAttack) {
      // @TODO: Review change of direction while attacking (should update attack sprite)
      const playerDirection =
        movementDirection || currentAnimKey?.split("_")[1];

      this.playerSprite
        .play(`ATTACK_${playerDirection}`)
        .once("animationcomplete", () => {
          this.playerSprite.anims.play(`WALK_${playerDirection}`, true);
        });
    } else if (movementDirection && !currentAnimKey.startsWith("ATTACK")) {
      this.playerSprite.play(`WALK_${movementDirection}`, true);
    } else if (currentAnimKey.startsWith("WALK")) {
      resetAnimationToStart(this.playerSprite);
    }

    // Movement

    // Stop any previous movement from the last frame
    this.body.setVelocity(0);

    if (gameConfig.clientSidePrediction) {
      this.body.setVelocityX(
        keys.includes(ECursorKey.LEFT)
          ? -PLAYER_VELOCITY
          : keys.includes(ECursorKey.RIGHT)
          ? PLAYER_VELOCITY
          : 0
      );
      this.body.setVelocityY(
        keys.includes(ECursorKey.UP)
          ? -PLAYER_VELOCITY
          : keys.includes(ECursorKey.DOWN)
          ? PLAYER_VELOCITY
          : 0
      );
    }
  }

  updateAnimation(newPos: TVector2): void {
    const direction =
      this.x < newPos.x
        ? ECursorKey.RIGHT
        : this.x > newPos.x
        ? ECursorKey.LEFT
        : this.y < newPos.y
        ? ECursorKey.DOWN
        : this.y > newPos.y
        ? ECursorKey.UP
        : undefined;

    if (direction) {
      const walkAnimation = `WALK_${direction}`;

      this.playerSprite.play(walkAnimation, true);
    } else if (this.playerSprite.anims.currentAnim?.key.startsWith("WALK")) {
      resetAnimationToStart(this.playerSprite);
    } else {
      this.playerSprite.anims.play("WALK_DOWN", true);
      resetAnimationToStart(this.playerSprite);
    }
  }
}
