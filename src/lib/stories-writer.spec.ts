// tslint:disable:no-expression-statement
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { Story } from './editor-types';
import { writeStories } from './stories-writer';

const commonStoryFields = {
  authors: [],
  body: '<p><Foo/p>',
  'first-published-at': 0,
  'last-published-at': 0,
  'published-at': 0,
  sections: [],
  'story-template': 'text',
  summary: 'A story for testing',
  tags: []
};

describe('writeStories', () => {
  it('writes stories into files', async () => {
    async function* generate(): AsyncIterableIterator<Story> {
      for (let i = 0; i < 10; i++) {
        yield { headline: `Story Number ${i}`, 'external-id': `story-${i}`, slug: `story-${i}`, ...commonStoryFields };
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
    expect(stories[0].headline).toBe('Story Number 0');
    expect(stories[1].headline).toBe('Story Number 1');
  });
});
