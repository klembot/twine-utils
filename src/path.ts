/**
 * Provides a way to look up where the user's Twine directory is. Right now this
 * does not handle localized directory names :(.
 */

import fs from 'fs';
import osenv from 'osenv';
import path from 'path';

const documentDirectoryNames = ['Documents', 'My Documents'];
const twineDirectoryNames = ['Twine'];
const storyDirectoryNames = ['Stories'];

/**
 * Returns an absolute path to the user's story directory. If it can't be found,
 * this throws an error.
 */

export function storyDirectorySync() {
  let result = osenv.home();
  const testDir = path => {
    try {
      fs.accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Find the documents directory.

  const docDirectory = documentDirectoryNames.find(dir =>
    testDir(path.join(result, dir))
  );

  if (!docDirectory) {
    throw new Error('Could not find your documents directory');
  }

  result = path.join(result, docDirectory);

  // Find the Twine directory.

  const twineDirectory = twineDirectoryNames.find(dir =>
    testDir(path.join(result, dir))
  );

  if (!twineDirectory) {
    throw new Error('Could not find your Twine directory');
  }

  result = path.join(result, twineDirectory);

  // Finally, find the Stories directory.

  const storiesDirectory = storyDirectoryNames.find(dir =>
    testDir(path.join(result, dir))
  );

  if (!storiesDirectory) {
    throw new Error('Could not find your Stories directory');
  }

  return path.join(result, storiesDirectory);
}
