export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function createLoop(milliseconds: number, callback: () => void): void {
  setTimeout(() => {
    callback();
    createLoop(milliseconds, callback);
  }, milliseconds);
}
