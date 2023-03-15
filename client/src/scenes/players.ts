export function renderPlayer(phaser, playerId, playerData): void {
  const playerSprite = phaser.add.sprite(playerData.pos[0], playerData.pos[1]);
  playerSprite.id = playerId;
  playerSprite.play("walkDown");
  phaser.players.add(playerSprite);
}

export function removePlayer(phaser, playerId): void {
  phaser.players.getChildren().forEach((player) => {
    if (player.id === playerId) {
      player.destroy();
    }
  });
}
