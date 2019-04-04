// tslint:disable:no-expression-statement readonly-array no-if-statement
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { createGzip } from 'zlib';

/** @private */
export function partitionToStream<T>(stream: AsyncIterableIterator<T>, size: number = 1000): Readable {
  return new Readable({
    objectMode: true,
    async read(): Promise<void> {
      const batch: T[] = [];
      while (batch.length < size) {
        const { done, value } = await stream.next();
        if (done) {
          if (batch.length > 0) {
            this.push(batch);
          }
          this.push(null);
          return;
        } else {
          batch.push(value);
        }
      }
      this.push(batch);
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
  stream: AsyncIterableIterator<T>,
  { batchSize, directory = '.', filePrefix = 'c' }: GenerateToFileOptions
): Promise<void> {
  return new Promise(resolve => {
    let fileNum = 0;
    const promises: Array<Promise<void>> = [];
    partitionToStream(stream, batchSize)
      .on('data', async batch => {
        fileNum++;
        promises.push(writeBatchToFile(batch, `${directory}/${filePrefix}-${String(fileNum).padStart(5, '0')}.txt.gz`));
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
