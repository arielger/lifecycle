export function getRandom<I>(list: I[]): I {
  return list[Math.floor(Math.random() * list.length)];
}
