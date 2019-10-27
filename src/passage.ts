/**
 * A single passage in a story. This does not have a loadTwee() method because
 * loading Twee may have story-wide effects.
 */

import cheerio from 'cheerio';
import {AllHtmlEntities} from 'html-entities';

interface PassageOptions {
	attributes?: {[key: string]: any};
	source?: string;
}

export default class Passage {
	attributes: {[key: string]: any};
	source: string;

	constructor(props: PassageOptions = {}) {
		this.attributes = props.attributes || {};
		this.source = props.source || '';
	}

	/**
	 *  Loads the contents of an HTML fragment, replacing properties of this
	 *  object.
	 */

	loadHtml(src: string) {
		const $ = cheerio.load(src);
		const $passage = $('tw-passagedata');

		if ($passage.length === 0) {
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

	/**
	 * Outputs the passage as an HTML fragment, optionally setting the passage
	 * id (or pid) manually.
	 */

	toHtml(pid?: number) {
		const output = cheerio.load('<tw-passagedata></tw-passagedata>');

		output('tw-passagedata')
			.attr(this.attributes)
			.html(AllHtmlEntities.encode(this.source));

		if (pid || this.attributes.pid) {
			output('tw-passagedata').attr('pid', pid || this.attributes.pid);
		}

		return output.html();
	}
}
