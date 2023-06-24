import { TVector2 } from "@lifecycle/common/src/modules/math";
import {
  TPlayer,
  TPlayers,
  getPlayerVelocity,
  ECursorKey,
  EPlayerAction,
  PLAYER_ATTACK_COOLDOWN,
} from "@lifecycle/common/src/modules/player";
import { Direction } from "@lifecycle/common/src/types";
import { getDirectionFromInputKeys } from "@lifecycle/common/src/utils/input";

import skeletonSpritesheet from "url:../assets/characters/skeleton.png";
import shadowImage from "url:../assets/characters/shadow-2.png";

import {
  getDirectionFromAnimation,
  resetAnimationAndStop,
  getDirectionFromPosition,
} from "../utils/animations";
import { gameConfig } from "./ui/config";
import { GameAssets } from "../types";

enum PlayerAssets {
  PLAYER_SPRITES = "playerSprites",
  PLAYER_SHADOW = "playerShadow",
}

// Animations
enum EPlayerAnimations {
  WALK_DOWN = "PLAYER_WALK_DOWN",
  WALK_UP = "PLAYER_WALK_UP",
  WALK_LEFT = "PLAYER_WALK_LEFT",
  WALK_RIGHT = "PLAYER_WALK_RIGHT",
  ATTACK_DOWN = "PLAYER_ATTACK_DOWN",
  ATTACK_UP = "PLAYER_ATTACK_UP",
  ATTACK_LEFT = "PLAYER_ATTACK_LEFT",
  ATTACK_RIGHT = "PLAYER_ATTACK_RIGHT",
  DEAD = "PLAYER_DEAD",
}

enum PlayerActions {
  WALK = "WALK",
  ATTACK = "ATTACK",
}

const getPlayerAnimation = (
  animationType: PlayerActions,
  direction: Direction
): EPlayerAnimations => {
  return `PLAYER_${animationType}_${direction}` as EPlayerAnimations;
};

export class PlayersManager {
  scene: Phaser.Scene;
  players: Phaser.GameObjects.Group;
  currentPlayer?: Player;

  constructor({ scene }: { scene: Phaser.Scene }) {
    this.scene = scene;
    this.players = this.scene.add.group();
  }

  initializePlayers(currentPlayerId: string, players: TPlayers): void {
    this.players.clear(true, true);

    for (const playerId in players) {
      const player = players[playerId];
      const newPlayer = new Player({
        scene: this.scene,
        id: playerId,
        position: player.position,
        health: player.health,
        name: player.name,
      });
      this.players.add(newPlayer);

      // Set reference to current player
      if (currentPlayerId === playerId) {
        this.currentPlayer = newPlayer;
      }
    }
  }

  updatePlayers({
    playersUpdate,
    isPlayerAlreadyDead,
    handlePlayerDeath,
  }: {
    playersUpdate: TPlayers;
    isPlayerAlreadyDead: boolean;
    handlePlayerDeath: () => void;
  }): void {
    (this.players.getChildren() as Player[]).forEach((player) => {
      const isCurrentPlayer = player.id === this.currentPlayer?.id;
      const playerUpdate = playersUpdate[player.id];

      // If there is no update it means the player is dead
      const isPlayerAlive = !!playerUpdate;

      if (isCurrentPlayer && isPlayerAlreadyDead) return;

      if (isPlayerAlive) {
        // If player is damaged play hit animation
        if (playerUpdate.health < player.health) {
          player.hit();
        }

        player.health = playerUpdate.health;

        // Only update animations for other players (current player animation is already handled)
        if (!isCurrentPlayer) {
          player.updateAnimation({
            startAttack: !!(playerUpdate.action === EPlayerAction.ATTACK),
            inputMovementDirection: getDirectionFromPosition(
              { x: player.x, y: player.y },
              playerUpdate.position
            ),
          });
        }

        player.setPosition(playerUpdate.position.x, playerUpdate.position.y);
        player.setDepth(playerUpdate.position.y);
      } else {
        if (isCurrentPlayer) {
          // Update health UI
          player.health = 0;

          player?.playerSprite.play(EPlayerAnimations.DEAD);

          if (player) {
            handlePlayerDeath();
          }
        } else {
          player.die();
        }
      }
    });
  }

