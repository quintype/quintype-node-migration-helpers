import { GenerateToFileOptions } from './async-writer';
import { Author, ExternalId } from './editor-types';
import { createMetadataStream, endMetadataStream, MetadataStream } from './metadata-stream';

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
  mapping: (externalIds: ReadonlyArray<ExternalId>) => Promise<ReadonlyArray<Author>>,
  opts: GenerateToFileOptions = {}
): MetadataStream {
  return createMetadataStream(mapping, {
    filePrefix: 'authors',
    ...opts
  });
}

/** Async function that Closes the author stream. See {@link createAuthorStream} for usage */
export const endAuthorStream = endMetadataStream;
