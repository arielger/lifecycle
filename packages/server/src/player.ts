import { v4 as uuidv4 } from "uuid";
import matter from "matter-js";

import {
  TPlayerInput,
  ECursorKey,
  PLAYER_INITIAL_HEALTH,
  PLAYER_INITIAL_ATTACK,
  PLAYER_SIZE,
  TPlayer,
  getPlayerVelocity,
  EPlayerAction,
} from "@lifecycle/common/build/modules/player";
import { getDirectionFromInputKeys } from "@lifecycle/common/build/utils/input";
import { Direction } from "@lifecycle/common/build/types";

import { getValidBodyPosition } from "./map";
import { Monster } from "./monster";

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
  direction: Direction;
  attack: number;
  name: string;
  // Store player's action to send it to the client on the next update (for animations)
  action?: EPlayerAction;

  world: matter.World;
  players: Record<string, Player>;

  constructor(
    world: matter.World,
    players: Record<string, Player>,
    name: string
  ) {
    this.id = uuidv4();
    this.lastProcessedInput = 0;
    this.direction = Direction.DOWN;
    this.health = PLAYER_INITIAL_HEALTH;
    this.attack = PLAYER_INITIAL_ATTACK;
    this.name = name;

    this.players = players;
    this.world = world;

    const initialPosition = getValidBodyPosition(world, PLAYER_SIZE);
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

  processInput(
    input: TPlayerInput,
    delta: number,
    players: Record<string, Player>,
    monsters: Record<string, Monster>
  ): void {
    const direction = getDirectionFromInputKeys(input.keys);

    if (direction) {
      this.direction = direction;

      const newVelocity = getPlayerVelocity({
        delta,
        direction,
      });
      matter.Body.setVelocity(this.body, newVelocity);
    }

    if (input.keys.includes(ECursorKey.SPACE)) {
      this.action = EPlayerAction.ATTACK;
      // Move collision section based on attack direction
      const isHorizontalAttack = [Direction.LEFT, Direction.RIGHT].includes(
        this.direction
      );
      const atackCollisionBody = matter.Bodies.rectangle(
        this.body.position.x +
          (this.direction === Direction.LEFT
            ? -PLAYER_SIZE / 2
            : this.direction === Direction.RIGHT
            ? PLAYER_SIZE / 2
            : 0),
        this.body.position.y +
          (this.direction === Direction.UP
            ? -PLAYER_SIZE / 2
            : this.direction === Direction.DOWN
            ? PLAYER_SIZE / 2
            : 0),
        isHorizontalAttack ? PLAYER_SIZE / 2 : PLAYER_SIZE * 0.75,
        isHorizontalAttack ? PLAYER_SIZE * 0.75 : PLAYER_SIZE / 2
      );

      const monstersList = Object.values(monsters);
      const playersList = Object.values(players).filter(
        (player) => player.id !== this.id
      );
      const entitiesToCheckCollision = [...monstersList, ...playersList];

      const attackedBodies = matter.Query.collides(
        atackCollisionBody,
        entitiesToCheckCollision.map((monster) => monster.body)
      );

      attackedBodies.forEach((attackedBody) => {
        const entity = entitiesToCheckCollision.find(
          (m) => m.body.id === attackedBody.bodyA.id
        );
        entity?.dealDamage(this.attack);
      });
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
      action: this.action,
      name: this.name,
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
    delete this.players[this.id];
  }
}
