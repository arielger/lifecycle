import { TVector2 } from "./types";

export function addVectors(a: TVector2, b: TVector2): TVector2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}
