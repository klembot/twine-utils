const fs = require('fs');
const osenv = require('osenv');
const path = require('path');

// TODO: Localized directory names

var TwinePath = {
	documentDirectoryNames: ['Documents', 'My Documents'],
	twineDirectoryNames: ['Twine'],
	storyDirectoryNames: ['Stories'],

	// Returns the name of the user's story directory.

	storyDirectorySync() {
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

		var docDirectory = TwinePath.documentDirectoryNames.find(dir =>
			testDir(path.join(result, dir))
		);

		if (!docDirectory) {
			throw new Error('Could not find your documents directory');
		}

		result = path.join(result, docDirectory);

		// Find the Twine directory.

		const twineDirectory = TwinePath.twineDirectoryNames.find(dir =>
			testDir(path.join(result, dir))
		);

		if (!twineDirectory) {
			throw new Error('Could not find your Twine directory');
		}

		result = path.join(result, twineDirectory);

		// Finally, find the Stories directory.

		const storiesDirectory = TwinePath.storyDirectoryNames.find(dir =>
			testDir(path.join(result, dir))
		);

		if (!storiesDirectory) {
			throw new Error('Could not find your Stories directory');
		}

		return path.join(result, storiesDirectory);
	}
};

module.exports = TwinePath;
