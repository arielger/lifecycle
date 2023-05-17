import { v4 as uuidv4 } from "uuid";
import matter from "matter-js";

import {
  Monster as MonsterType,
  Monsters,
} from "@lifecycle/common/src/modules/monster";
import { getRandom } from "@lifecycle/common/build/utils/arrays";
import { Direction } from "@lifecycle/common/build/types/directions";

import { getValidBodyPosition } from "./map";

const MONSTER_SIZE = 16;
const MONSTER_COUNT = 5;

export function initializeMonsters(
  world: matter.World,
  monsters: Record<string, Monster>
): void {
  [...Array(MONSTER_COUNT)].forEach(() => {
    const monster = new Monster(world, monsters);
    monsters[monster.id] = monster;
  });
}

// @TODO: Duplicated in player entity, check how to share code - DRY
export const getMonstersPublicData = (
  monsters: Record<string, Monster>
): Monsters => {
  const monstersPublicData: Monsters = {};

  for (const monsterId in monsters) {
    const monster = monsters[monsterId];
    monstersPublicData[monsterId] = monster.getPublicData();
  }

  return monstersPublicData;
};

export class Monster {
  id: string;
  health: number;
  body: matter.Body;
  monsters: Record<string, Monster>;
  world: matter.World;

  lastMovementTimestamp: number;

  constructor(world: matter.World, monsters: Record<string, Monster>) {
    this.id = uuidv4();
    this.health = 4;
    this.lastMovementTimestamp = Date.now();

    this.monsters = monsters;
    this.world = world;

    const initialPosition = getValidBodyPosition(world, MONSTER_SIZE);
    this.body = matter.Bodies.rectangle(
      initialPosition.x,
      initialPosition.y,
      MONSTER_SIZE,
      MONSTER_SIZE,
      {
        inverseInertia: 0, // Prevent body from rotating
        collisionFilter: {
          group: -1,
        },
      }
    );
    matter.Composite.add(world, this.body);
  }

  update(): void {
    const randomDirection = getRandom(Object.values(Direction));

    // Make a movement every 2 seconds
    if (Date.now() - 2000 > this.lastMovementTimestamp) {
      matter.Body.setVelocity(this.body, {
        x:
          randomDirection === "LEFT" ? -1 : randomDirection === "RIGHT" ? 1 : 0,
        y: randomDirection === "UP" ? 1 : randomDirection === "DOWN" ? -1 : 0,
      });
      this.lastMovementTimestamp = Date.now();
    }
  }

  getPublicData(): MonsterType {
    return {
      health: this.health,
      position: this.body.position,
    };
  }

  dealDamage(damage: number): void {
    this.health -= damage;

    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy(): void {
    matter.World.remove(this.world, this.body);
    delete this.monsters[this.id];
  }
}
