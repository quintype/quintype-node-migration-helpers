// tslint:disable:no-expression-statement
import { Readable } from 'stream';
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { writeToFiles } from './async-writer';

describe('writeToFiles', () => {
  it('writes into multiple files', async () => {
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

    expect(await readFromGzipFile(`${path}/test-00001.txt.gz`)).toBe('{"value":0}\n{"value":1}\n{"value":2}\n');
    expect(await readFromGzipFile(`${path}/test-00002.txt.gz`)).toBe('{"value":3}\n{"value":4}\n{"value":5}\n');
    expect(await readFromGzipFile(`${path}/test-00003.txt.gz`)).toBe('{"value":6}\n{"value":7}\n{"value":8}\n');
    expect(await readFromGzipFile(`${path}/test-00004.txt.gz`)).toBe('{"value":9}\n');
  });

  it('works when an exact multiple of the batch size', async () => {
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

    expect(await readFromGzipFile(`${path}/test-00001.txt.gz`)).toBe('{"value":0}\n{"value":1}\n{"value":2}\n');
    expect(await readFromGzipFile(`${path}/test-00002.txt.gz`)).toBe('{"value":3}\n{"value":4}\n{"value":5}\n');
    expect(await readFromGzipFile(`${path}/test-00003.txt.gz`)).toBe('{"value":6}\n{"value":7}\n{"value":8}\n');
  });

  it('works on streams', async () => {
    const generate = new Readable({
      objectMode: true,
      read(): void {
        for (let i = 0; i < 10; i++) {
          this.push({ value: i });
        }
        this.push(null);
      }
    });
    const { path } = await dir({ unsafeCleanup: true });
    await writeToFiles(generate, {
      batchSize: 3,
      directory: path,
      filePrefix: 'test'
    });

    expect(await readFromGzipFile(`${path}/test-00001.txt.gz`)).toBe('{"value":0}\n{"value":1}\n{"value":2}\n');
    expect(await readFromGzipFile(`${path}/test-00002.txt.gz`)).toBe('{"value":3}\n{"value":4}\n{"value":5}\n');
    expect(await readFromGzipFile(`${path}/test-00003.txt.gz`)).toBe('{"value":6}\n{"value":7}\n{"value":8}\n');
    expect(await readFromGzipFile(`${path}/test-00004.txt.gz`)).toBe('{"value":9}\n');
  });
});
