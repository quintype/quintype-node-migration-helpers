// tslint:disable:no-expression-statement
import { readFile } from 'fs';
import { unzip } from 'zlib';

/** @private */
export function readFromGzipFile(path: string): Promise<string> {
  return new Promise(resolve => {
    readFile(path, (_1, data) => {
      unzip(data, (_2, buffer) => {
        resolve(buffer.toString());
      });
    });
  });
}
