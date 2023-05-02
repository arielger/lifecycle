import matter from "matter-js";
import mapJson from "@lifecycle/common/src/modules/map/map.json";
import { MAP_SIZE } from "@lifecycle/common/build/modules/map";

const addWorldBounds = (world: Matter.World) => {
  matter.Composite.add(world, [
    // Horizontal bounds (left and right)
    matter.Bodies.rectangle(-5, MAP_SIZE.height / 2, 10, MAP_SIZE.height, {
      isStatic: true,
    }),
    matter.Bodies.rectangle(
      MAP_SIZE.width + 5,
      MAP_SIZE.height / 2,
      10,
      MAP_SIZE.height,
      {
        isStatic: true,
      }
    ),

    // Vertical bounds (top and bottom)
    matter.Bodies.rectangle(MAP_SIZE.width / 2, -5, MAP_SIZE.width, 10, {
      isStatic: true,
    }),
    matter.Bodies.rectangle(
      MAP_SIZE.width / 2,
      MAP_SIZE.height + 5,
      MAP_SIZE.width,
      10,
      { isStatic: true }
    ),
  ]);
};

const layerToTileset = (
  layerName: string,
  tilesetName: string,
  world: Matter.World
) => {
  const mapLayer = mapJson.layers.find((l) => l.name === layerName);

  if (!mapLayer) {
    throw Error(`Map layer with name ${layerName} not found`);
  }

  // Tiled editor assigns a global ID to each tile in the tileset
  // We need to get the first GID to calculate the tile index
  // More information: https://doc.mapeditor.org/en/stable/reference/global-tile-ids/#mapping-a-gid-to-a-local-tile-id

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tileset = mapJson.tilesets.find((t) => t.name === tilesetName)!;
  const tilesetFirstGID = tileset.firstgid;

  mapLayer.data.forEach((tileNumber, i) => {
    if (tileNumber === 0) return;

    const tileX = i % mapLayer.width;
    const tileY = Math.floor(i / mapLayer.width);

    const localTilesetTileId = tileNumber - tilesetFirstGID;

    const customCollisionObjects =
      tileset.tiles?.[localTilesetTileId].objectgroup?.objects;

    if (customCollisionObjects) {
      customCollisionObjects.forEach((collisionObject) => {
        const body = matter.Bodies.rectangle(
          tileX * mapJson.tilewidth +
            collisionObject.x +
            collisionObject.width / 2,
          tileY * mapJson.tileheight +
            collisionObject.y +
            collisionObject.height / 2,
          collisionObject.width,
          collisionObject.height,
          { isStatic: true }
        );
        matter.Composite.add(world, body);
      });
    } else {
      // Ony enable rectangle custom collision objects for now
      const body = matter.Bodies.rectangle(
        tileX * mapJson.tilewidth + mapJson.tilewidth / 2,
        tileY * mapJson.tileheight + mapJson.tileheight / 2,
        mapJson.tilewidth,
        mapJson.tileheight,
        { isStatic: true }
      );
      matter.Composite.add(world, body);
    }
  });
};

export class Map {
  constructor(world: matter.World) {
    addWorldBounds(world);
    layerToTileset("nature", "TilesetNature", world);
  }
}
