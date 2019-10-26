/**
 * Provides a way to look up where the user's Twine directory is. Right now this
 * does not handle localized directory names :(.
 */
/**
 * Returns an absolute path to the user's story directory. If it can't be found,
 * this throws an error.
 */
export default function storyDirectorySync(): string;
