// tslint:disable:no-expression-statement
import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { createAuthorStream, endAuthorStream } from './author-stream';
import { Author, ExternalId} from './editor-types';

describe('createAuthorStream', () => {
  async function mapExternalIdToAuthors(externalIds: ReadonlyArray<ExternalId>): Promise<ReadonlyArray<Author>> {
    return externalIds.map(x => ({
      'external-id': x["external-id"],
      name: `Author ${x["external-id"]}`
    }));
  }

  it('writes authors to the stream', async () => {
    const { path } = await dir({ unsafeCleanup: true });
    const authorStream = createAuthorStream(mapExternalIdToAuthors, {
      directory: path
    });
    authorStream.write({'external-id':'author-0'});
    authorStream.write({'external-id':'author-1'});
    await endAuthorStream(authorStream);
    const fileContents = await readFromGzipFile(`${path}/authors-00001.txt.gz`);
    const authors = fileContents
      .trim()
      .split('\n')
      .map(author => JSON.parse(author));
    expect(authors[0].name).toBe('Author author-0');
    expect(authors[1].name).toBe('Author author-1');
  });

  it('does not duplicate the authors into the stream', async () => {
    const { path } = await dir({ unsafeCleanup: true });
    const authorStream = createAuthorStream(mapExternalIdToAuthors, {
      directory: path
    });
    authorStream.write({'external-id':'author-0'});
    authorStream.write({'external-id':'author-0'});
    authorStream.write({'external-id':'author-0'});
    authorStream.write({'external-id':'author-0'});
    authorStream.write({'external-id':'author-0'});
    authorStream.write({'external-id':'author-0'});
    await endAuthorStream(authorStream);
    const fileContents = await readFromGzipFile(`${path}/authors-00001.txt.gz`);
    const authors = fileContents
      .trim()
      .split('\n')
      .map(author => JSON.parse(author));
    expect(authors[0].name).toBe('Author author-0');
    expect(authors.length).toBe(1);
  });
});
