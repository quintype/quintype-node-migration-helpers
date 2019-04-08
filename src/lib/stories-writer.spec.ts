// tslint:disable:no-expression-statement
import { PassThrough } from 'stream';

import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { Story } from './editor-types';
import { writeStories } from './stories-writer';

// tslint:disable:no-var-requires
const streamToArray = require('stream-to-array');
// tslint:enable:no-var-requires

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
        yield { ...commonStoryFields, headline: `Story Number ${i}`, 'external-id': `story-${i}`, slug: `story-${i}` };
      }
    }
    const { path } = await dir({ unsafeCleanup: true });
    await writeStories(generate(), 'export', { directory: path });
    const fileContents = await readFromGzipFile(`${path}/story-export-00001.txt.gz`);
    const stories = fileContents
      .trim()
      .split('\n')
      .map(story => JSON.parse(story));
    expect(stories[0].headline).toBe('Story Number 0');
    expect(stories[1].headline).toBe('Story Number 1');
  });

  it('writes the authors into a separate stream', async () => {
    async function* generate(): AsyncIterableIterator<Story> {
      for (let i = 0; i < 5; i++) {
        yield {
          ...commonStoryFields,
          authors: [{ 'external-id': `author-${i}`, name: 'Author' }],
          'external-id': `story-${i}`,
          headline: `Story Number ${i}`,
          slug: `story-${i}`
        };
      }
    }
    const stubAuthorStream = new PassThrough({ objectMode: true });
    const { path } = await dir({ unsafeCleanup: true });
    await writeStories(generate(), 'export', {
      authorStream: stubAuthorStream,
      directory: path
    });
    await new Promise(resolve => stubAuthorStream.end(resolve));
    const authorArray = await streamToArray(stubAuthorStream);
    expect(authorArray).toEqual(['author-0', 'author-1', 'author-2', 'author-3', 'author-4']);
  });
});
