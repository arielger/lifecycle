import dotenv from "dotenv";
import express from "express";
import http from "http";

import { Server as SocketServer } from "socket.io";

import {
  TClientToServerEvents,
  TServerToClientEvents,
  ESocketEventNames,
} from "../../common/src/types";
import { TPlayerInputMessage } from "../../common/src/modules/player";
import { Player } from "./player";
import "./map";
import { createLoop } from "./utils";

// Only require .env files in development or testing environments
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Server configuration

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new SocketServer<TClientToServerEvents, TServerToClientEvents>(
  server,
  {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  }
);

// Game state
const players: Record<string, Player> = {};
let inputMessages: TPlayerInputMessage[] = [];

io.on("connection", (socket) => {
  const player = new Player();
  players[player.id] = player;

  // Send the player list to the recently connected player with their playerId
  socket.emit(ESocketEventNames.GameUpdate, {
    type: "INITIAL_GAME_STATE",
    players,
    playerId: player.id,
  });

  // Send the new player to the rest of players
  socket.broadcast.emit(ESocketEventNames.GameUpdate, {
    type: "PLAYER_JOINED",
    playerId: player.id,
    player: player,
  });

  socket.on("disconnect", () => {
    delete players[player.id];
    socket.broadcast.emit(ESocketEventNames.GameUpdate, {
      type: "PLAYER_LEFT",
      playerId: player.id,
    });
  });

  socket.on(ESocketEventNames.PlayerPositionUpdate, (input) => {
    inputMessages.push({
      playerId: player.id,
      input,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Listening on *:${PORT}`);
});

const PHYSICS_LOOP_RATE_PER_SECOND = 66;
const UPDATE_LOOP_RATE_PER_SECOND = 22;

// Create physics loop (about 66 times per second)
/*
  We take the input from the clients, and we move them according to what they pushed. If they press left, you move them left. When we add client side prediction, we need to also tell the clients which of their inputs we had processed last. So how does our server update the physics?

  Process input that we stored from the network
  Work out the direction they intended to move based on input stored
  Apply the changes of this direction to the player position
  Store the last processed input number
  Clear any inputs that we have stored
  */
createLoop(1000 / PHYSICS_LOOP_RATE_PER_SECOND, () => {
  inputMessages.forEach(({ playerId, input }) => {
    const player = players[playerId];
    if (player) {
      player.processInput(input);
      player.lastProcessedInput = input.inputNumber;
    }
  });
  inputMessages = [];
});

// Create update clients loop (about 22 times per second)

/*
  The update loop sends the state of the server to all clients. This varies per game of course, and in our example the state consists of player positions, the inputs of the player we have already processed (the last processed input number), and the local server time.
  What you send in the state update is up to you, and often more than one server update loop can be employed to lower the amount of traffic used. A simple example would be a day/night cycle. If the cycle was changing at a much lower rate than everything else, you can send the state of the sun every 5 seconds instead of every 45 ms.
  */
createLoop(1000 / UPDATE_LOOP_RATE_PER_SECOND, () => {
  // @TODO: Review private vs public information in players
  io.emit(ESocketEventNames.GameUpdate, { type: "GAME_STATE", players });
});
