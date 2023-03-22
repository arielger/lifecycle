import { TPlayerInput, TPlayer, TPlayers } from "../modules/player";

export enum ESocketEventNames {
  // Server to client
  GameUpdate = "GAME_UPDATE",
  // Client to server
  PlayerPositionUpdate = "PLAYER_POSITION_UPDATE",
}

export type TClientToServerEvents = {
  [ESocketEventNames.PlayerPositionUpdate]: (input: TPlayerInput) => void;
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
