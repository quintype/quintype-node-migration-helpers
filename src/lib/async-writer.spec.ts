// tslint:disable:no-expression-statement
import { partitionAll, writeToFiles } from './async-writer';

import test from 'ava';
import { readFile } from 'fs';
import { dir } from 'tmp-promise';
import { unzip } from 'zlib';

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

function readFromGzipFile(path: string): Promise<string> {
  return new Promise(resolve => {
    readFile(path, (_1, data) => {
      unzip(data, (_2, buffer) => {
        resolve(buffer.toString());
      });
    });
  });
}
