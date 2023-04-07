import heartSpritesheet from "url:../assets/ui/Heart.png";

const HEALTH_POINTS_PER_HEART = 4;

export class HeartsUI {
  hearts: Phaser.GameObjects.Sprite[] = [];

  constructor({ scene, health }: { scene: Phaser.Scene; health: number }) {
    const heartsCount = health / HEALTH_POINTS_PER_HEART;

    for (let i = 0; i < heartsCount; i++) {
      const heart = scene.add
        .sprite(10 + i * 18, 10, "heart")
        // Prevent element moving when camera moves
        .setScrollFactor(0, 0);
      this.hearts.push(heart);
    }
  }

  static preloadAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet("heart", heartSpritesheet, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  updateHealth(health: number): void {
    this.hearts.forEach((heartContainer, index) => {
      // The value of the health bar segment at the given index
      const value = Math.min(
        Math.max(health - HEALTH_POINTS_PER_HEART * index, 0),
        4
      );

      heartContainer.setFrame(4 - value);
    });
  }
}
