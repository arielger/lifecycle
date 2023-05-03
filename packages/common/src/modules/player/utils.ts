import matter from "matter-js";

import { ECursorKey } from "./types";
import { PLAYER_VELOCITY } from "./config";

export const getPlayerVelocity = ({
  delta,
  keys,
}: {
  delta: number;
  keys: ECursorKey[];
}) => {
  const movement = (delta * PLAYER_VELOCITY) / 1000;

  const directionKey = keys.find((k) =>
    [
      ECursorKey.UP,
      ECursorKey.DOWN,
      ECursorKey.LEFT,
      ECursorKey.RIGHT,
    ].includes(k)
  );

  return {
    x:
      directionKey === ECursorKey.LEFT
        ? -movement
        : directionKey === ECursorKey.RIGHT
        ? movement
        : 0,
    y:
      directionKey === ECursorKey.UP
        ? -movement
        : directionKey === ECursorKey.DOWN
        ? movement
        : 0,
  };
};
