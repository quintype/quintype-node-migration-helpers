// tslint:disable:no-expression-statement
import test from 'ava';
import { partitionAll } from './async-writer';

test('partitionAll partitions an async stream', async t => {
  async function* generate(): AsyncIterableIterator<number> {
    for (let i = 0; i < 10; i++) {
      yield i;
    }
  }

  const result = partitionAll(generate(), 3);
  t.deepEqual((await result.next()).value, [0, 1, 2]);
  t.deepEqual((await result.next()).value, [3, 4, 5]);
  t.deepEqual((await result.next()).value, [6, 7, 8]);
  t.deepEqual((await result.next()).value, [9]);
});
