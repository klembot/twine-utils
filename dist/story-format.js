"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A story format, used to publish a Twine story to playable HTML.
 */
class StoryFormat {
    constructor(rawSource) {
        this.attributes = {};
        if (rawSource) {
            this.load(rawSource);
        }
    }
    /**
     * Creates the `attributes` property, which contains the parsed version of the
     * format's properties, from a JSONP-formatted string.
     */
    load(rawSource) {
        var _a;
        if ((_a = global.window) === null || _a === void 0 ? void 0 : _a.storyFormat) {
            throw new Error('Warning: asked to load a story format but window.storyFormat is currently defined. Did another format fail to load?');
        }
        const oldWindow = global.window;
        global.window.storyFormat = () => { };
        const loader = new Function(rawSource);
        const loader = attributes => {
            this.attributes = attributes;
            this.loaded = true;
            global.window = oldWindow;
        };
        global.window = { storyFormat: loader };
        return this;
    }
    /**
     * Returns HTML for a story bound to this format.
     */
    publish(story) {
        if (!this.attributes.source) {
            throw new Error('This story format has no source attribute.');
        }
        let output = this.attributes.source;
        output = output.replace(/{{STORY_NAME}}/g, story.attributes.name);
        output = output.replace(/{{STORY_DATA}}/g, story.toHtml());
        return output;
    }
}
exports.default = StoryFormat;
