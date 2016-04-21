'use strict';
var assert = require('assert');
var fs = require('fs');
var Passage = require('../passage');

describe('Passage', function() {
	it('creates an empty object when constructed without options', function() {
		var empty = new Passage();

		assert.equal(Object.keys(empty.attributes), 0);
		assert.equal(empty.source, '');
	});

	it('loads contents from HTML', function() {
		var test = new Passage();
		test.loadHtml(fs.readFileSync('test/data/test-passage.html', { encoding: 'utf8' }));
		assert(test.source.length > 0);
		assert.equal(test.attributes.name, 'Untitled Passage');
		assert.equal(test.attributes.tags, 'foo');
	});

	it('publishes an HTML fragment', function() {
		var test = new Passage();
		var source = fs.readFileSync('test/data/test-passage.html', { encoding: 'utf8' });

		test.loadHtml(source);
		assert.equal(test.toHtml().trim(), source.trim());
	});
});
