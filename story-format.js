'use strict';

var StoryFormat = function(rawSource) {
	this.loaded = false;

	if (rawSource) {
		this.load(rawSource);
	}
};

Object.assign(StoryFormat.prototype, {
	// Create the `attributes property, which contains the parsed version of
	// the format's properties.

	load: function(rawSource) {
		var oldWindow = global.window;

		var loader = (function(attributes) {
			this.attributes = attributes;
			this.loaded = true;
			global.window = oldWindow;
		}).bind(this);

		this.rawSource = rawSource;
		global.window = { storyFormat: loader };
		eval(this.rawSource);
	},

	// Returns HTML for a story bound to this format.

	publish: function(story) {
		var output = this.attributes.source;

		output = output.replace('{{STORY_NAME}}', story.attributes.name);
		output = output.replace('{{STORY_DATA}}', story.toHtml());
		return output;
	}
});

module.exports = StoryFormat;
