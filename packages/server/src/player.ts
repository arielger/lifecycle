import { randomInt } from "./utils";
import { v4 as uuidv4 } from "uuid";

import { TVector2 } from "@lifecycle/common/build/modules/math";
import {
  TPlayerInput,
  processPlayerInput,
} from "@lifecycle/common/build/modules/player";
import { map } from "./map";

export class Player {
  id: string = uuidv4();
  position: TVector2 = this.getInitialPosition();
  lastProcessedInput = 0;

  getInitialPosition(): TVector2 {
    let validPosition;

    while (!validPosition) {
      const pos = { x: randomInt(0, 250), y: randomInt(0, 250) };

      if (!map.checkCollision(pos, 16, 16)) validPosition = pos;
    }

    return validPosition;
  }

  processInput(input: TPlayerInput): void {
    const newPosition = processPlayerInput(this.position, input);

    // @TODO: Move player height and width to constants?
    // Validate that new position is not colliding with map
    if (!map.checkCollision(newPosition, 16, 16)) {
      this.position = newPosition;
    }
  }
}
