import { TVector2, addVectors } from "../math";
import { TPlayerInput, ECursorKey } from "./types";
import { PLAYER_VELOCITY } from "./config";

export const processPlayerInput = (
  currentPosition: TVector2,
  { key, timeDelta }: TPlayerInput
): TVector2 => {
  const movement = (timeDelta * PLAYER_VELOCITY) / 1000;
  const positionChange = {
    x:
      key === ECursorKey.LEFT
        ? -movement
        : key === ECursorKey.RIGHT
        ? movement
        : 0,
    y:
      key === ECursorKey.UP
        ? -movement
        : key === ECursorKey.DOWN
        ? movement
        : 0,
  };
  return addVectors(currentPosition, positionChange);
};
