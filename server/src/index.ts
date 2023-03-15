import dotenv from "dotenv";
import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server as SocketServer } from "socket.io";

import { Players, SocketEventNames } from "./types";
import { randomIntFromInterval, createLoop } from "./utils";

// Only require .env files in development or testing environments
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Server configuration

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Game state

const players: Players = {};

type PositionDelta = {
  x: number;
  y: number;
};

let messages: {
  playerId: string;
  positionDelta: PositionDelta;
}[] = [];

io.on("connection", (socket) => {
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

  socket.on(
    SocketEventNames.PlayerPositionUpdate,
    (positionDelta: PositionDelta) => {
      messages.push({
        playerId,
        positionDelta,
      });
    }
  );
});

server.listen(PORT, () => {
  console.log(`Listening on *:${PORT}`);
});

const PHYSICS_LOOP_RATE_PER_SECOND = 66;
const UPDATE_LOOP_RATE_PER_SECOND = 22;

// Create physics loop (about 66 times per second)
createLoop(1000 / PHYSICS_LOOP_RATE_PER_SECOND, () => {
  /*
  We take the input from the clients, and we move them according to what they pushed. If they press left, you move them left. When we add client side prediction, we need to also tell the clients which of their inputs we had processed last. So how does our server update the physics?

  Process input that we stored from the network
  Work out the direction they intended to move based on input stored
  Apply the changes of this direction to the player position
  Store the last processed input number
  Clear any inputs that we have stored
  */

  messages.forEach(({ playerId, positionDelta }) => {
    const player = players[playerId];
    players[playerId] = {
      ...player,
      pos: [player.pos[0] + positionDelta.x, player.pos[1] + positionDelta.y],
    };
  });
  messages = [];
});

// Create update clients loop (about 22 times per second)
createLoop(1000 / UPDATE_LOOP_RATE_PER_SECOND, () => {
  /*
  The update loop sends the state of the server to all clients. This varies per game of course, and in our example the state consists of player positions, the inputs of the player we have already processed (the last processed input number), and the local server time.
  What you send in the state update is up to you, and often more than one server update loop can be employed to lower the amount of traffic used. A simple example would be a day/night cycle. If the cycle was changing at a much lower rate than everything else, you can send the state of the sun every 5 seconds instead of every 45 ms.
  */
  io.emit(SocketEventNames.PlayersUpdates, players);
});
