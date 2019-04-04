// tslint:disable:no-expression-statement readonly-array no-if-statement
import { createWriteStream } from 'fs';
import { Readable, Transform, Writable } from 'stream';
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

/** @private */
function batchStream<T>(size: number = 1000): Transform {
  let batch: T[] = [];
  let batchNumber = 1;

  function emitBatch(transform: Transform): void {
    transform.push({ batchNumber, batch });
    batchNumber++;
    batch = [];
  }

  return new Transform({
    objectMode: true,

    transform(data, _, callback): void {
      batch = batch.concat(data);
      if (batch.length >= size) {
        emitBatch(this);
      }
      callback();
    },

    flush(): void {
      if (batch.length > 0) {
        emitBatch(this);
      }
      this.push(null);
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
      .pipe(batchStream(batchSize))
      .pipe(writeBatchToFile(directory, filePrefix))
      .on('finish', resolve)
      .on('error', reject);
  });
}

/** @private */
function writeBatchToFile(directory: string, filePrefix: string): Writable {
  return new Writable({
    objectMode: true,

    write({ batchNumber, batch }, _, callback): void {
      createJSONStream(batch)
        .pipe(createGzip())
        .pipe(createWriteStream(`${directory}/${filePrefix}-${String(batchNumber).padStart(5, '0')}.txt.gz`))
        .on('finish', callback);
    }
  });
}

/** @private */
function createJSONStream<T>(batch: T[]): Readable {
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
