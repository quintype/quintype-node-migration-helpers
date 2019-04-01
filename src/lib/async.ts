export async function* foobar(): AsyncIterableIterator<number> {
  yield 1;
  yield 2;
  yield 3;
}

export async function runStuff(f: AsyncIterableIterator<number>): Promise<void> {
  for await (const x of f) {
    console.log(x);
  }
}
