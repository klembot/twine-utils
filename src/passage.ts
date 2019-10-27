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

		if (this.attributes.tags) {
			this.attributes.tags = this.attributes.tags.split(' ');
		}

		this.source = $passage.eq(0).text();
		return this;
	}

	/**
	 * Returns an HTML fragment for this passage, optionally setting the passage
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

	/**
	 * Returns Twee source code for this story. *Warning:* if the Twee version
	 * specified is less than 3, this is a lossy conversion.
	 * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
	 */

	toTwee(tweeVersion = 3) {
		let output = `:: ${this.attributes.name}`;

		if (this.attributes.tags) {
			output += ` [${this.attributes.tags.join(' ')}]`;
		}

		if (tweeVersion >= 3) {
			const extraAttributes = JSON.stringify({
				...this.attributes,
				name: undefined,
				pid: undefined,
				tags: undefined
			});

			if (extraAttributes !== '{}') {
				output += ` ${extraAttributes}`;
			}
		}

		return output + `\n${this.source}`;
	}
}
