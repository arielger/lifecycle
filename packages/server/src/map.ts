import { TVector2 } from "@lifecycle/common/build/modules/math";
import mapJson from "@lifecycle/common/src/modules/map/map.json";
import { MAP_SIZE } from "@lifecycle/common/build/modules/map";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const natureLayer = mapJson.layers.find((l) => l.name === "nature")!;

// Tiled editor assigns a global ID to each tile in the tileset
// We need to get the first GID to calculate the tile index
// More information: https://doc.mapeditor.org/en/stable/reference/global-tile-ids/#mapping-a-gid-to-a-local-tile-id

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const natureTileset = mapJson.tilesets.find((t) => t.name === "TilesetNature")!;
const natureTilesetFirstGID = natureTileset.firstgid;

export class Map {
  colliders: {
    width: number;
    height: number;
    position: TVector2;
  }[] = [];

  constructor() {
    natureLayer.data.forEach((tileNumber, i) => {
      if (tileNumber === 0) return;

      const tileX = i % natureLayer.width;
      const tileY = Math.floor(i / natureLayer.width);

      const localTilesetTileId = tileNumber - natureTilesetFirstGID;

      const customCollisionObjects =
        natureTileset.tiles![localTilesetTileId].objectgroup?.objects;

      if (customCollisionObjects) {
        customCollisionObjects.forEach((collisionObject) => {
          this.colliders.push({
            width: collisionObject.width,
            height: collisionObject.height,
            position: {
              x: tileX * mapJson.tilewidth + collisionObject.x,
              y: tileY * mapJson.tileheight + collisionObject.y,
            },
          });
        });
      } else {
        this.colliders.push({
          width: mapJson.tilewidth,
          height: mapJson.tileheight,
          position: {
            x: tileX * mapJson.tilewidth,
            y: tileY * mapJson.tileheight,
          },
        });
      }
    });
  }

  checkCollision(position: TVector2, width: number, height: number): boolean {
    const worldCollides =
      position.x < width / 2 ||
      position.x > MAP_SIZE.width - width / 2 ||
      position.y < height / 2 ||
      position.y > MAP_SIZE.height - height / 2;

    const tilesCollides = this.colliders.some(
      (collider) =>
        !(
          collider.position.x > position.x + width / 2 ||
          collider.position.x + collider.width < position.x - width / 2 ||
          collider.position.y > position.y + height / 2 ||
          collider.position.y + collider.height < position.y - height / 2
        )
    );

    return worldCollides || tilesCollides;
  }
}

export const map = new Map();
