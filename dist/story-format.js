"use strict";
/**
 * Represents a story format.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class StoryFormat {
    constructor(rawSource) {
        this.loaded = false;
        if (rawSource) {
            this.load(rawSource);
        }
    }
    /**
     * Create the `attributes` property, which contains the parsed version of
     * the format's properties.
     */
    load(rawSource) {
        const oldWindow = global.window;
        const loader = attributes => {
            this.attributes = attributes;
            this.loaded = true;
            global.window = oldWindow;
        };
        this.rawSource = rawSource;
        global.window = { storyFormat: loader };
        eval(this.rawSource);
        return this;
    }
    /**
     * Returns HTML for a story bound to this format.
     */
    publish(story) {
        let output = this.attributes.source;
        output = output.replace(/{{STORY_NAME}}/g, story.attributes.name);
        output = output.replace(/{{STORY_DATA}}/g, story.toHtml());
        return output;
    }
}
exports.default = StoryFormat;
