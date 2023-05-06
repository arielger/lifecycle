import { Direction } from "@lifecycle/common/src/types";

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
