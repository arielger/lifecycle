import { TVector2 } from "@lifecycle/common/build/modules/math";
import mapJson from "@lifecycle/common/src/modules/map/map.json";

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
    return this.colliders.some(
      (collider) =>
        !(
          collider.position.x > position.x + width ||
          collider.position.x + collider.width < position.x ||
          collider.position.y > position.y + height ||
          collider.position.y + collider.height < position.y
        )
    );
  }
}

export const map = new Map();
