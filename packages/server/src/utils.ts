export function createLoop(milliseconds: number, callback: () => void): void {
  setTimeout(() => {
    callback();
    createLoop(milliseconds, callback);
  }, milliseconds);
}
