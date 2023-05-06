import { v4 as uuidv4 } from "uuid";
import matter from "matter-js";

import {
  Monster as MonsterType,
  Monsters,
} from "@lifecycle/common/src/modules/monster";
import { getRandom } from "@lifecycle/common/src/utils/arrays";
import { Direction } from "@lifecycle/common/build/types";

import { getValidBodyPosition } from "./map";

const MONSTER_SIZE = 16;
const MONSTER_COUNT = 5;

export function initializeMonsters(
  world: matter.World
): Record<string, Monster> {
  const monsters = {} as Record<string, Monster>;

  [...Array(MONSTER_COUNT)].forEach(() => {
    const monster = new Monster(world);
    monsters[monster.id] = monster;
  });

  return monsters;
}

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

  lastMovementTimestamp: number;

  constructor(world: matter.World) {
    this.id = uuidv4();
    this.health = 4;
    this.lastMovementTimestamp = Date.now();

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
}
