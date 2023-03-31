// import * as dat from "dat.gui";

export const gameConfig = {
  lag: 0,
  // If false it will simulate a client-side only game
  serverSideProcessing: true,
  clientSidePrediction: true,
  serverReconciliation: true,
};

// const gui = new dat.GUI({ name: "My GUI", width: 400 });

// gui.add(gameConfig, "clientSidePrediction").name("Client-side prediction");
// gui.add(gameConfig, "serverReconciliation").name("Server reconciliation");
// gui.add(gameConfig, "serverSideProcessing").name("Server-side processing");
// gui.add(gameConfig, "lag", 0, 500);
