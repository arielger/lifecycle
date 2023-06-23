import { TPlayerInput, TPlayer, TPlayers } from "../modules/player";
import { Monsters } from "../modules/monster";

export enum ESocketEventNames {
  // Server to client
  GameUpdate = "GAME_UPDATE",
  // Client to server
  PlayerInput = "PLAYER_INPUT",
  RestartGame = "RESTART_GAME",
}

export type TClientToServerEvents = {
  [ESocketEventNames.PlayerInput]: (input: TPlayerInput) => void;
  [ESocketEventNames.RestartGame]: () => void;
};

export type TServerToClientEvents = {
  [ESocketEventNames.GameUpdate]: (
    gameUpdate:
      | {
          type: "INITIAL_GAME_STATE";
          playerId: string;
          players: TPlayers;
          monsters: Monsters;
        }
      | {
          type: "PLAYER_JOINED";
          playerId: string;
          player: TPlayer;
        }
      | {
          type: "PLAYER_LEFT";
          playerId: string;
          player: TPlayer;
        }
      | {
          type: "GAME_STATE";
          players: TPlayers;
          monsters: Monsters;
        }
  ) => void;
};
