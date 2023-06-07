import heartSpritesheet from "url:../../assets/ui/heart.png";
import healthBarContainer from "url:../../assets/ui/health-container.png";
import healthFill from "url:../../assets/ui/health-fill.png";

import { PLAYER_INITIAL_HEALTH } from "@lifecycle/common/src/modules/player";

const HEALTH_BAR_WIDTH = 68; // Based on health bar image (76px total - 6px from margins)

const sizes = {
  // General health bar margin
  containerMargin: 2,
  heartWidth: 16,
  // Space between heart and health bar
  healthBarLeftMargin: 2,
  // Distances from start of the health bar to the position of the health fill
  healthFillTopMargin: 3,
  healthFillLeftMargin: 4,
};
const healthBarLeft =
  sizes.containerMargin + sizes.heartWidth + sizes.healthBarLeftMargin;
const healthFillLeft = healthBarLeft + sizes.healthFillLeftMargin;

export class HealthBarUI {
  healthFill: Phaser.GameObjects.Image;
  currentHealth: number;

  scene: Phaser.Scene;

  constructor({ scene, health }: { scene: Phaser.Scene; health: number }) {
    scene.add
      .image(sizes.containerMargin, sizes.containerMargin, "heart")
      .setOrigin(0, 0)
      .setScrollFactor(0, 0);

    scene.add
      .image(healthBarLeft, sizes.containerMargin + 1, "health-bar-container")
      .setOrigin(0, 0)
      .setScrollFactor(0, 0);

    this.healthFill = scene.add
      .image(
        healthFillLeft,
        sizes.containerMargin + sizes.healthFillTopMargin + 1,
        "health-fill"
      )
      .setOrigin(0, 0)
      .setScrollFactor(0, 0);
    this.healthFill.displayWidth = HEALTH_BAR_WIDTH;

    this.currentHealth = health;
    this.scene = scene;
  }

  static preloadAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet("heart", heartSpritesheet, {
      frameWidth: 16,
      frameHeight: 16,
    });
    scene.load.image("health-bar-container", healthBarContainer);
    scene.load.image("health-fill", healthFill);
  }

  updateHealth(health: number): void {
    const healthDifference = health - this.currentHealth;
    if (healthDifference === 0) return;

    this.currentHealth = health;

    const healthPercentage = health / PLAYER_INITIAL_HEALTH; // If we are adding more health, we need to update this

    this.scene.tweens.add({
      targets: [this.healthFill],
      displayWidth: healthPercentage * HEALTH_BAR_WIDTH,
      duration: 200,
      ease: "Sine.easeInOut",
    });
  }
}
