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
 * @param stream An Async Generator which yields stories
 * @param source A string describing where the stories come from. ex: interviews
 * @param opts Control some fine grained tuning
 */
export function writeStories(
  stream: AsyncIterableIterator<Story>,
  source: string = 'export',
  opts: GenerateToFileOptions = {}
): Promise<void> {
  const filePrefix = opts.filePrefix ? `story-${source}-${opts.filePrefix}` : `story-${source}`;
  return writeToFiles(stream, { filePrefix, ...opts });
}
