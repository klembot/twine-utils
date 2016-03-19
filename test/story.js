'use strict';
var assert = require('assert');
var cheerio = require('cheerio');
var fs = require('fs');
var Passage = require('../passage');
var Story = require('../story');

describe('Story', function() {
	it('creates an empty object when constructed without options', function() {
		var empty = new Story();

		assert.equal(empty.attributes.creator, 'twine-utils');
		assert.equal(typeof empty.passages, 'object');
		assert.equal(empty.passages.length, 0);
		assert.equal(empty.stylesheet, '');
		assert.equal(empty.javascript, '');
	});

	it('merges JavaScript', function() {
		var test = new Story({ javascript: 'line 1\nline 2' });

		assert.equal(test.javascript, 'line 1\nline 2');
		test.mergeJavaScript('line 3\nline 4');
		assert.equal(test.javascript, 'line 1\nline 2\nline 3\nline 4');
	});

	it('merges stylesheets', function() {
		var test = new Story({ stylesheet: 'line 1\nline 2' });

		assert.equal(test.stylesheet, 'line 1\nline 2');
		test.mergeStylesheet('line 3\nline 4');
		assert.equal(test.stylesheet, 'line 1\nline 2\nline 3\nline 4');
	});

	it('merges stories in HTML format', function() {
		var test = new Story();

		test.mergeHtml(fs.readFileSync('test/data/test-story.html', { encoding: 'utf8' }));
		assert.equal(test.passages.length, 2);
		assert.equal(test.passages[0].attributes.name, 'Untitled Passage');
		assert.equal(test.passages[1].attributes.name, '1');
	});

	it('publishes an HTML fragment', function() {
		var test = new Story();
		
		test.mergeHtml(fs.readFileSync('test/data/test-story.html', { encoding: 'utf8' }));
		var $ = cheerio.load(test.toHtml());

		assert.equal($('tw-storydata').length, 1);
		assert.equal($('tw-storydata').attr('name'), 'Test');
		assert.equal($('tw-passagedata').length, 2);
		assert.equal($('tw-passagedata').eq(0).attr('name'), 'Untitled Passage');
	});

	it('publishes an HTML fragment with ordered passage IDs', function() {
		var test = new Story();

		test.passages.push(new Passage({ name: 'test1' }));
		test.passages.push(new Passage({ name: 'test2' }));
		test.passages.push(new Passage({ name: 'test3' }));

		var $ = cheerio.load(test.toHtml());
		
		$('tw-passagedata').each(function(index) {
			assert.equal($(this).attr('pid'), index + 1);
		});
	});

	it('publishes an HTML fragment with the correct start node index', function() {
		var test = new Story();

		test.passages.push(new Passage({ name: 'test1' }));
		test.passages.push(new Passage({ name: 'test2' }));
		test.passages.push(new Passage({ name: 'test3' }));
		test.startPassage = test.passages[1];

		var $ = cheerio.load(test.toHtml());

		assert.equal($('tw-storydata').attr('startnode'), '2');
	});

	it('publishes the stylesheet as a separate element', function() {
		var test = new Story({ stylesheet: 'test 1 2 3' });
		var $ = cheerio.load(test.toHtml());

		assert.equal($('#twine-user-stylesheet').length, 1);
		assert.equal($('#twine-user-stylesheet').html(), 'test 1 2 3');
	});

	it('publishes JavaScript as a separate element', function() {
		var test = new Story({ javascript: 'test 1 2 3' });
		var $ = cheerio.load(test.toHtml());

		assert.equal($('#twine-user-script').length, 1);
		assert.equal($('#twine-user-script').html(), 'test 1 2 3');
	});
});
