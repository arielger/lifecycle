import { TVector2 } from "@lifecycle/common/build/modules/math";
import mapJson from "@lifecycle/common/src/modules/map/map.json";
import { MAP_SIZE } from "@lifecycle/common/build/modules/map";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const natureLayer = mapJson.layers.find((l) => l.name === "nature")!;

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

      this.colliders.push({
        width: mapJson.tilewidth,
        height: mapJson.tileheight,
        position: {
          x: tileX * mapJson.tilewidth,
          y: tileY * mapJson.tileheight,
        },
      });
    });
  }

  checkCollision(position: TVector2, width: number, height: number): boolean {
    const worldCollides =
      position.x < 0 ||
      position.x > MAP_SIZE.width - width ||
      position.y < 0 ||
      position.y > MAP_SIZE.height - height;

    const tilesCollides = this.colliders.some(
      (collider) =>
        !(
          collider.position.x > position.x + width ||
          collider.position.x + collider.width < position.x ||
          collider.position.y > position.y + height ||
          collider.position.y + collider.height < position.y
        )
    );

    return worldCollides || tilesCollides;
  }
}

export const map = new Map();
