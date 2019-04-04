// tslint:disable:no-expression-statement
import test from 'ava';
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { writeToFiles } from './async-writer';

test('writeToFiles writes into multiple files', async t => {
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

  t.is('{"value":0}\n{"value":1}\n{"value":2}\n', await readFromGzipFile(`${path}/test-00001.txt.gz`));
  t.is('{"value":3}\n{"value":4}\n{"value":5}\n', await readFromGzipFile(`${path}/test-00002.txt.gz`));
  t.is('{"value":6}\n{"value":7}\n{"value":8}\n', await readFromGzipFile(`${path}/test-00003.txt.gz`));
  t.is('{"value":9}\n', await readFromGzipFile(`${path}/test-00004.txt.gz`));
});

test('writeToFiles works when an exact multiple of the batch size', async t => {
  async function* generate(): AsyncIterableIterator<any> {
    for (let i = 0; i < 9; i++) {
      yield { value: i };
    }
  }
  const { path } = await dir({ unsafeCleanup: true });
  await writeToFiles(generate(), {
    batchSize: 3,
    directory: path,
    filePrefix: 'test'
  });

  t.is('{"value":0}\n{"value":1}\n{"value":2}\n', await readFromGzipFile(`${path}/test-00001.txt.gz`));
  t.is('{"value":3}\n{"value":4}\n{"value":5}\n', await readFromGzipFile(`${path}/test-00002.txt.gz`));
  t.is('{"value":6}\n{"value":7}\n{"value":8}\n', await readFromGzipFile(`${path}/test-00003.txt.gz`));
});
