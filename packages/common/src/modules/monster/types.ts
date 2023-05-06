import { TVector2 } from "../math";

export type Monster = {
  position: TVector2;
  health: number;
};

export type Monsters = Record<string, Monster>;
