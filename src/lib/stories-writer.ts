import { Readable } from 'stream';

import { GenerateToFileOptions, writeToFiles } from './async-writer';
import { Story } from './editor-types';

/**
 * Takes a generator of stories, and writes the stories into .txt.gz files. Each file will have 1000 stories.
 *
 * ### Example
 * ```ts
 * import { batchStream, Story, writeStories } from '@quintype/migration-helpers';
 *
 * async function* readStoriesFromDatabase(): AsyncIterableIterator<Story> {
 *  const txn = createDbTxn();
 *  const results = txn.runQuery("select * from stories");
 *  while(results.hasNext()) {
 *    yield rowToStory(results.next());
 *  }
 *  txn.close();
 * }
 *
 * writeStories(readStoriesFromDatabase(), 'interviews')
 * ```
 *
 * You may also use a stream to produce stories. Use {@link batchStream} to efficiently load stories.
 *
 * ```ts
 * import { Story, writeStories } from '@quintype/migration-helpers';
 * import { Transform } from 'stream'
 *
 * const stream = conn.query("select * from stories").stream();
 *
 * async function convertRowsToStories(rows: ReadonlyArray<any>): Promise<ReadonlyArray<Story>> {
 *   const relatedData = await loadSomeData(rows.map(row => row.storyId));
 *   return row.map(row => rowToStory(row, relatedData));
 * }
 *
 * writeStories(stream.pipe(batchStream(100, convertRowsToStories)));
 * ```
 *
 * @param stream An Async Generator or Readable which yields stories
 * @param source A string describing where the stories come from. ex: interviews
 * @param opts Control some fine grained tuning
 */
export function writeStories(
  stream: AsyncIterableIterator<Story> | Readable,
  source: string = 'export',
  opts: GenerateToFileOptions = {}
): Promise<void> {
  const filePrefix = opts.filePrefix ? `story-${source}-${opts.filePrefix}` : `story-${source}`;
  return writeToFiles(stream, { filePrefix, ...opts });
}
