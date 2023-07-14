/**
 * Represents a story format.
 */

import Story from './story';

export default class StoryFormat {
	attributes: {[key: string]: any};
	loaded: boolean;
	rawSource: string;

	constructor(rawSource?: string) {
		this.loaded = false;

		if (rawSource) {
			this.load(rawSource);
		}
	}

	/**
	 * Create the `attributes` property, which contains the parsed version of
	 * the format's properties.
	 */

	load(rawSource: string) {
		const oldWindow = (global as any).window;

		const loader = attributes => {
			this.attributes = attributes;
			this.loaded = true;
			(global as any).window = oldWindow;
		};

		this.rawSource = rawSource;
		(global as any).window = {storyFormat: loader};
		eval(this.rawSource);
		return this;
	}

	/**
	 * Returns HTML for a story bound to this format.
	 */

	publish(story: Story) {
		let output = this.attributes.source;

		output = output.replace(
			/{{STORY_NAME}}/g,
			story.attributes.name as string
		);
		output = output.replace(/{{STORY_DATA}}/g, story.toHTML());
		return output;
	}
}
