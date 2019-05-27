// tslint:disable:no-expression-statement
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { Section, ExternalId } from './editor-types';
import { createSectionStream, endSectionStream } from './section-stream';

describe('createSectionStream', () => {
  async function mapExternalIdToSections(externalIds: ReadonlyArray<ExternalId>): Promise<ReadonlyArray<Section>> {
    return externalIds.map(x => ({
      'display-name': `Section ${x["external-id"]}`,
      'external-id': x["external-id"],
      name: `Section ${x["external-id"]}`
    }));
  }

  it('writes sections to the stream', async () => {
    const { path } = await dir({ unsafeCleanup: true });
    const sectionStream = createSectionStream(mapExternalIdToSections, {
      directory: path
    });
    sectionStream.write({'external-id':'section-0'});
    sectionStream.write({'external-id':'section-'});
    await endSectionStream(sectionStream);
    const fileContents = await readFromGzipFile(`${path}/sections-00001.txt.gz`);
    const sections = fileContents
      .trim()
      .split('\n')
      .map(section => JSON.parse(section));
    expect(sections[0].name).toBe('Section section-0');
    expect(sections[1].name).toBe('Section section-1');
  });

  it('does not duplicate the sections into the stream', async () => {
    const { path } = await dir({ unsafeCleanup: true });
    const sectionStream = createSectionStream(mapExternalIdToSections, {
      directory: path
    });
    sectionStream.write('section-0');
    sectionStream.write('section-0');
    sectionStream.write('section-0');
    sectionStream.write('section-0');
    sectionStream.write('section-0');
    sectionStream.write('section-0');
    await endSectionStream(sectionStream);
    const fileContents = await readFromGzipFile(`${path}/sections-00001.txt.gz`);
    const sections = fileContents
      .trim()
      .split('\n')
      .map(section => JSON.parse(section));
    expect(sections[0].name).toBe('Section section-0');
    expect(sections.length).toBe(1);
  });
});
