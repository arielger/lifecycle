import { TVector2 } from "@lifecycle/common/src/modules/math";
import {
  TPlayer,
  TPlayers,
  getPlayerVelocity,
  ECursorKey,
} from "@lifecycle/common/src/modules/player";
import { Direction } from "@lifecycle/common/src/types";
import { getDirectionFromInputKeys } from "@lifecycle/common/src/utils/input";

import skeletonSpritesheet from "url:../assets/characters/skeleton.png";

import {
  getDirectionFromAnimation,
  resetAnimationAndStop,
} from "../utils/animations";
import { gameConfig } from "./gui";

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
    for (const playerId in players) {
      const player = players[playerId];
      const newPlayer = new Player({
        scene: this.scene,
        id: playerId,
        position: player.position,
        health: player.health,
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
        playerToUpdate.health = players[playerToUpdateId].health;

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
      health: player.health,
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
  health!: number;

  // Store collision direction to prevent sending invalid player movement to the server
  collisionDirection?: Direction;

  constructor({
    scene,
    id,
    position,
    health,
  }: {
    scene: Phaser.Scene;
    id: string;
    position: TVector2;
    health: number;
  }) {
    super(scene, position.x, position.y, []);
    scene.add.existing(this);

    this.playerSprite = scene.add.sprite(0, 0, "skeleton");
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

    this.add([this.playerSprite]);

    this.health = health;
    this.scene = scene;
    this.id = id;
  }

  static preloadAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet("skeleton", skeletonSpritesheet, {
      frameWidth: 16,
      frameHeight: 16,
    });
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

  update({ keys, delta }: { keys: ECursorKey[]; delta: number }): void {
    // Animation
    const currentAnimKey = this.playerSprite.anims.currentAnim?.key;
    const movementInputDirection = getDirectionFromInputKeys(keys);

    const startAttack = keys.includes(ECursorKey.SPACE);

    if (startAttack) {
      // @TODO: Review change of direction while attacking (should update attack sprite)
      const animDirection =
        movementInputDirection || getDirectionFromAnimation(currentAnimKey);

      this.playerSprite
        .play(getPlayerAnimation(PlayerActions.ATTACK, animDirection))
        .once("animationcomplete", () => {
          this.playerSprite.anims.play(
            getPlayerAnimation(PlayerActions.WALK, animDirection),
            true
          );
        });
    } else if (
      movementInputDirection &&
      !currentAnimKey.includes(PlayerActions.ATTACK)
    ) {
      this.playerSprite.play(
        getPlayerAnimation(PlayerActions.WALK, movementInputDirection),
        true
      );
    } else if (currentAnimKey.includes(PlayerActions.WALK)) {
      resetAnimationAndStop(this.playerSprite);
    }

    if (gameConfig.clientSidePrediction) {
      const newVelocity = getPlayerVelocity({
        delta,
        direction: movementInputDirection,
      });
      this.scene.matter.setVelocity(this.body, newVelocity.x, newVelocity.y);
    }
  }

  updateAnimation(newPos: TVector2): void {
    const direction =
      this.x < newPos.x
        ? Direction.RIGHT
        : this.x > newPos.x
        ? Direction.LEFT
        : this.y < newPos.y
        ? Direction.DOWN
        : this.y > newPos.y
        ? Direction.UP
        : undefined;

    if (direction) {
      const walkAnimation = getPlayerAnimation(PlayerActions.WALK, direction);
      this.playerSprite.play(walkAnimation, true);
    } else if (
      this.playerSprite.anims.currentAnim?.key.includes(PlayerActions.WALK)
    ) {
      resetAnimationAndStop(this.playerSprite);
    } else {
      this.playerSprite.anims.play(EPlayerAnimations.WALK_DOWN, true);
      resetAnimationAndStop(this.playerSprite);
    }
  }
}
