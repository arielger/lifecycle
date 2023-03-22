import { randomInt } from "./utils";
import { v4 as uuidv4 } from "uuid";

import { TVector2 } from "../../common/src/modules/math";
import {
  TPlayerInput,
  processPlayerInput,
} from "../../common/src/modules/player";

export class Player {
  id: string = uuidv4();
  position: TVector2 = { x: randomInt(0, 250), y: randomInt(0, 250) };
  lastProcessedInput = 0;

  processInput(input: TPlayerInput): void {
    this.position = processPlayerInput(this.position, input);
  }
}
