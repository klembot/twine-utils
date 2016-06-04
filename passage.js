'use strict';
var cheerio = require('cheerio');
var entities = require('html-entities').AllHtmlEntities;

function Passage(props) {
	props = props || {};
	this.attributes = props.attributes || {};
	this.source = props.source || '';
}

Object.assign(Passage.prototype, {
	// Loads the contents of an HTML fragment, replacing properties of this
	// passage.

	loadHtml: function(src) {
		var $ = cheerio.load(src);
		var $passage = $('tw-passagedata');

		if ($passage.length == 0) {
			console.error('Warning: there are no passages in this HTML ' +
				'source code.');
			return;
		}
		else if ($passage.length > 1) {
			console.error('Warning: there appears to be more than one ' +
				'passage in this HTML source code. Using the first.');
		}

		this.attributes = $passage[0].attribs;
		this.source = $passage.eq(0).text();
		return this;
	},

	toHtml: function(pid) {
		var output = cheerio.load('<tw-passagedata></tw-passagedata>');

		output('tw-passagedata')
			.attr(this.attributes)
			.attr('pid', pid || this.attributes.pid || '')
			.html(entities.encode(this.source));
		return output.html();
	}
});

module.exports = Passage;
