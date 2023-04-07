import { randomInt } from "./utils";
import { v4 as uuidv4 } from "uuid";

import { TVector2 } from "@lifecycle/common/build/modules/math";
import {
  TPlayerInput,
  getPlayerNewPosition,
  ECursorKey,
  PLAYER_HEALTH,
} from "@lifecycle/common/build/modules/player";
import { MAP_SIZE } from "@lifecycle/common/build/modules/map";
import { map } from "./map";

// @TODO: Move player height and width to constants?
const playerSize = 16;

export class Player {
  id: string = uuidv4();
  position: TVector2 = this.getInitialPosition();
  lastProcessedInput = 0;
  health = PLAYER_HEALTH;

  getInitialPosition(): TVector2 {
    let validPosition;

    while (!validPosition) {
      const pos = {
        x: randomInt(playerSize / 2, MAP_SIZE.width - playerSize / 2),
        y: randomInt(playerSize / 2, MAP_SIZE.height - playerSize / 2),
      };

      if (!map.checkCollision(pos, playerSize, playerSize)) validPosition = pos;
    }

    return validPosition;
  }

  processInput(input: TPlayerInput, players: Record<string, Player>): void {
    const newPosition = getPlayerNewPosition(this.position, input);

    if (input.keys.includes(ECursorKey.SPACE)) {
      for (const playerId in players) {
        if (playerId === this.id) continue;

        // @TODO: Improve code to account for player direction
        // @TODO: Review attack code (WIP)
        const player = players[playerId];
        if (player.position) {
          // use euclidean distance to calculate distance between both players
          const distance = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
              (player.position.y - this.position.y) ** 2
          );

          if (distance < 15) {
            player.health -= 1;
          }
        }
      }
    }

    // Validate that new position is not colliding with map
    if (!map.checkCollision(newPosition, playerSize, playerSize)) {
      this.position = newPosition;
    }
  }
}
