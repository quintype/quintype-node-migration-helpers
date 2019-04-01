/* tslint:disable:readonly-array no-expression-statement no-if-statement */
export async function* partitionAll<T>(
  stream: AsyncIterableIterator<T>,
  size: number = 1000
): AsyncIterableIterator<T[]> {
  let batch: T[] = [];
  for await (const item of stream) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length) {
    yield batch;
  }
}
/* tslint:enable:readonly-array no-expression-statement no-if-statement */
