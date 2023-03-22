import * as dat from "dat.gui";

export const gameConfig = {
  lag: 0,
  clientSidePrediction: false,
  serverReconciliation: false,
};

const gui = new dat.GUI({ name: "My GUI", width: 400 });

gui.add(gameConfig, "clientSidePrediction").name("Client-side prediction");
gui.add(gameConfig, "serverReconciliation").name("Server reconciliation");
gui.add(gameConfig, "lag", 0, 500);
