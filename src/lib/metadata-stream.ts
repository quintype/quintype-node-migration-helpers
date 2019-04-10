import { Transform, Writable } from 'stream';

import { batchStream, GenerateToFileOptions, writeToFiles } from './async-writer';

// tslint:disable:readonly-keyword
/** @private */
export type MetadataStream = Writable & { finishedWriting?: Promise<void> };
// tslint:enable:readonly-keyword

/** @private */
export function createMetadataStream<T>(
  mapping: (externalIds: ReadonlyArray<string>) => Promise<ReadonlyArray<T>>,
  opts: GenerateToFileOptions = {}
): MetadataStream {
  const seenExternalIds: Set<string> = new Set();
  const transform: MetadataStream = new Transform({
    objectMode: true,

    // tslint:disable:no-if-statement no-expression-statement
    transform(externalId, _, callback): void {
      if (seenExternalIds.has(externalId)) {
        callback();
      } else {
        seenExternalIds.add(externalId);
        callback(null, externalId);
      }
    }
    // tslint:enable:no-if-statement no-expression-statement
  });

  // tslint:disable:no-expression-statement no-object-mutation
  // This will happen in the background. Hopefully calling end
  transform.finishedWriting = writeToFiles(transform.pipe(batchStream(100, mapping)), opts);
  // tslint:enable:no-expression-statement no-object-mutation

  return transform;
}

/** @private */
export async function endMetadataStream(sectionStream: MetadataStream): Promise<void> {
  // tslint:disable:no-expression-statement
  await new Promise(resolve => sectionStream.end(resolve));
  await sectionStream.finishedWriting;
  // tslint:enable:no-expression-statement
}
