"use strict";
/**
 * Provides a way to look up where the user's Twine directory is. Right now this
 * does not handle localized directory names :(.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const osenv_1 = __importDefault(require("osenv"));
const path_1 = __importDefault(require("path"));
const documentDirectoryNames = ['Documents', 'My Documents'];
const twineDirectoryNames = ['Twine'];
const storyDirectoryNames = ['Stories'];
/**
 * Returns an absolute path to the user's story directory. If it can't be found,
 * this throws an error.
 */
function storyDirectorySync() {
    let result = osenv_1.default.home();
    const testDir = path => {
        try {
            fs_1.default.accessSync(path);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    // Find the documents directory.
    const docDirectory = documentDirectoryNames.find(dir => testDir(path_1.default.join(result, dir)));
    if (!docDirectory) {
        throw new Error('Could not find your documents directory');
    }
    result = path_1.default.join(result, docDirectory);
    // Find the Twine directory.
    const twineDirectory = twineDirectoryNames.find(dir => testDir(path_1.default.join(result, dir)));
    if (!twineDirectory) {
        throw new Error('Could not find your Twine directory');
    }
    result = path_1.default.join(result, twineDirectory);
    // Finally, find the Stories directory.
    const storiesDirectory = storyDirectoryNames.find(dir => testDir(path_1.default.join(result, dir)));
    if (!storiesDirectory) {
        throw new Error('Could not find your Stories directory');
    }
    return path_1.default.join(result, storiesDirectory);
}
exports.default = storyDirectorySync;
