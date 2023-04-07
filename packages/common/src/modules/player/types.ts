import { TVector2 } from "../math";

export enum ECursorKey {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  SPACE = "SPACE",
}

// The list of messages could include other types of actions but for now
// we only have position updates
export type TPlayerInput = {
  keys: ECursorKey[];
  timeDelta: number;
  inputNumber: number;
};

export type TPlayerInputMessage = {
  playerId: string;
  input: TPlayerInput;
};

export type TPlayer = {
  position: TVector2;
  lastProcessedInput: number;
  health: number;
};

export type TPlayers = Record<string, TPlayer>;
