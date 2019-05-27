// tslint:disable:no-expression-statement
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { ExternalId, StoryAttribute } from './editor-types';
import { createStoryAttributeStream, endStoryAttributeStream } from './story-attribute-stream';

describe('createStoryAttributeStream', () => {
  async function mapExternalIdToStoryAttributes(
    attributes: ReadonlyArray<ExternalId>
  ): Promise<ReadonlyArray<StoryAttribute>> {
    return attributes.map(attribute => ({ 'external-id': attribute['external-id'], name: attribute['external-id'] }));
  }

  it('writes storyAttributes to the stream', async () => {
    const { path } = await dir({ unsafeCleanup: true });
    const storyAttributeStream = createStoryAttributeStream(mapExternalIdToStoryAttributes, {
      directory: path
    });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-0' });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-1' });
    await endStoryAttributeStream(storyAttributeStream);
    const fileContents = await readFromGzipFile(`${path}/attributes-story-00001.txt.gz`);
    const storyAttributes = fileContents
      .trim()
      .split('\n')
      .map(storyAttribute => JSON.parse(storyAttribute));
    expect(storyAttributes[0].name).toBe('storyAttribute-0');
    expect(storyAttributes[1].name).toBe('storyAttribute-1');
  });

  it('does not duplicate the storyAttributes into the stream', async () => {
    const { path } = await dir({ unsafeCleanup: true });
    const storyAttributeStream = createStoryAttributeStream(mapExternalIdToStoryAttributes, {
      directory: path
    });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-0' });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-0' });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-0' });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-0' });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-0' });
    storyAttributeStream.write({ 'external-id': 'storyAttribute-0' });
    await endStoryAttributeStream(storyAttributeStream);
    const fileContents = await readFromGzipFile(`${path}/attributes-story-00001.txt.gz`);
    const storyAttributes = fileContents
      .trim()
      .split('\n')
      .map(storyAttribute => JSON.parse(storyAttribute));
    expect(storyAttributes[0].name).toBe('storyAttribute-0');
    expect(storyAttributes.length).toBe(1);
  });
});
