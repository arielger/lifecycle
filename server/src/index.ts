import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server as SocketServer } from "socket.io";

import { Players, SocketEventNames } from "./types";
import { randomIntFromInterval } from "./utils";

const app = express();
const server = http.createServer(app);

// @TODO: Get client url using env variables
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:1234",
    methods: ["GET", "POST"],
  },
});

const players: Players = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  const playerId = uuidv4();
  const playerData = {
    // @TODO: Review where to initialize player - check collisions
    pos: [randomIntFromInterval(0, 500), randomIntFromInterval(0, 500)] as [
      number,
      number
    ],
  };
  players[playerId] = playerData;

  // Send the player list to the recently connected player
  socket.emit(SocketEventNames.AllPlayers, players);

  // Send the new player to the rest of players
  socket.broadcast.emit(SocketEventNames.PlayerConnected, {
    [playerId]: playerData,
  });

  socket.on("disconnect", () => {
    delete players[playerId];
    socket.broadcast.emit(SocketEventNames.PlayerDisconnected, playerId);
  });

  socket.on(SocketEventNames.PlayerPositionUpdate, (positionDelta) => {
    const updatedPlayer = players[playerId];
    players[playerId] = {
      ...updatedPlayer,
      pos: [
        updatedPlayer.pos[0] + positionDelta.x,
        updatedPlayer.pos[1] + positionDelta.y,
      ],
    };

    // @TODO: Updates should be sent in a game loop
    // @TODO: Only send the updated players (and keys)
    io.emit(SocketEventNames.PlayersUpdates, players);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:3000");
});
