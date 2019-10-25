const cheerio = require('cheerio');
const Passage = require('./passage');

class Story {
	constructor(props = {}) {
		this.attributes = props.attributes || {};

		// Set ourselves as the story creator by default.

		if (this.attributes.creator === undefined) {
			this.attributes.creator = 'twine-utils';
		}

		this.passages = props.passages || [];
		this.javascript = props.javascript || '';
		this.stylesheet = props.stylesheet || '';
	}

	// Loads the contents of an HTML file, replacing properties of this story.

	loadHtml(source) {
		const $ = cheerio.load(source);
		const $story = $('tw-storydata');

		if ($story.length == 0) {
			console.error(
				'Warning: there are no stories in this HTML source code.'
			);
			return this;
		} else if ($story.length > 1) {
			console.error(
				'Warning: there appears to be more than one story ' +
					'in this HTML source code. Using the first.'
			);
		}

		this.attributes = $story[0].attribs;
		this.passages = [];

		$story.find('tw-passagedata').each((index, el) => {
			const passage = new Passage().loadHtml(cheerio.html(el));

			this.passages.push(passage);

			if (passage.attributes.pid === this.attributes.startnode) {
				this.startPassage = passage;
			}
		});

		this.stylesheet = $story.find('style[type="text/twine-css"]').html();
		this.javascript = $story
			.find('script[type="text/twine-javascript"]')
			.html();

		return this;
	}

	// Merges the contents of another story object with this one.

	mergeStory(story) {
		if (story.passages.length !== 0) {
			this.passages = this.passages.concat(story.passages);
		}

		if (story.stylesheet !== '') {
			this.mergeStylesheet(story.stylesheet);
		}

		if (story.javascript !== '') {
			this.mergeJavaScript(story.javascript);
		}

		// Fill in any undefined attributes.

		Object.keys(story.attributes).forEach(attrib => {
			if (this.attributes[attrib] === undefined) {
				this.attributes[attrib] = story.attributes[attrib];
			}
		});

		// If we didn't have a start passage before, update it.

		if (this.startPassage === undefined && story.startPassage) {
			this.startPassage = story.startPassage;
		}

		return this;
	}

	// A convenience method that merges the contents of a story in HTML form.

	mergeHtml(source) {
		var toMerge = new Story().loadHtml(source);
		this.mergeStory(toMerge);
		return this;
	}

	// Merges JavaScript source in with this story.

	mergeJavaScript(source) {
		this.javascript += '\n' + source;
		return this;
	}

	// Merges CSS source in with this story.

	mergeStylesheet(source) {
		this.stylesheet += '\n' + source;
		return this;
	}

	// Merges Twee source in with this story.

	mergeTwee(source) {
		const firstLineMatch = /.*/;
		const restMatch = /.*?[\r\n]{1,2}([\s\S]*)/m;
		const tagMatch = /\[(.*)\]$/m;

		source.split(/^::/m).forEach(src => {
			// The first line will always be the passage title.

			let header = firstLineMatch.exec(src);
			let rest = restMatch.exec(src);

			if (!header || !rest) {
				return;
			} else {
				header = header[0].trim();
				rest = rest[1].trim();
			}

			const passage = new Passage();
			passage.source = rest;

			// The first line may contain a bracketed, space-delimited list of
			// tags.

			const tagSource = tagMatch.exec(header);

			if (tagSource) {
				passage.attributes.tags = tagSource[1].split(/\s+/);
				passage.attributes.name = header
					.substring(0, header.indexOf('['))
					.trim();

				// Handle script and stylesheet tagged passages.

				if (passage.attributes.tags.indexOf('stylesheet') !== -1) {
					this.mergeStylesheet(passage.source);
				}

				if (passage.attributes.tags.indexOf('script') !== -1) {
					this.mergeJavaScript(passage.source);
				}
			} else {
				passage.attributes.name = header;
			}

			this.passages.push(passage);
		});
	}

	// Sets the start attribute to a named passage.

	setStartByName(name) {
		const target = this.passages.find(
			passage => passage.attributes.name === name
		);

		if (!target) {
			throw new Error("This story has no passage named '" + name + "'.");
		}

		this.startPassage = target;
	}

	// Returns an HTML fragment for this story. Normally, you'd use a
	// StoryFormat to bind it as a complete HTML page.

	toHtml() {
		const output = cheerio.load('<tw-storydata></tw-storydata>');

		output('tw-storydata')
			.attr(this.attributes)
			.attr('startnode', this.passages.indexOf(this.startPassage) + 1)
			.html(
				this.passages.reduce((result, passage, index) => {
					result += passage.toHtml(index + 1);
					return result;
				}, '')
			)
			.append(
				'<style role="stylesheet" id="twine-user-stylesheet" ' +
					'type="text/twine-css"></style><script role="script" ' +
					'id="twine-user-script" type="text/twine-javascript">' +
					'</script>'
			);

		output('#twine-user-script').text(this.javascript);
		output('#twine-user-stylesheet').text(this.stylesheet);

		return output.html();
	}
}

module.exports = Story;
