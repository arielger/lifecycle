import { TVector2 } from "@lifecycle/common/src/modules/math";
import {
  ECursorKey,
  TPlayer,
  TPlayers,
} from "@lifecycle/common/src/modules/player";

import skeletonSpritesheet from "url:../assets/characters/skeleton.png";

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
          const direction =
            playerToUpdate.body.position.x < newPos.x
              ? ECursorKey.RIGHT
              : playerToUpdate.body.position.x > newPos.x
              ? ECursorKey.LEFT
              : playerToUpdate.body.position.y < newPos.y
              ? ECursorKey.DOWN
              : playerToUpdate.body.position.y > newPos.y
              ? ECursorKey.UP
              : undefined;
          playerToUpdate.updateAnimation(direction);
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

export class Player extends Phaser.Physics.Arcade.Sprite {
  scene: Phaser.Scene;
  id: string;

  constructor({
    scene,
    id,
    position,
  }: {
    scene: Phaser.Scene;
    id: string;
    position: TVector2;
  }) {
    super(scene, position.x, position.y, "skeleton");
    scene.physics.add.existing(this).setOrigin(0);
    scene.add.existing(this).setOrigin(0);

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
    // reference https://phaser.io/examples/v3/view/animation/create-animation-from-sprite-sheet#

    scene.anims.create({
      key: "idle",
      frames: [{ key: "skeleton", frame: 0 }],
    });

    scene.anims.create({
      key: "walkDown",
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [0, 4, 8, 12],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: "walkUp",
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [1, 5, 9, 13],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: "walkLeft",
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [2, 6, 10, 14],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: "walkRight",
      frames: scene.anims.generateFrameNumbers("skeleton", {
        frames: [3, 7, 11, 15],
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  updateAnimation(key?: ECursorKey): void {
    const keyToAnimation = {
      [ECursorKey.RIGHT]: "walkRight",
      [ECursorKey.LEFT]: "walkLeft",
      [ECursorKey.UP]: "walkUp",
      [ECursorKey.DOWN]: "walkDown",
    };

    if (key) {
      this.play(keyToAnimation[key], true);
    } else {
      if (this.anims.currentAnim?.key.startsWith("walk")) {
        this.anims.setCurrentFrame(this.anims.currentAnim.frames[0]);
        this.anims.stop();
      } else {
        this.anims.play("idle", true);
      }
    }
  }
}
