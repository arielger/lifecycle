import skeletonSpritesheet from "url:../assets/characters/skeleton.png";

export const preloadAssets = (scene: Phaser.Scene): void => {
  scene.load.spritesheet("skeleton", skeletonSpritesheet, {
    frameWidth: 16,
    frameHeight: 16,
  });
};

export const loadAssets = (scene: Phaser.Scene): void => {
  // reference https://phaser.io/examples/v3/view/animation/create-animation-from-sprite-sheet#

  scene.anims.create({
    key: "walkDown",
    frames: scene.anims.generateFrameNumbers("skeleton", {
      frames: [0, 4, 8, 12],
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "walkUp",
    frames: scene.anims.generateFrameNumbers("skeleton", {
      frames: [1, 5, 9, 13],
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "walkLeft",
    frames: scene.anims.generateFrameNumbers("skeleton", {
      frames: [2, 6, 10, 14],
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "walkRight",
    frames: scene.anims.generateFrameNumbers("skeleton", {
      frames: [3, 7, 11, 15],
    }),
    frameRate: 8,
    repeat: -1,
  });
};
