"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyDirectorySync = exports.storyDirectory = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const platform_folders_1 = require("platform-folders");
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
function storyDirectory() {
    return __awaiter(this, void 0, void 0, function* () {
        const documentsDirectory = (0, platform_folders_1.getDocumentsFolder)();
        function directoryExists(path) {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, promises_1.access)(path);
                return path;
            });
        }
        const twineDirectory = (0, path_1.join)(documentsDirectory, 'Twine');
        try {
            yield directoryExists(twineDirectory);
        }
        catch (error) {
            throw new Error('Could not find your Twine directory');
        }
        const storiesDirectoryName = yield Promise.any(storyDirectoryNames.map(name => directoryExists((0, path_1.join)(twineDirectory, name))));
        if (!storiesDirectoryName) {
            throw new Error('Could not find your Stories directory');
        }
        return storiesDirectoryName;
    });
}
exports.storyDirectory = storyDirectory;
/**
 * Synchronous version of storyDirectory().
 */
function storyDirectorySync() {
    const documentsDirectory = (0, platform_folders_1.getDocumentsFolder)();
    function testDirectory(path) {
        try {
            (0, fs_1.accessSync)(path);
            return path;
        }
        catch (e) {
            return false;
        }
    }
    const twineDirectory = (0, path_1.join)(documentsDirectory, 'Twine');
    if (!testDirectory(twineDirectory)) {
        throw new Error('Could not find your Twine directory');
    }
    for (const name of storyDirectoryNames) {
        const storyDirectoryName = (0, path_1.join)(twineDirectory, name);
        if (testDirectory(storyDirectoryName)) {
            return storyDirectoryName;
        }
    }
    throw new Error('Could not find your Stories directory');
}
exports.storyDirectorySync = storyDirectorySync;
