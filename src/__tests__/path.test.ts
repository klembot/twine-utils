import fs from 'fs';
import {storyDirectory, storyDirectorySync} from '../path';

describe('Path', () => {
  it('locates the Stories directory asynchronously', async () => {
    const path = await storyDirectory();

    expect(() => fs.accessSync(path)).not.toThrow();
  });

  it('locates the Stories directory synchronously', async () => {
    expect(() => fs.accessSync(storyDirectorySync())).not.toThrow();
  });
});
