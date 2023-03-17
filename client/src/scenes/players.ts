import { TPlayer } from "../../../server/src/types";

export function renderPlayer(
  phaser: Phaser.Scene,
  playerId: string,
  playerData: TPlayer
): void {
  const playerSprite = phaser.add.sprite(
    playerData.position.x,
    playerData.position.y,
    ""
  );
  playerSprite.id = playerId;
  playerSprite.play("walkDown");
  phaser.players.add(playerSprite);
}

export function removePlayer(phaser: Phaser.Scene, playerId: string): void {
  phaser.players.getChildren().forEach((player) => {
    if (player.id === playerId) {
      player.destroy();
    }
  });
}

export function updatePlayerSprite(
  player,
  previousPosition: { x: number; y: number },
  currentPosition: { x: number; y: number }
): void {
  if (
    previousPosition.x === currentPosition.x &&
    previousPosition.x === currentPosition.y
  ) {
    player.anims.stop();
  } else if (
    currentPosition.x > previousPosition.x &&
    player.anims.currentAnim.key !== "walkRight"
  ) {
    player.play("walkRight");
  } else if (
    currentPosition.x < previousPosition.x &&
    player.anims.currentAnim.key !== "walkLeft"
  ) {
    player.play("walkLeft");
  } else if (
    previousPosition.y > currentPosition.y &&
    player.anims.currentAnim.key !== "walkUp"
  ) {
    player.play("walkUp");
  } else if (
    previousPosition.y < currentPosition.y &&
    player.anims.currentAnim.key !== "walkDown"
  ) {
    player.play("walkDown");
  }

  player.setPosition(currentPosition.x, currentPosition.y);
}
