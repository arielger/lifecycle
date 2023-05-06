import { TVector2 } from "@lifecycle/common/src/modules/math";
import { Direction } from "@lifecycle/common/src/types";

/** Infere player movement direction based on previous and new position  **/
export const getDirectionFromPosition = (
  prevPosition: TVector2,
  newPosition: TVector2
): Direction | undefined => {
  return prevPosition.x < newPosition.x
    ? Direction.RIGHT
    : prevPosition.x > newPosition.x
    ? Direction.LEFT
    : prevPosition.y < newPosition.y
    ? Direction.DOWN
    : prevPosition.y > newPosition.y
    ? Direction.UP
    : undefined;
};

/** Infere player movement direction based on current animation **/
export const getDirectionFromAnimation = (animation: string): Direction => {
  return Object.values(Direction).find((direction) =>
    animation.includes(direction)
  )!;
};

export const resetAnimationAndStop = (
  sprite: Phaser.GameObjects.Sprite
): void => {
  sprite.anims.setCurrentFrame(sprite.anims.currentAnim.frames[0]);
  sprite.anims.stop();
};
