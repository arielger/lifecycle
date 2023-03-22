import { randomInt } from "./utils";
import { v4 as uuidv4 } from "uuid";

import { TVector2 } from "../../common/src/modules/math";
import {
  TPlayerInput,
  processPlayerInput,
} from "../../common/src/modules/player";

export class Player {
  id: string;
  position: TVector2;

  constructor() {
    this.id = uuidv4();
    this.position = {
      x: randomInt(0, 500),
      y: randomInt(0, 500),
    };
  }

  processInput(input: TPlayerInput): void {
    this.position = processPlayerInput(this.position, input);
  }
}
