'use strict';
var fs = require('fs');
var osenv = require('osenv');
var path = require('path');

// TODO: Localized directory names

var TwinePath = {
	documentDirectoryNames: [
		'Documents',
		'My Documents'
	],

	twineDirectoryNames: [
		'Twine'
	],

	storyDirectoryNames: [
		'Stories'
	],

	// Returns the name of the user's story directory.

	storyDirectorySync: function() {
		var result = osenv.home();

		function testDir(path) {
			try {
				fs.accessSync(path);
				return true;
			}
			catch (e) {
				return false;
			}
		}

		// Find the documents directory.

		var docDirectory = TwinePath.documentDirectoryNames.find(function(dir) {
			return testDir(path.join(result, dir));
		});

		if (!docDirectory) {
			throw new Error("Could not find your documents directory");
		}

		result = path.join(result, docDirectory);

		// Find the Twine directory.

		var twineDirectory = TwinePath.twineDirectoryNames.find(function(dir) {
			return testDir(path.join(result, dir));
		});

		if (!twineDirectory) {
			throw new Error("Could not find your Twine directory");
		}

		result = path.join(result, twineDirectory);

		// Finally, find the Stories directory.

		var storiesDirectory = TwinePath.storyDirectoryNames.find(function(dir) {
			return testDir(path.join(result, dir));
		});

		if (!storiesDirectory) {
			throw new Error("Could not find your Stories directory");
		}

		return path.join(result, storiesDirectory);
	}
};

module.exports = TwinePath;
