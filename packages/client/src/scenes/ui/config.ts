import dat from "dat.gui";

export const gameConfig = {
  lag: process.env.NODE_ENV === "development" ? 150 : 0,
  // If false it will simulate a client-side only game
  serverSideProcessing: true,
  clientSidePrediction: true,
  serverReconciliation: true,
};

if (process.env.NODE_ENV === "development") {
  const gui = new dat.GUI({ name: "My GUI", width: 400, closed: true });

  gui.add(gameConfig, "clientSidePrediction").name("Client-side prediction");
  gui.add(gameConfig, "serverReconciliation").name("Server reconciliation");
  gui.add(gameConfig, "serverSideProcessing").name("Server-side processing");
  gui.add(gameConfig, "lag", 0, 1000);
}
