import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";

import {
  TClientToServerEvents,
  TServerToClientEvents,
} from "@lifecycle/common/build/types";
import { startGame } from "./game";

// Only require .env files in development or testing environments
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.get("/", async (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error as any;
    res.status(503).send();
  }
});

const io = new SocketServer<TClientToServerEvents, TServerToClientEvents>(
  server,
  {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  }
);

startGame(io);

server.listen(PORT, () => {
  console.log(`Listening on *:${PORT}`);
});
