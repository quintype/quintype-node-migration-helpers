import { Readable } from 'stream';

import { GenerateToFileOptions, writeToFiles } from './async-writer';
import { Story } from './editor-types';

/**
 * Takes a generator of stories, and writes the stories into .txt.gz files. Each file will have 1000 stories.
 *
 * ### Example
 * ```ts
 * import { Story, writeStories } from '@quintype/migration-helpers';
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
 * You may also use a stream to produce stories
 *
 * ```ts
 * import { Story, writeStories } from '@quintype/migration-helpers';
 * import { Transform } from 'stream'
 *
 * const stream = conn.query("select * from stories").stream();
 *
 * const transformSqlRowToStories = new Transform({
 *   objectMode: true,
 *
 *   transform(rows, _, callback) {
 *     for(const story of rows) {
 *       this.push(rowToStory(story))
 *     }
 *   }
 * })
 *
 * writeStories(stream.pipe(transformSqlRowToStories));
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
