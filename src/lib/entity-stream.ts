import { GenerateToFileOptions } from './async-writer';
import { ExternalId, Entity } from './editor-types';
import { createMetadataStream, endMetadataStream, MetadataStream } from './metadata-stream';

/**
 * Creates a writeable stream that can be used to pipe entity to. Entity that are piped to this
 * stream are automatically writen to entity-*.txt.gz. The stream created with this function can
 * be passed to {@link writeStories}
 *
 * ### Example
 *
 * ```ts
 * import { Entity, createEntityStream, endEntityStream, writeStories } from "@quintype/migration-helpers";
 *
 * async function main() {
 *   const entityStream = createEntityStream(mapEntityIdToEntity, opts);
 *   await writeStories(getStoriesFromDB(), {...opts, entityStream});
 *   await endEntityStream(entityStream);
 * }
 * ```
 *
 * @param mapping An async function that maps from the external-ids given and the {@link Entity}
 * @param opts
 */
export function createEntityStream(
  mapping: (externalIds: ReadonlyArray<ExternalId>) => Promise<ReadonlyArray<Entity>>,
  opts: GenerateToFileOptions = {}
): MetadataStream {
  return createMetadataStream(mapping, {
    filePrefix: 'entities',
    ...opts
  });
}

/** Async function that Closes the entity stream. See {@link createEntityStream} for usage */
export const endEntityStream = endMetadataStream;
