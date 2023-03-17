import { Math } from "phaser";

export enum ESocketEventNames {
  // Server to client
  GameUpdate = "GAME_UPDATE",
  // Client to server
  PlayerPositionUpdate = "PLAYER_POSITION_UPDATE",
}

export type TClientToServerEvents = {
  [ESocketEventNames.PlayerPositionUpdate]: (positionDelta: {
    x: number;
    y: number;
  }) => void;
};

export type TServerToClientEvents = {
  [ESocketEventNames.GameUpdate]: (
    gameUpdate:
      | {
          type: "INITIAL_GAME_STATE";
          playerId: string;
          players: TPlayers;
        }
      | {
          type: "PLAYER_JOINED";
          playerId: string;
          player: TPlayer;
        }
      | {
          type: "PLAYER_LEFT";
          playerId: string;
        }
      | {
          type: "GAME_STATE";
          players: TPlayers;
        }
  ) => void;
};

export type TPlayer = {
  position: Math.Vector2;
};

export type TPlayers = Record<string, TPlayer>;

// The list of messages could include other types of actions but for now
// we only have position updates
export type TPlayerInputMessage = {
  playerId: string;
  positionDelta: [number, number];
};
