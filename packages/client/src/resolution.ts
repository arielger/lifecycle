/*
  Low game resolution is messing with font resolution so we need to set a bigger game resolution
  and then scale all the game elements but the texts
  https://www.html5gamedevs.com/topic/46808-solved-bitmap-fonts-dont-display-correctly/

  When we want to measure the visible map for the player we need to use the original resolution
  e.g. 460px (original width) / 16px (tile size) => 28.75 tiles visible
*/
const originalSizes = {
  width: 480,
  height: 240,
};

const zoom = 4;

export const resolution = {
  width: originalSizes.width * zoom,
  height: originalSizes.height * zoom,
  zoom,
};
