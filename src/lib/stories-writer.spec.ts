// tslint:disable:no-expression-statement
import test from 'ava';
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { Story, writeStories } from './stories-writer';

test('writeStories writes stories into files', async t => {
  async function* generate(): AsyncIterableIterator<Story> {
    for (let i = 0; i < 10; i++) {
      yield { headline: `Story Number ${i}` };
    }
  }
  const { path } = await dir({ unsafeCleanup: true });
  await writeStories(generate(), 'export', {
    directory: path
  });
  const fileContents = await readFromGzipFile(`${path}/story-export-00001.txt.gz`);
  const stories = fileContents
    .trim()
    .split('\n')
    .map(story => JSON.parse(story));
  t.is('Story Number 0', stories[0].headline);
  t.is('Story Number 1', stories[1].headline);
});
