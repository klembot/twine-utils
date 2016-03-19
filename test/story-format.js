'use strict';
var assert = require('assert');
var fs = require('fs');
var Story = require('../story');
var StoryFormat = require('../story-format');

describe('StoryFormat', function() {
	it('creates an empty object when constructed without options', function() {
		var empty = new StoryFormat();
		assert.equal(empty.loaded, false);
	});

	it('loads a story format from a file', function() {
		var harlowe = new StoryFormat();
		harlowe.load(fs.readFileSync('test/data/harlowe.js', { encoding: 'utf8' }));
		assert.equal(harlowe.loaded, true);
		assert.equal(harlowe.attributes.name, 'Harlowe');
		assert.equal(typeof harlowe.rawSource, 'string');
		assert.equal(typeof harlowe.attributes.source, 'string');
	});

	it('publishes stories', function() {
		var harlowe = new StoryFormat();
		var testStory = new Story();

		harlowe.load(fs.readFileSync('test/data/harlowe.js', { encoding: 'utf8' }));
		testStory.mergeHtml(fs.readFileSync('test/data/test-story.html', { encoding: 'utf8' }));

		var output = harlowe.publish(testStory);
	});
});
