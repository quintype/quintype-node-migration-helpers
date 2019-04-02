// tslint:disable:no-expression-statement readonly-array no-if-statement
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { createGzip } from 'zlib';

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

interface GenerateToFileOptions {
  readonly batchSize: number | undefined;
  readonly directory: string;
  readonly filePrefix: string;
}

export async function writeToFiles<T>(
  stream: AsyncIterableIterator<T>,
  { batchSize, directory = '.', filePrefix = 'c' }: GenerateToFileOptions
): Promise<void> {
  let fileNum = 1;
  for await (const batch of partitionAll(stream, batchSize)) {
    await writeBatchToFile(batch, `${directory}/${filePrefix}-${String(fileNum).padStart(5, '0')}.txt.gz`);
    fileNum++;
  }
}

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