  addPlayer(playerId: string, player: TPlayer): void {
    const newPlayer = new Player({
      scene: this.scene,
      id: playerId,
      position: player.position,
      health: player.health,
      name: player.name,
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
  body!: MatterJS.BodyType;
  health: number;
  name: string;

  // Substract attack cooldown to allow player to attack immediately
  lastAttackTimestamp: number = Date.now() - PLAYER_ATTACK_COOLDOWN;

  // Store collision direction to prevent sending invalid player movement to the server
  collisionDirection?: Direction;

  constructor({
    scene,
    id,
    position,
    health,
    name,
  }: {
    scene: Phaser.Scene;
    id: string;
    position: TVector2;
    health: number;
    name: string;
  }) {
    super(scene, position.x, position.y, []);
    scene.add.existing(this);

    this.playerSprite = scene.add.sprite(0, 0, PlayerAssets.PLAYER_SPRITES);
    this.playerSprite.anims.play(EPlayerAnimations.WALK_DOWN);
    resetAnimationAndStop(this.playerSprite);

    this.setSize(this.playerSprite.width, this.playerSprite.height);
    scene.matter.add.gameObject(this);
    // Prevent body from rotating
    this.body.inverseInertia = 0;
    this.body.collisionFilter.group = -1;

    this.body.onCollideActiveCallback = ({
      collision,
    }: {
      collision: { normal: TVector2 };
    }) => {
      if (collision.normal.x > 0) {
        this.collisionDirection = Direction.RIGHT;
      } else if (collision.normal.x < 0) {
        this.collisionDirection = Direction.LEFT;
      } else if (collision.normal.y > 0) {
        this.collisionDirection = Direction.DOWN;
      } else if (collision.normal.y < 0) {
        this.collisionDirection = Direction.UP;
      }
    };

    this.body.onCollideEndCallback = () => {
      this.collisionDirection = undefined;
    };

    const playerName = scene.add
      .bitmapText(0, -12, GameAssets.TYPOGRAPHY, name)
      .setOrigin(0.5)
      .setScale(0.25)
      .setTintFill(0xffffff);

    const playerShadow = scene.add
      .image(0.5, 7, PlayerAssets.PLAYER_SHADOW)
      .setOrigin(0.5)
      .setAlpha(0.75);

    this.add([this.playerSprite, playerName, playerShadow]);

    this.sendToBack(playerShadow);

    this.health = health;
    this.scene = scene;
    this.id = id;
    this.name = name;
  }

  static preloadAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet(PlayerAssets.PLAYER_SPRITES, skeletonSpritesheet, {
      frameWidth: 16,
      frameHeight: 16,
    });

    scene.load.image(PlayerAssets.PLAYER_SHADOW, shadowImage);
  }

  static loadAssets(scene: Phaser.Scene): void {
    scene.anims.create({
      key: EPlayerAnimations.WALK_DOWN,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [0, 4, 8, 12],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.WALK_UP,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [1, 5, 9, 13],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.WALK_LEFT,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [2, 6, 10, 14],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.WALK_RIGHT,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [3, 7, 11, 15],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_DOWN,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [16],
      }),
      duration: PLAYER_ATTACK_COOLDOWN,
      repeat: 0,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_UP,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [17],
      }),
      duration: PLAYER_ATTACK_COOLDOWN,
      repeat: 0,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_LEFT,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [18],
      }),
      duration: PLAYER_ATTACK_COOLDOWN,
      repeat: 0,
    });

    scene.anims.create({
      key: EPlayerAnimations.ATTACK_RIGHT,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [19],
      }),
      duration: PLAYER_ATTACK_COOLDOWN,
      repeat: 0,
    });

    scene.anims.create({
      key: EPlayerAnimations.DEAD,
      frames: scene.anims.generateFrameNumbers(PlayerAssets.PLAYER_SPRITES, {
        frames: [24],
      }),
    });
  }

  update({ keys, delta }: { keys: ECursorKey[]; delta: number }): void {
    // Set correct depth rendering depending on y position
    this.setDepth(this.body.position.y);

    const inputMovementDirection = getDirectionFromInputKeys(keys);

    this.updateAnimation({
      startAttack: keys.includes(ECursorKey.SPACE),
      inputMovementDirection,
    });

    if (gameConfig.clientSidePrediction) {
      const newVelocity = getPlayerVelocity({
        delta,
        direction: inputMovementDirection,
      });
      this.scene.matter.setVelocity(this.body, newVelocity.x, newVelocity.y);
    }
  }

  // Handle animations for both current player and other players
  updateAnimation({
    startAttack,
    inputMovementDirection,
  }: {
    startAttack: boolean;
    inputMovementDirection?: Direction;
  }): void {
    const currentAnimKey = this.playerSprite.anims.currentAnim?.key;

    if (startAttack) {
      const animDirection =
        inputMovementDirection || getDirectionFromAnimation(currentAnimKey);

      this.playerSprite
        .play(getPlayerAnimation(PlayerActions.ATTACK, animDirection))
        .once("animationcomplete", () => {
          // When the attack animation ends return to the walk animation
          this.playerSprite.anims.play(
            getPlayerAnimation(PlayerActions.WALK, animDirection),
            true
          );
        });
      return;
    }

    // If player is moving and not attacking, play WALK animation
    if (
      inputMovementDirection &&
      !currentAnimKey.includes(PlayerActions.ATTACK)
    ) {
      this.playerSprite.play(
        getPlayerAnimation(PlayerActions.WALK, inputMovementDirection),
        true
      );
      return;
    }

    // If player is not moving, stop the current WALK animation
    if (currentAnimKey.includes(PlayerActions.WALK)) {
      resetAnimationAndStop(this.playerSprite);
      return;
    }
  }

  hit(): void {
    this.scene.tweens.addCounter({
      from: 255,
      to: 0,
      duration: 150,
      yoyo: true,
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue());
        this.playerSprite.setTint(
          Phaser.Display.Color.GetColor(255, value, value)
        );
      },
      onComplete: () => {
        this.playerSprite.clearTint();
      },
    });
  }

  die(): void {
    this.scene.tweens.addCounter({
      from: 0,
      to: 255,
      duration: 400,
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue());
        this.playerSprite.setTint(
          Phaser.Display.Color.GetColor(value, value, value)
        );
      },
      onComplete: () => {
        this.playerSprite.clearTint();
        this.destroy();
      },
    });
  }
}
