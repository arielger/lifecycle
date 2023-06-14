import heartSpritesheet from "url:../../assets/ui/heart.png";
import healthBarContainer from "url:../../assets/ui/health-container.png";
import healthFill from "url:../../assets/ui/health-fill.png";

import { PLAYER_INITIAL_HEALTH } from "@lifecycle/common/src/modules/player";
import { GameAssets } from "../../types";

const sizes = {
  // General health bar margin
  containerMargin: 8,
  heartWidth: 16,
  // Space between heart and health bar
  healthBarLeftMargin: 2,
  // Distances from start of the health bar to the position of the health fill
  healthFillTopMargin: 1,
  healthFillLeftMargin: 1,
};

const HEALTH_BAR_WIDTH = 70;
const HEALTH_BAR_FILL_WIDTH = HEALTH_BAR_WIDTH - sizes.healthFillLeftMargin * 2;

const healthBarLeft = sizes.heartWidth + sizes.healthBarLeftMargin;

export class HealthBarUI {
  container: Phaser.GameObjects.Container;
  healthBar: Phaser.GameObjects.Container;
  healthFill: Phaser.GameObjects.Image;
  currentHealth: number;
  healthBarShakeTween: Phaser.Tweens.Tween | undefined;
  healthText: Phaser.GameObjects.BitmapText;

  scene: Phaser.Scene;

  constructor({ scene, health }: { scene: Phaser.Scene; health: number }) {
    this.container = scene.add.container(
      sizes.containerMargin,
      sizes.containerMargin
    );

    const heartImage = scene.add.image(0, 0, "heart").setOrigin(0);

    this.healthBar = scene.add.container(healthBarLeft, 1);

    const healthBarBackground = scene.add
      .image(0, 0, "health-bar-container")
      .setOrigin(0);

    this.healthFill = scene.add
      .image(
        sizes.healthFillLeftMargin,
        sizes.healthFillTopMargin,
        "health-fill"
      )
      .setOrigin(0);
    this.healthFill.displayWidth = HEALTH_BAR_FILL_WIDTH;

    this.healthText = scene.add
      .bitmapText(
        HEALTH_BAR_FILL_WIDTH / 2,
        -2,
        GameAssets.TYPOGRAPHY,
        `${PLAYER_INITIAL_HEALTH}/${PLAYER_INITIAL_HEALTH}`
      )
      .setScale(0.5)
      .setOrigin(0.5, 0)
      .setTintFill(0xffffff);

    this.healthBar.add([healthBarBackground, this.healthFill, this.healthText]);

    this.container.add([heartImage, this.healthBar]).setScale(4);

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

    // If we are adding more health, we need to update this
    const healthFillDisplayWidth =
      (health / PLAYER_INITIAL_HEALTH) * HEALTH_BAR_FILL_WIDTH;

    this.healthText.setText(`${health}/${PLAYER_INITIAL_HEALTH}`);

    if (healthDifference < 0) {
      // Prevent running tween if its not finished - it might cause healthbar to change final position
      if (this.scene.tweens.isTweening(this.healthBar)) {
        this.healthBarShakeTween?.restart();
      } else {
        this.healthBarShakeTween = this.scene.tweens.add({
          targets: this.healthBar,
          x: this.healthBar.x + 2, // Shake the object horizontally
          duration: 40,
          repeat: 4,
          yoyo: true, // Reverse the animation back to the original position
          ease: "Sine.easeInOut",
        });
      }

      this.scene.tweens.add({
        targets: [this.healthFill],
        displayWidth: healthFillDisplayWidth,
        duration: 200,
        ease: "Sine.easeInOut",
      });
    } else {
      // Don't run animation if player is healing
      this.healthFill.displayWidth = healthFillDisplayWidth;
    }
  }
}
