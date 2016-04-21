'use strict';
var assert = require('assert');
var fs = require('fs');
var Passage = require('../passage');
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
				
		assert.equal(output.indexOf('{{STORY_NAME}}'), -1);
		assert.equal(output.indexOf('{{STORY_DATA}}'), -1);
		assert.notEqual(output.indexOf('<tw-storydata'), -1);
		assert.notEqual(output.indexOf('<tw-passagedata'), -1);
	});

	it('properly encodes HTML while publishing', function() {
		var story = new Story();
		var test = new StoryFormat();

		story.passages.push(new Passage({ source: '"&<><br>' }));
		test.attributes = { source: '{{STORY_DATA}}' };

		assert.equal(test.publish(story), '<tw-storydata creator="twine-utils" startnode="0"><tw-passagedata pid="1">&quot;&amp;&lt;&gt;&lt;br&gt;</tw-passagedata><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style><script role="script" id="twine-user-script" type="text/twine-javascript"></script></tw-storydata>');
	});
});
