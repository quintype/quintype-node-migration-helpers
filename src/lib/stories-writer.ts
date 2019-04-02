import { GenerateToFileOptions, writeToFiles } from './async-writer';

export interface Story {
  readonly headline: string;
}

export function writeStories(
  stream: AsyncIterableIterator<Story>,
  source: string = 'export',
  opts: GenerateToFileOptions
): Promise<void> {
  const filePrefix = opts.filePrefix ? `story-${source}-${opts.filePrefix}` : `story-${source}`;
  return writeToFiles(stream, { filePrefix, ...opts });
}
