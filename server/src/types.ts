export type Player = {
  id: string;
  pos: [number, number];
};

export enum SocketEventNames {
  AllPlayers = "ALL_PLAYERS",
  PlayerConnected = "PLAYER_CONNECTED",
  PlayerDisconnected = "PLAYER_DISCONNECTED",
}
