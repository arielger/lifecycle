import { ECursorKey } from "@lifecycle/common/src/modules/player";
import { Direction } from "@lifecycle/common/src/types";

export const getDirectionFromInputKeys = (
  keys: ECursorKey[]
): Direction | undefined => {
  if (keys.includes(ECursorKey.UP)) {
    return Direction.UP;
  } else if (keys.includes(ECursorKey.DOWN)) {
    return Direction.DOWN;
  } else if (keys.includes(ECursorKey.LEFT)) {
    return Direction.LEFT;
  } else if (keys.includes(ECursorKey.RIGHT)) {
    return Direction.RIGHT;
  }
};
