/*
  Low game resolution is messing with fonts resolution so we need to set a bigger game resolution
  and then scale all the game elements but the texts
  https://www.html5gamedevs.com/topic/46808-solved-bitmap-fonts-dont-display-correctly/

  When we want to measure the visible map for the player we need to use the original resolution
  e.g. 460px (original width) / 16px (tile size) => 28.75 tiles visible
*/
export const resolution = {
  originalWidth: 480,
  originalHeight: 240,
  zoom: 4,
};
