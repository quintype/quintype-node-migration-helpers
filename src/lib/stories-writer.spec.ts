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
  authors: [{ 'external-id': 'sec-001', name: 'Sec1', email: 'abc@foobar' }],
  body: '<p><Foo/p>',
  'first-published-at': 0,
  'last-published-at': 0,
  'published-at': 0,
  sections: [{ 'external-id': 'sec-001', name: 'Sec1', slug: 'sec' }],
  'story-template': 'text' as 'text',
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

  describe('Writing out metadata', () => {
    it('writes the authors into a separate stream', async () => {
      async function* generate(): AsyncIterableIterator<Story> {
        for (let i = 0; i < 5; i++) {
          yield {
            ...commonStoryFields,
            authors: [{ 'external-id': `author-${i}`, email: 'author@please.chan', name: 'Foo Bar' }],
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
      expect(await streamToArray(stubAuthorStream)).toEqual(
        [0, 1, 2, 3, 4].map(i => ({
          email: 'author@please.chan',
          'external-id': `author-${i}`,
          name: `Foo Bar`
        }))
      );
    });

    it('writes the sections into a separate stream', async () => {
      async function* generate(): AsyncIterableIterator<Story> {
        for (let i = 0; i < 5; i++) {
          yield {
            ...commonStoryFields,
            'external-id': `story-${i}`,
            headline: `Story Number ${i}`,
            sections: [{ 'external-id': `section-${i}`, slug: 'sec', name: 'foo' }],
            slug: `story-${i}`
          };
        }
      }
      const stubSectionStream = new PassThrough({ objectMode: true });
      const { path } = await dir({ unsafeCleanup: true });
      await writeStories(generate(), 'export', {
        directory: path,
        sectionStream: stubSectionStream
      });
      await new Promise(resolve => stubSectionStream.end(resolve));
      expect(await streamToArray(stubSectionStream)).toEqual(
        [0, 1, 2, 3, 4].map(i => ({ name: 'foo', slug: 'sec', 'external-id': `section-${i}` }))
      );
    });

    it('writes out story attributes into a separate stream', async () => {
      async function* generate(): AsyncIterableIterator<Story> {
        for (let i = 0; i < 5; i++) {
          yield {
            ...commonStoryFields,
            'external-id': `story-${i}`,
            headline: `Story Number ${i}`,
            metadata: {
              'story-attributes': {
                [`foo-${i}`]: ['bar']
              }
            },
            sections: [{ 'external-id': 'sec-001', name: 'Sec1', slug: 'sec' }],
            slug: `story-${i}`
          };
        }
      }
      const stubStoryAttributeStream = new PassThrough({ objectMode: true });
      const { path } = await dir({ unsafeCleanup: true });
      await writeStories(generate(), 'export', {
        directory: path,
        storyAttributeStream: stubStoryAttributeStream
      });
      await new Promise(resolve => stubStoryAttributeStream.end(resolve));
      expect(await streamToArray(stubStoryAttributeStream)).toEqual(
        [0, 1, 2, 3, 4].map(i => ({ name: `foo-${i}`, 'external-id': `foo-${i}` }))
      );
    });
  });
});
