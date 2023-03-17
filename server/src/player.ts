import { randomInt } from "./utils";
import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Math from "phaser/src/math";

export class Player {
  id: string;
  position: Math.Vector2;

  constructor() {
    this.id = uuidv4();
    this.position = new Math.Vector2(randomInt(0, 500), randomInt(0, 500));
  }
}
