import matter from "matter-js";
import { Socket, Server as SocketServer } from "socket.io";

import {
  TClientToServerEvents,
  TServerToClientEvents,
  ESocketEventNames,
} from "@lifecycle/common/build/types";
import { TPlayerInputMessage } from "@lifecycle/common/build/modules/player";

import { Player, getPlayersPublicData } from "./player";
import { Monster, initializeMonsters, getMonstersPublicData } from "./monster";
import { Map } from "./map";
import { createLoop } from "./utils";

const UPDATE_LOOP_RATE_PER_SECOND = 22;

type PlayerMap = Record<string, Player>;

type MonstersMap = Record<string, Monster>;

function handleNewPlayerJoined({
  engine,
  socket,
  players,
  monsters,
}: {
  engine: Matter.Engine;
  socket: Socket<TClientToServerEvents, TServerToClientEvents>;
  players: PlayerMap;
  monsters: MonstersMap;
}) {
  const player = new Player(engine.world, players);

  // Add new player to player list
  players[player.id] = player;

  // Send the player list to the recently connected player with their playerId
  socket.emit(ESocketEventNames.GameUpdate, {
    type: "INITIAL_GAME_STATE",
    players: getPlayersPublicData(players),
    monsters: getMonstersPublicData(monsters),
    playerId: player.id,
  });

  // Send the new player to the rest of players
  socket.broadcast.emit(ESocketEventNames.GameUpdate, {
    type: "PLAYER_JOINED",
    playerId: player.id,
    player: player.getPublicData(),
  });

  return player;
}

export function startGame(
  io: SocketServer<TClientToServerEvents, TServerToClientEvents>
): void {
  let inputMessages: TPlayerInputMessage[] = [];

  // Initialize matter.js physics engine
  const engine = matter.Engine.create({
    gravity: { x: 0, y: 0 },
  });
  const runner = matter.Runner.create();
  matter.Runner.run(runner, engine);

  new Map(engine.world);

  // Game state
  const players: PlayerMap = {};
  const monsters: MonstersMap = {};

  initializeMonsters(engine.world, monsters);

  matter.Events.on(runner, "afterTick", (event) => {
    const delta = event.source.delta;

    Object.keys(monsters).forEach((monsterId) => {
      const monster = monsters[monsterId];
      monster.update();
    });

    // Restart players velocity on each tick
    Object.keys(players).forEach((playerId) => {
      const player = players[playerId];
      matter.Body.setVelocity(player.body, { x: 0, y: 0 });
    });

    inputMessages.forEach(({ playerId, input }) => {
      const player = players[playerId];
      if (player) {
        player.processInput(input, delta, players, monsters);
        player.lastProcessedInput = input.inputNumber;
      }
    });
    inputMessages = [];
  });

  io.on("connection", (socket) => {
    let player = handleNewPlayerJoined({
      engine,
      socket,
      players,
      monsters,
    });

    socket.on("disconnect", () => {
      delete players[player.id];
      socket.broadcast.emit(ESocketEventNames.GameUpdate, {
        type: "PLAYER_LEFT",
        playerId: player.id,
      });
    });

    socket.on(ESocketEventNames.PlayerInput, (input) => {
      inputMessages.push({
        playerId: player.id,
        input,
      });
    });

    socket.on(ESocketEventNames.RestartGame, () => {
      player = handleNewPlayerJoined({
        engine,
        socket,
        players,
        monsters,
      });
    });
  });

  createLoop(1000 / UPDATE_LOOP_RATE_PER_SECOND, () => {
    io.emit(ESocketEventNames.GameUpdate, {
      type: "GAME_STATE",
      players: getPlayersPublicData(players),
      monsters: getMonstersPublicData(monsters),
    });
  });
}
