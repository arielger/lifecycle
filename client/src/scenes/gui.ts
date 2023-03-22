import * as dat from "dat.gui";

export const gameConfig = {
  lag: 0,
  clientSidePrediction: false,
};

const gui = new dat.GUI({ name: "My GUI" });

gui.add(gameConfig, "clientSidePrediction");
gui.add(gameConfig, "lag", 0, 500);
