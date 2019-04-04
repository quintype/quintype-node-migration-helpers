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
  return new Promise(resolve => {
    const stream = source instanceof Readable ? source : asyncToStream(source);
    const promises: Array<Promise<void>> = [];
    stream
      .pipe(batchStream(batchSize))
      .on('data', async ({ batchNumber, batch }) => {
        promises.push(
          writeBatchToFile(batch, `${directory}/${filePrefix}-${String(batchNumber).padStart(5, '0')}.txt.gz`)
        );
      })
      .on('end', () => Promise.all(promises).then(_0 => resolve()));
  });
}

/** @private */
function writeBatchToFile<T>(batch: T[], file: string): Promise<void> {
  let numberRead = 0;
  const stream = new Readable({
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

  return new Promise(resolve => {
    stream
      .pipe(createGzip())
      .pipe(createWriteStream(file))
      .on('finish', resolve);
  });
}
