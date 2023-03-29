import tilesetFloor from "url:../assets/map/TilesetFloor.png";
import tilesetNature from "url:../assets/map/TilesetNature.png";
import mapJson from "url:../assets/map/map.json";

export const preloadMapAssets = (scene: Phaser.Scene): void => {
  scene.load.image("floorTileset", tilesetFloor);
  scene.load.image("natureTileset", tilesetNature);
  scene.load.tilemapTiledJSON("map", mapJson);
};

export const createMap = (
  scene: Phaser.Scene
): Phaser.Tilemaps.TilemapLayer => {
  const map = scene.make.tilemap({ key: "map" });

  const floorTileset = map.addTilesetImage("TilesetFloor", "floorTileset");
  const natureTileset = map.addTilesetImage("TilesetNature", "natureTileset");

  map.createLayer("floor", floorTileset, 0, 0);
  const natureLayer = map.createLayer("nature", natureTileset, 0, 0);
  natureLayer.setCollisionByProperty({ collides: true });

  const debugGraphics = scene.add.graphics().setAlpha(0.75);
  natureLayer.renderDebug(debugGraphics, {
    tileColor: null, // Color of non-colliding tiles
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
  });

  return natureLayer;
};
