/**
 * Returns a promise to an absolute path to the user's story directory. If it
 * can't be found, this rejects.
 */
export declare function storyDirectory(): Promise<string>;
/**
 * Synchronous version of storyDirectory().
 */
export declare function storyDirectorySync(): string;
