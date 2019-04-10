import { Transform, Writable } from 'stream';

import { batchStream, GenerateToFileOptions, writeToFiles } from './async-writer';
import { Section } from './editor-types';

// tslint:disable:readonly-keyword
type SectionStream = Writable & { finishedWriting?: Promise<void> };
// tslint:enable:readonly-keyword

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
  mapping: (externalIds: ReadonlyArray<string>) => Promise<ReadonlyArray<Section>>,
  opts: GenerateToFileOptions = {}
): SectionStream {
  const seenExternalIds: Set<string> = new Set();
  const transform: SectionStream = new Transform({
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
    filePrefix: 'sections',
    ...opts
  });
  // tslint:enable:no-expression-statement no-object-mutation

  return transform;
}

/** Async function that Closes the section stream. See {@link createSectionStream} for usage */
export async function endSectionStream(sectionStream: SectionStream): Promise<void> {
  // tslint:disable:no-expression-statement
  await new Promise(resolve => sectionStream.end(resolve));
  await sectionStream.finishedWriting;
  // tslint:enable:no-expression-statement
}
