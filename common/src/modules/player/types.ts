import { TVector2 } from "../math";

export enum ECursorKey {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

// The list of messages could include other types of actions but for now
// we only have position updates
export type TPlayerInput = {
  key: ECursorKey;
  timeDelta: number;
  sequenceNumber: number;
};

export type TPlayerInputMessage = {
  playerId: string;
  input: TPlayerInput;
};

export type TPlayer = {
  position: TVector2;
};

export type TPlayers = Record<string, TPlayer>;
