import { randomInt } from "./utils";
import { v4 as uuidv4 } from "uuid";
import matter from "matter-js";

import { TVector2 } from "@lifecycle/common/build/modules/math";
import {
  TPlayerInput,
  ECursorKey,
  PLAYER_HEALTH,
  PLAYER_SIZE,
  TPlayer,
  getPlayerVelocity,
} from "@lifecycle/common/build/modules/player";
import { MAP_SIZE } from "@lifecycle/common/build/modules/map";

export const getPlayersPublicData = (
  players: Record<string, Player>
): Record<string, TPlayer> => {
  const playersPublicData: Record<string, TPlayer> = {};

  for (const playerId in players) {
    const player = players[playerId];
    playersPublicData[playerId] = player.getPublicData();
  }

  return playersPublicData;
};

export class Player {
  id: string;
  lastProcessedInput: number;
  health: number;
  body: matter.Body;

  constructor(world: matter.World) {
    this.id = uuidv4();
    this.lastProcessedInput = 0;
    this.health = PLAYER_HEALTH;

    const initialPosition = this.getInitialPosition(world);
    this.body = matter.Bodies.rectangle(
      initialPosition.x,
      initialPosition.y,
      PLAYER_SIZE,
      PLAYER_SIZE,
      {
        inverseInertia: 0, // Prevent body from rotating
        collisionFilter: {
          group: -1,
        },
      }
    );
    matter.Composite.add(world, this.body);
  }

  // Get random position that doesn't collide with other bodies
  getInitialPosition(world: matter.World): TVector2 {
    const pos = {
      x: randomInt(PLAYER_SIZE / 2, MAP_SIZE.width - PLAYER_SIZE / 2),
      y: randomInt(PLAYER_SIZE / 2, MAP_SIZE.height - PLAYER_SIZE / 2),
    };

    const tempBody = matter.Bodies.rectangle(
      pos.x,
      pos.y,
      PLAYER_SIZE,
      PLAYER_SIZE
    );

    const collisions = matter.Query.collides(
      tempBody,
      matter.Composite.allBodies(world)
    );

    // If there are collisions, call the function again
    return collisions.length > 0 ? this.getInitialPosition(world) : pos;
  }

  processInput(
    input: TPlayerInput,
    players: Record<string, Player>,
    delta: number
  ): void {
    const newVelocity = getPlayerVelocity({
      delta,
      keys: input.keys,
    });
    matter.Body.setVelocity(this.body, newVelocity);

    if (input.keys.includes(ECursorKey.SPACE)) {
      console.log("ATTACK");
      for (const playerId in players) {
        if (playerId === this.id) continue;
        // @TODO: Improve code to account for player direction
        // @TODO: Review attack code (WIP)
        const player = players[playerId];
        if (player.body.position) {
          // use euclidean distance to calculate distance between both players
          const distance = Math.sqrt(
            (player.body.position.x - this.body.position.x) ** 2 +
              (player.body.position.y - this.body.position.y) ** 2
          );
          if (distance < 15) {
            player.health -= 1;
          }
        }
      }
    }
  }

  getPublicData(): TPlayer {
    const position = {
      x: this.body.position.x,
      y: this.body.position.y,
    };
    return {
      position,
      health: this.health,
      lastProcessedInput: this.lastProcessedInput,
    };
  }
}
