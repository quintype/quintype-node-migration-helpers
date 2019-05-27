import { GenerateToFileOptions } from './async-writer';
import { Section, ExternalId } from './editor-types';
import { createMetadataStream, endMetadataStream, MetadataStream } from './metadata-stream';

/**
 * Creates a writeable stream that can be used to pipe sections to. Sections that are piped to this
 * stream are automatically writen to sections-*.txt.gz. The stream created with this function can
 * be passed to {@link writeStories}
 *
 * ### Example
 *
 * ```ts
 * import { Section, createSectionStream, endSectionStream, writeStories } from "@quintype/migration-helpers";
 *
 * async function main() {
 *   const sectionStream = createSectionStream(mapSectionIdToSection, opts);
 *   await writeStories(getStoriesFromDB(), {...opts, sectionStream});
 *   await endSectionStream(sectionStream);
 * }
 * ```
 *
 * @param mapping An async function that maps from the external-ids given and the {@link Section}
 * @param opts
 */
export function createSectionStream(
  mapping: (externalIds: ReadonlyArray<ExternalId>) => Promise<ReadonlyArray<Section>>,
  opts: GenerateToFileOptions = {}
): MetadataStream {
  return createMetadataStream(mapping, {
    filePrefix: 'sections',
    ...opts
  });
}

/** Async function that Closes the section stream. See {@link createSectionStream} for usage */
export const endSectionStream = endMetadataStream;
