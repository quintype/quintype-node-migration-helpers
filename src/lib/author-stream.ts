import { Transform, Writable } from 'stream';

import { batchStream, GenerateToFileOptions, writeToFiles } from './async-writer';
import { Author } from './editor-types';

// tslint:disable:readonly-keyword
type AuthorStream = Writable & { finishedWriting?: Promise<void> };
// tslint:enable:readonly-keyword

/**
 * Creates a writeable stream that can be used to pipe authors to. Authors that are piped to this
 * stream are automatically writen to authors-*.txt.gz. The stream created with this function can
 * be passed to {@link writeStories}
 *
 * ### Example
 *
 * ```ts
 * import { Author, createAuthorStream, endAuthorStream, writeStories } from "@quintype/migration-helpers";
 *
 * async function main() {
 *   const authorStream = createAuthorStream(mapAuthorIdToAuthor, opts);
 *   await writeStories(getStoriesFromDB(), {...opts, authorStream});
 *   await endAuthorStream(authorStream);
 * }
 * ```
 *
 * @param mapping An async function that maps from the external-ids given and the {@link Author}
 * @param opts
 */
export function createAuthorStream(
  mapping: (externalIds: ReadonlyArray<string>) => Promise<ReadonlyArray<Author>>,
  opts: GenerateToFileOptions = {}
): AuthorStream {
  const seenExternalIds: Set<string> = new Set();
  const transform: AuthorStream = new Transform({
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
  transform.finishedWriting = writeToFiles(transform.pipe(batchStream(100, mapping)), {
    filePrefix: 'authors',
    ...opts
  });
  // tslint:enable:no-expression-statement no-object-mutation

  return transform;
}

/** Async function that Closes the author stream. See {@link createAuthorStream} for usage */
export async function endAuthorStream(authorStream: AuthorStream): Promise<void> {
  // tslint:disable:no-expression-statement
  await new Promise(resolve => authorStream.end(resolve));
  await authorStream.finishedWriting;
  // tslint:enable:no-expression-statement
}
