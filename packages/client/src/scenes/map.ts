import tilesetFloor from "url:@lifecycle/common/src/modules/map/TilesetFloor.png";
import tilesetNature from "url:@lifecycle/common/src/modules/map/TilesetNature.png";
import mapJson from "@lifecycle/common/src/modules/map/map.json";
import { TVector2 } from "@lifecycle/common/src/modules/math";

export const preloadMapAssets = (scene: Phaser.Scene): void => {
  scene.load.image("floorTileset", tilesetFloor);
  scene.load.image("natureTileset", tilesetNature);
  scene.load.tilemapTiledJSON("map", mapJson);
};

export const createMap = (
  scene: Phaser.Scene
): (Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.StaticGroup)[] => {
  const map = scene.make.tilemap({ key: "map" });

  // Setup floor layer (no collisions)
  const floorTileset = map.addTilesetImage("TilesetFloor", "floorTileset");
  map.createLayer("floor", floorTileset, 0, 0);

  // Setup nature layer (with collisions)
  // Here we are replacing the tiles with custom collision objects by sprites
  // to enable custom collision shapes
  const natureTileset = map.addTilesetImage("TilesetNature", "natureTileset");
  const natureCollisionGroup = scene.physics.add.staticGroup();
  const natureLayer = map.createLayer("nature", natureTileset, 0, 0);
  natureLayer.setCollisionByProperty({ collides: true });

  natureLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
    const collisionGroup = natureTileset.getTileCollisionGroup(tile.index) as {
      objects: { x: number; y: number; width: number; height: number }[];
    };

    const textureCoordinates = natureTileset.getTileTextureCoordinates(
      tile.index
    ) as TVector2;

    if (collisionGroup) {
      const tileX = tile.getLeft();
      const tileY = tile.getTop();

      collisionGroup.objects.forEach((collisionObject) => {
        const tile = scene.add.tileSprite(
          tileX + collisionObject.x,
          tileY + collisionObject.y,
          collisionObject.width,
          collisionObject.height,
          "natureTileset"
        );
        tile.setOrigin(0, 0);
        tile.setTilePosition(
          textureCoordinates.x + collisionObject.x,
          textureCoordinates.y + collisionObject.y
        );

        natureCollisionGroup.add(tile);
      });

      natureLayer.removeTileAt(tile.x, tile.y);
    }
  });

  // const debugGraphics = scene.add.graphics().setAlpha(0.75);
  // natureLayer.renderDebug(debugGraphics, {
  //   tileColor: null, // Color of non-colliding tiles
  //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
  //   faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
  // });

  return [natureLayer, natureCollisionGroup];
};
