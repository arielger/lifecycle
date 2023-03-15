export type Player = {
  pos: [number, number];
};

export type Players = Record<string, Player>;

export enum SocketEventNames {
  // Server to client
  AllPlayers = "ALL_PLAYERS",
  PlayerConnected = "PLAYER_CONNECTED",
  PlayerDisconnected = "PLAYER_DISCONNECTED",
  PlayersUpdates = "PLAYERS_UPDATES",
  // Client to server
  PlayerPositionUpdate = "PLAYER_POSITION_UPDATE",
}
