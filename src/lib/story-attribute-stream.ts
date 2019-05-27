import { GenerateToFileOptions } from './async-writer';
import { ExternalId, StoryAttribute } from './editor-types';
import { createMetadataStream, endMetadataStream, MetadataStream } from './metadata-stream';

/**
 * Creates a writeable stream that can be used to pipe authors to. StoryAttributes that are piped to this
 * stream are automatically writen to authors-*.txt.gz. The stream created with this function can
 * be passed to {@link writeStories}
 *
 * ### Example
 *
 * ```ts
 * import { StoryAttribute, createStoryAttributeStream, endStoryAttributeStream, writeStories } from "@quintype/migration-helpers";
 *
 * async function main() {
 *   const authorStream = createStoryAttributeStream(mapStoryAttributeIdToStoryAttribute, opts);
 *   await writeStories(getStoriesFromDB(), {...opts, authorStream});
 *   await endStoryAttributeStream(authorStream);
 * }
 * ```
 *
 * @param mapping An async function that maps from the external-ids given and the {@link StoryAttribute}
 * @param opts
 */
export function createStoryAttributeStream(
  mapping: (externalIds: ReadonlyArray<ExternalId>) => Promise<ReadonlyArray<StoryAttribute>>,
  opts: GenerateToFileOptions = {}
): MetadataStream {
  return createMetadataStream(mapping, {
    filePrefix: 'attributes-story',
    ...opts
  });
}

/** Async function that Closes the author stream. See {@link createStoryAttributeStream} for usage */
export const endStoryAttributeStream = endMetadataStream;
