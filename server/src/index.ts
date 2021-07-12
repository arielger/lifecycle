import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server as SocketServer } from "socket.io";

import { Player, SocketEventNames } from "./types";
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

let players: Player[] = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  const newPlayer = {
    id: uuidv4(),
    // @TODO: Review where to initialize player - check collisions
    pos: [randomIntFromInterval(0, 500), randomIntFromInterval(0, 500)] as [
      number,
      number
    ],
  };

  players.push(newPlayer);

  // Send the player list to the recently connected player
  socket.emit(SocketEventNames.AllPlayers, players);

  // Send the new player to the rest of players
  socket.broadcast.emit(SocketEventNames.PlayerConnected, newPlayer);

  socket.on("disconnect", () => {
    players = players.filter((player) => player.id !== newPlayer.id);
    socket.broadcast.emit(SocketEventNames.PlayerDisconnected, newPlayer.id);
  });

  // socket.on("update", () => {});
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
