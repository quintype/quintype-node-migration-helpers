// tslint:disable:no-expression-statement readonly-array no-if-statement
import { createWriteStream } from 'fs';
import { Readable, Transform } from 'stream';
import { createGzip } from 'zlib';

/** @private */
function asyncToStream<T>(generator: AsyncIterableIterator<T>): Readable {
  return new Readable({
    objectMode: true,

    async read(): Promise<void> {
      const { done, value } = await generator.next();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    }
  });
}

export type MappingFunction = (entries: ReadonlyArray<any>, batchNumber: number) => Promise<ReadonlyArray<any>>;

/**
 * Batch records in the stream. It will call your transform with a batch, and expect a batch of results to be returned
 * Downstream from the pipe will see individual items, not a batch.
 *
 * You can listen to the 'end' event to figure out when this stream is done
 *
 * ### Example
 * ```ts
 * import { batchStream, Story } from '@quintype/migration-helpers';
 *
 * async function mapRowToStories(rows: any, _batchNumber: number): Promise<ReadonlyArray<Story>> {
 *   const someRelatedData = fetchInfoForStories(rows.map(r => r.storyId));
 *   return rows.map(r => ({...rowToStory(r), ...someRelatedData(r.storyId)}));
 * }
 *
 * writeStories(
 *   readStoriesFromDatabase(conn)
 *     .pipe(batchStream(100, mapRowToStories))
 *     .on('end', () => conn.destroy())
 * );
 * ```
 *
 * @param size The maximum number of records in the batch
 * @param mapping An optional function to transform the batch before being pushed onto the stream
 */
export function batchStream<T>(size: number = 1000, mapping: MappingFunction = async x => x): Transform {
  let batch: T[] = [];
  let batchNumber = 1;

  async function emitBatch(transform: Transform): Promise<void> {
    if (batch.length === 0) {
      return;
    }

    const batchToEmit = batch;
    const batchNumberToEmit = batchNumber;
    batch = [];
    batchNumber++;
    for (const result of await mapping(batchToEmit, batchNumberToEmit)) {
      transform.push(result);
    }
  }

  return new Transform({
    objectMode: true,

    async transform(data, _, callback): Promise<void> {
      batch.push(data);
      if (batch.length >= size) {
        await emitBatch(this);
      }
      callback();
    },

    // FIXME: This is an ugly hack. Ideally, I should not have to emit end manually,
    // but things aren't working as per the spec
    async flush(callback): Promise<void> {
      await emitBatch(this);
      this.emit('end');
      callback();
    }
  });
}

export interface GenerateToFileOptions {
  readonly batchSize?: number;
  readonly directory?: string;
  readonly filePrefix?: string;
}

/** @private */
export function writeToFiles<T>(
  source: AsyncIterableIterator<T> | Readable,
  { batchSize, directory = '.', filePrefix = 'c' }: GenerateToFileOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = source instanceof Readable ? source : asyncToStream(source);
    stream
      .pipe(batchStream(batchSize, writeBatchToFile))
      .on('end', () => resolve())
      .on('error', reject);
  });

  function writeBatchToFile(batch: ReadonlyArray<any>, batchNumber: number): Promise<ReadonlyArray<any>> {
    return new Promise((resolve, reject) => {
      createJSONStream(batch)
        .pipe(createGzip())
        .pipe(createWriteStream(`${directory}/${filePrefix}-${String(batchNumber).padStart(5, '0')}.txt.gz`))
        .on('close', () => resolve([]))
        .on('error', reject);
    });
  }
}

/** @private */
function createJSONStream<T>(batch: ReadonlyArray<T>): Readable {
  let numberRead = 0;
  return new Readable({
    read(): void {
      const slice = batch.slice(numberRead, numberRead + 16);
      numberRead += 16;
      if (slice.length === 0) {
        this.push(null);
      } else {
        for (const item of slice) {
          this.push(JSON.stringify(item));
          this.push('\n');
        }
      }
    }
  });
}
