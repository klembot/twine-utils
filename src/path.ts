import {accessSync} from 'fs';
import {access} from 'fs/promises';
import {join} from 'path';
import {getDocumentsFolder} from 'platform-folders';

/**
 * Possible names for the Stories folder in Twine. These were manually assembled
 * from the translation files.
 */
const storyDirectoryNames = [
  '故事',
  'Cerita',
  'Geschichten',
  'Histórias',
  'Historias',
  'Historier',
  'Històries',
  'Histoires',
  'Истории',
  'Оповідання',
  'Öyküler',
  'Příběhy',
  'Racconti',
  'Stories',
  'Tarinat',
  'Verhalen',
  'Zgodbe'
];

/**
 * Returns a promise to an absolute path to the user's story directory. If it
 * can't be found, this rejects.
 */
export async function storyDirectory() {
  const documentsDirectory = getDocumentsFolder();

  async function directoryExists(path: string) {
    await access(path);
    return path;
  }

  const twineDirectory = join(documentsDirectory, 'Twine');

  try {
    await directoryExists(twineDirectory);
  } catch (error) {
    throw new Error('Could not find your Twine directory');
  }

  const storiesDirectoryName = await Promise.any(
    storyDirectoryNames.map(name => directoryExists(join(twineDirectory, name)))
  );

  if (!storiesDirectoryName) {
    throw new Error('Could not find your Stories directory');
  }

  return storiesDirectoryName;
}

/**
 * Synchronous version of storyDirectory().
 */
export function storyDirectorySync() {
  const documentsDirectory = getDocumentsFolder();

  function testDirectory(path: string) {
    try {
      accessSync(path);
      return path;
    } catch (e) {
      return false;
    }
  }

  const twineDirectory = join(documentsDirectory, 'Twine');

  if (!testDirectory(twineDirectory)) {
    throw new Error('Could not find your Twine directory');
  }

  for (const name of storyDirectoryNames) {
    const storyDirectoryName = join(twineDirectory, name);

    if (testDirectory(storyDirectoryName)) {
      return storyDirectoryName;
    }
  }

  throw new Error('Could not find your Stories directory');
}
