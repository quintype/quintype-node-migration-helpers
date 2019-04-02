// tslint:disable:no-expression-statement
import test from 'ava';
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { partitionAll, writeToFiles } from './async-writer';

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

test('writeToDirectory writes into multiple files', async t => {
  async function* generate(): AsyncIterableIterator<any> {
    for (let i = 0; i < 10; i++) {
      yield { value: i };
    }
  }
  const { path } = await dir({ unsafeCleanup: true });
  await writeToFiles(generate(), {
    batchSize: 3,
    directory: path,
    filePrefix: 'test'
  });
  const fileContents = await readFromGzipFile(`${path}/test-00002.txt.gz`);
  t.is('{"value":3}\n{"value":4}\n{"value":5}\n', fileContents);
});
