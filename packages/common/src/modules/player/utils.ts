import matter from "matter-js";

import { Direction } from "../../types";
import { ECursorKey } from "./types";
import { PLAYER_VELOCITY } from "./config";

export const getPlayerVelocity = ({
  delta,
  direction,
}: {
  delta: number;
  direction?: Direction;
}) => {
  const movement = (delta * PLAYER_VELOCITY) / 1000;

  return {
    x:
      direction === Direction.LEFT
        ? -movement
        : direction === Direction.RIGHT
        ? movement
        : 0,
    y:
      direction === Direction.UP
        ? -movement
        : direction === Direction.DOWN
        ? movement
        : 0,
  };
};
