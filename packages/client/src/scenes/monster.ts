import { TVector2 } from "@lifecycle/common/src/modules/math";
import { Monsters } from "@lifecycle/common/src/modules/monster";
import { Direction } from "@lifecycle/common/src/types";

import mouseSpritesheet from "url:../assets/characters/mouse.png";
import {
  getDirectionFromPosition,
  resetAnimationAndStop,
} from "../utils/animations";

enum EMouseAnimations {
  WALK_DOWN = "MOUSE_WALK_DOWN",
  WALK_UP = "MOUSE_WALK_UP",
  WALK_LEFT = "MOUSE_WALK_LEFT",
  WALK_RIGHT = "MOUSE_WALK_RIGHT",
}

enum MouseActions {
  WALK = "WALK",
}

const getMouseAnimation = (
  animationType: MouseActions,
  direction: Direction
): EMouseAnimations => {
  return `MOUSE_${animationType}_${direction}` as EMouseAnimations;
};

export class MonstersManager {
  scene: Phaser.Scene;
  monsters: Phaser.GameObjects.Group;

  constructor({ scene }: { scene: Phaser.Scene }) {
    this.scene = scene;
    this.monsters = this.scene.add.group();
  }

  initializeMonsters(monsters: Monsters): void {
    this.monsters.clear(true, true);

    for (const monsterId in monsters) {
      const monster = monsters[monsterId];
      const newMonster = new Monster({
        scene: this.scene,
        id: monsterId,
        position: monster.position,
        health: monster.health,
      });
      this.monsters.add(newMonster);
    }
  }

  updateMonsters(monstersUpdate: Monsters): void {
    (this.monsters.getChildren() as Monster[]).forEach((monster) => {
      const monsterUpdate = monstersUpdate[monster.id];
      if (!monsterUpdate) {
        monster.die();
        return;
      }
      if (monsterUpdate.health < monster.health) {
        monster.hit();
      }
      monster.health = monsterUpdate.health;
      monster.updateAnimation(monsterUpdate.position);
      monster.setPosition(monsterUpdate.position.x, monsterUpdate.position.y);
    });
  }
}

export class Monster extends Phaser.Physics.Matter.Sprite {
  scene: Phaser.Scene;
  id: string;
  body!: MatterJS.BodyType;
  health!: number;

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
    super(scene.matter.world, position.x, position.y, "mouse");
    scene.add.existing(this);

    this.anims.play(EMouseAnimations.WALK_DOWN);

    // Prevent body from rotating
    this.body.inverseInertia = 0;
    this.body.collisionFilter.group = -1;

    this.health = health;
    this.scene = scene;
    this.id = id;
  }

  static preloadAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet("mouse", mouseSpritesheet, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  static loadAssets(scene: Phaser.Scene): void {
    scene.anims.create({
      key: EMouseAnimations.WALK_DOWN,
      frames: scene.anims.generateFrameNumbers("mouse", {
        frames: [0, 4, 8, 12],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EMouseAnimations.WALK_UP,
      frames: scene.anims.generateFrameNumbers("mouse", {
        frames: [1, 5, 9, 13],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EMouseAnimations.WALK_LEFT,
      frames: scene.anims.generateFrameNumbers("mouse", {
        frames: [2, 6, 10, 14],
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: EMouseAnimations.WALK_RIGHT,
      frames: scene.anims.generateFrameNumbers("mouse", {
        frames: [3, 7, 11, 15],
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  updateAnimation(newPos: TVector2): void {
    const direction = getDirectionFromPosition(
      { x: this.x, y: this.y },
      newPos
    );

    if (direction) {
      this.play(getMouseAnimation(MouseActions.WALK, direction), true);
    } else if (this.anims.currentAnim?.key.includes(MouseActions.WALK)) {
      resetAnimationAndStop(this);
    } else {
      this.anims.play(EMouseAnimations.WALK_DOWN, true);
      resetAnimationAndStop(this);
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
        this.setTint(Phaser.Display.Color.GetColor(255, value, value));
      },
      onComplete: () => {
        this.clearTint();
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
        this.setTint(Phaser.Display.Color.GetColor(value, value, value));
      },
      onComplete: () => {
        this.clearTint();
        this.destroy();
      },
    });
  }
}
