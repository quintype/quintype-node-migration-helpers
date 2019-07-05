import { dir } from 'tmp-promise';

import { readFromGzipFile } from '../test-utils/read-from-file';
import { ExternalId, Entity } from './editor-types';
import { createEntityStream,endEntityStream } from './entity-stream';

describe("createEntityStream",()=>{
  async function mapExternalIdToEntity(externalIds: ReadonlyArray<ExternalId>): Promise<ReadonlyArray<Entity>> {
    return externalIds.map(x => ({
      'name': `Entity ${x['external-id']}`,
      'external-id': x['external-id'],
      'type': 'Entity type'
    }));
  }
  it("writes entities to stream", async ()=>{
    const { path } = await dir({ unsafeCleanup: true });
    const entityStream = createEntityStream(mapExternalIdToEntity, {
      directory: path
    });
    entityStream.write({ 'external-id': 'entity-0' });
    entityStream.write({ 'external-id': 'entity-1' });
    await endEntityStream(entityStream);

    const fileContents = await readFromGzipFile(`${path}/entities-00001.txt.gz`);
    const entities = fileContents
      .trim()
      .split('\n')
      .map(entity => JSON.parse(entity));
    expect(entities[0].name).toBe('Entity entity-0');
    expect(entities[1].name).toBe('Entity entity-1');
  });
  it('does not duplicate the sections into the stream', async () => {
    const { path } = await dir({ unsafeCleanup: true });
    const entityStream = createEntityStream(mapExternalIdToEntity, {
      directory: path
    });
    entityStream.write({ 'external-id': 'enitity-0' });
    entityStream.write({ 'external-id': 'enitity-0' });
    entityStream.write({ 'external-id': 'enitity-0' });
    entityStream.write({ 'external-id': 'enitity-0' });
    entityStream.write({ 'external-id': 'enitity-0' });
    entityStream.write({ 'external-id': 'enitity-0' });
    await endEntityStream(entityStream);
    const fileContents = await readFromGzipFile(`${path}/entities-00001.txt.gz`);
    const entities = fileContents
      .trim()
      .split('\n')
      .map(enitity => JSON.parse(enitity));
    expect(entities[0].name).toBe('Entity enitity-0');
    expect(entities.length).toBe(1);
  });
  
});

