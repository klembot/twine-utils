'use strict';
var assert = require('assert');
var fs = require('fs');
var twinePath = require('../path');

describe('Path', function() {
	it('locates the Stories directory synchronously', function() {
		var path = twinePath.storyDirectorySync();

		assert.doesNotThrow(function() {
			fs.accessSync(path);
		});
	});
});
