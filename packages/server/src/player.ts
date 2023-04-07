import { randomInt } from "./utils";
import { v4 as uuidv4 } from "uuid";

import { TVector2 } from "@lifecycle/common/build/modules/math";
import {
  TPlayerInput,
  processPlayerInput,
} from "@lifecycle/common/build/modules/player";
import { MAP_SIZE } from "@lifecycle/common/build/modules/map";
import { map } from "./map";

// @TODO: Move player height and width to constants?
const playerSize = 16;

export class Player {
  id: string = uuidv4();
  position: TVector2 = this.getInitialPosition();
  lastProcessedInput = 0;

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

  processInput(input: TPlayerInput): void {
    const newPosition = processPlayerInput(this.position, input);

    // Validate that new position is not colliding with map
    if (!map.checkCollision(newPosition, playerSize, playerSize)) {
      this.position = newPosition;
    }
  }
}
