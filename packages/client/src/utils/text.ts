export const getScreenCenter = (
  scene: Phaser.Scene
): { x: number; y: number } => ({
  x: scene.cameras.main.worldView.x + scene.cameras.main.width / 2,
  y: scene.cameras.main.worldView.y + scene.cameras.main.height / 2,
});
