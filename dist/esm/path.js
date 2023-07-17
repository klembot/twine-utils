var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { accessSync } from 'fs';
import { access } from 'fs/promises';
import { join } from 'path';
import { getDocumentsFolder } from 'platform-folders';
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
export function storyDirectory() {
    return __awaiter(this, void 0, void 0, function* () {
        const documentsDirectory = getDocumentsFolder();
        function directoryExists(path) {
            return __awaiter(this, void 0, void 0, function* () {
                yield access(path);
                return path;
            });
        }
        const twineDirectory = join(documentsDirectory, 'Twine');
        try {
            yield directoryExists(twineDirectory);
        }
        catch (error) {
            throw new Error('Could not find your Twine directory');
        }
        const storiesDirectoryName = yield Promise.any(storyDirectoryNames.map(name => directoryExists(join(twineDirectory, name))));
        if (!storiesDirectoryName) {
            throw new Error('Could not find your Stories directory');
        }
        return storiesDirectoryName;
    });
}
/**
 * Synchronous version of storyDirectory().
 */
export function storyDirectorySync() {
    const documentsDirectory = getDocumentsFolder();
    function testDirectory(path) {
        try {
            accessSync(path);
            return path;
        }
        catch (e) {
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
