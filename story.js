'use strict';
var cheerio = require('cheerio');
var Passage = require('./passage');

function Story(props) {
	props = props || {};
	this.attributes = props.attributes || {};

	// Set ourselves as the story creator by default.

	if (this.attributes.creator === undefined) {
		this.attributes.creator = 'twine-utils';
	}

	this.passages = props.passages || [];
	this.javascript = props.javascript || '';
	this.stylesheet = props.stylesheet || '';
};

Object.assign(Story.prototype, {
	// Loads the contents of an HTML file, replacing properties of this story.

	loadHtml: function(source) {
		var $ = cheerio.load(source);
		var $story = $('tw-storydata');

		if ($story.length == 0) {
			console.error('Warning: there are no stories in this HTML source code.');
			return;
		}
		else if ($story.length > 1) {
			console.error('Warning: there appears to be more than one story ' +
				'in this HTML source code. Using the first.');
		}

		this.attributes = $story[0].attribs;
		this.passages = [];

		$story.find('tw-passagedata').each(function(index, el) {
			var passage = new Passage().loadHtml(cheerio.html(el));

			this.passages.push(passage);

			if (passage.attributes.pid === this.attributes.startnode) {
				this.startPassage = passage;
			}
		}.bind(this));

		this.stylesheet = $story.find('style[type="text/twine-css"]').html();
		this.javascript = $story.find('script[type="text/twine-javascript"]').html();

		return this;
	},

	// Merges the contents of another story object with this one.

	mergeStory: function(story) {
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

		Object.keys(story.attributes).forEach(function(attrib) {
			if (this.attributes[attrib] === undefined) {
				this.attributes[attrib] = story.attributes[attrib];
			}
		}.bind(this));

		// If we didn't have a start passage before, update it.

		if (this.startPassage === undefined && story.startPassage) {
			this.startPassage = story.startPassage;
		}

		return this;
	},

	// A convenience method that merges the contents of a story in HTML form.

	mergeHtml: function(source) {
		var toMerge = new Story().loadHtml(source);
		this.mergeStory(toMerge);
	},

	// Merges JavaScript source in with this story.

	mergeJavaScript: function(source) {
		this.javascript += '\n' + source;
		return this;
	},

	// Merges CSS source in with this story.

	mergeStylesheet: function(source) {
		this.stylesheet += '\n' + source;
		return this;
	},

	// Merges Twee source in with this story.

	mergeTwee: function(source) {
		var firstLineMatch = /.*/;
		var restMatch = /.*?[\r\n]{1,2}([\s\S]*)/m;
		var tagMatch = /\[(.*)\]$/m;

		source.split(/^::/m).forEach(function(src) {
			// The first line will always be the passage title.

			var header = firstLineMatch.exec(src);
			var rest = restMatch.exec(src);

			if (!header || !rest) {
				return;
			}
			else {
				header = header[0].trim();
				rest = rest[1].trim();
			}

			var passage = new Passage();
			passage.source = rest;

			// The first line may contain a bracketed, space-delimited list of
			// tags.

			var tagSource = tagMatch.exec(header);

			if (tagSource) {
				passage.attributes.tags = tagSource[1].split(/\s+/);
				passage.attributes.name = header.substring(0, header.indexOf('[')).trim();
			}
			else {
				passage.attributes.name = header;
			}

			this.passages.push(passage);
		}.bind(this));
	},

	// Sets the start attribute to a named passage.

	setStartByName: function(name) {
		var target = this.passages.find(function(passage) {
			return passage.attributes.name === name;
		}.bind(this));

		if (!target) {
			throw new Error("This story has no passage named '" + name + "'.");
		}

		this.startPassage = target;
	},

	// Returns an HTML fragment for this story. Normally, you'd use a
	// StoryFormat to bind it as a complete HTML page.

	toHtml: function() {
		var output = cheerio.load('<tw-storydata></tw-storydata>');

		output('tw-storydata')
			.attr(this.attributes)
			.attr('startnode', this.passages.indexOf(this.startPassage) + 1)
			.html(this.passages.reduce(
				function(result, passage, index) {
					result += passage.toHtml(index + 1);
					return result;
				},
				''
			))
			.append('<style role="stylesheet" id="twine-user-stylesheet" ' +
				'type="text/twine-css"></style><script role="script" ' +
				'id="twine-user-script" type="text/twine-javascript">' +
				'</script>');

		output('#twine-user-script').html(this.javascript);
		output('#twine-user-stylesheet').html(this.stylesheet);

		return output.html();
	}
});

module.exports = Story;
