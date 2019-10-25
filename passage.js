const cheerio = require('cheerio');
const entities = require('html-entities').AllHtmlEntities;

class Passage {
	constructor(props = {}) {
		this.attributes = props.attributes || {};
		this.source = props.source || '';
	}

	// Loads the contents of an HTML fragment, replacing properties of this
	// object.

	loadHtml(src) {
		const $ = cheerio.load(src);
		const $passage = $('tw-passagedata');

		if ($passage.length == 0) {
			console.error(
				'Warning: there are no passages in this HTML ' + 'source code.'
			);
			return this;
		} else if ($passage.length > 1) {
			console.error(
				'Warning: there appears to be more than one ' +
					'passage in this HTML source code. Using the first.'
			);
		}

		this.attributes = $passage[0].attribs;
		this.source = $passage.eq(0).text();
		return this;
	}

	toHtml(pid) {
		const output = cheerio.load('<tw-passagedata></tw-passagedata>');

		output('tw-passagedata')
			.attr(this.attributes)
			.html(entities.encode(this.source));

		if (pid || this.attributes.pid) {
			output('tw-passagedata').attr('pid', pid || this.attributes.pid);
		}

		return output.html();
	}
}

module.exports = Passage;
