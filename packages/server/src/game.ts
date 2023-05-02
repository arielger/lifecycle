import matter from "matter-js";
import { Server as SocketServer } from "socket.io";

import {
  TClientToServerEvents,
  TServerToClientEvents,
  ESocketEventNames,
} from "@lifecycle/common/build/types";
import { TPlayerInputMessage } from "@lifecycle/common/build/modules/player";

import { Player, getPlayersPublicData } from "./player";
import { Map } from "./map";
import { createLoop } from "./utils";

const UPDATE_LOOP_RATE_PER_SECOND = 22;

export function startGame(
  io: SocketServer<TClientToServerEvents, TServerToClientEvents>
): void {
  // Game state
  const players: Record<string, Player> = {};
  let inputMessages: TPlayerInputMessage[] = [];

  // Initialize matter.js physics engine
  const engine = matter.Engine.create({
    gravity: { x: 0, y: 0 },
  });
  const runner = matter.Runner.create();
  matter.Runner.run(runner, engine);

  new Map(engine.world);

  matter.Events.on(runner, "afterTick", (event) => {
    // Restart players velocity on each tick
    Object.keys(players).forEach((playerId) => {
      const player = players[playerId];
      matter.Body.setVelocity(player.body, { x: 0, y: 0 });
    });

    inputMessages.forEach(({ playerId, input }) => {
      const player = players[playerId];
      if (player) {
        player.processInput(input, players, event.source.delta);
        player.lastProcessedInput = input.inputNumber;
      }
    });
    inputMessages = [];
  });

  io.on("connection", (socket) => {
    const player = new Player(engine.world);
    players[player.id] = player;

    // Send the player list to the recently connected player with their playerId
    socket.emit(ESocketEventNames.GameUpdate, {
      type: "INITIAL_GAME_STATE",
      players: getPlayersPublicData(players),
      playerId: player.id,
    });

    // Send the new player to the rest of players
    socket.broadcast.emit(ESocketEventNames.GameUpdate, {
      type: "PLAYER_JOINED",
      playerId: player.id,
      player: player.getPublicData(),
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

  createLoop(1000 / UPDATE_LOOP_RATE_PER_SECOND, () => {
    io.emit(ESocketEventNames.GameUpdate, {
      type: "GAME_STATE",
      players: getPlayersPublicData(players),
    });
  });
}
