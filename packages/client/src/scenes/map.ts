import tilesetFloor from "url:@lifecycle/common/src/modules/map/TilesetFloor.png";
import tilesetNature from "url:@lifecycle/common/src/modules/map/TilesetNature.png";
import mapJson from "@lifecycle/common/src/modules/map/map.json";

export const preloadMapAssets = (scene: Phaser.Scene): void => {
  scene.load.image("floorTileset", tilesetFloor);
  scene.load.image("natureTileset", tilesetNature);
  scene.load.tilemapTiledJSON("map", mapJson);
};

export const createMap = (scene: Phaser.Scene): void => {
  const map = scene.make.tilemap({ key: "map" });

  const floorTileset = map.addTilesetImage("TilesetFloor", "floorTileset");
  map.createLayer("floor", floorTileset, 0, 0);

  const natureTileset = map.addTilesetImage("TilesetNature", "natureTileset");
  const natureLayer = map.createLayer("nature", natureTileset, 0, 0);
  natureLayer.setCollisionByProperty({ collides: true });

  scene.matter.world.convertTilemapLayer(natureLayer);
};
