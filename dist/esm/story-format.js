/**
 * A story format, used to publish a Twine story to playable HTML.
 */
export default class StoryFormat {
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
        return new Promise((resolve, reject) => {
            const looseGlobal = global;
            const oldWindow = looseGlobal.window;
            if (oldWindow === null || oldWindow === void 0 ? void 0 : oldWindow.storyFormat) {
                reject(new Error('Warning: asked to load a story format but window.storyFormat is currently defined. Did another format fail to load?'));
            }
            const loader = (attributes) => {
                this.attributes = attributes;
                looseGlobal.window = oldWindow;
                resolve();
            };
            looseGlobal.window = { storyFormat: loader };
            new Function(rawSource)();
        });
    }
    /**
     * Returns HTML for a story bound to this format.
     */
    publish(story) {
        if (!this.attributes.source) {
            throw new Error('This story format has no source attribute.');
        }
        if (typeof this.attributes.source !== 'string') {
            throw new Error("This story format's source attribute is not a string.");
        }
        let output = this.attributes.source;
        output = output.replace(/{{STORY_NAME}}/g, story.attributes.name);
        output = output.replace(/{{STORY_DATA}}/g, story.toHTML());
        return output;
    }
    /**
     * Returns a JSONP representation of the story format's attributes.
     */
    toJSONP(callbackName = 'storyFormat') {
        const serializable = Object.keys(this.attributes).reduce((result, key) => {
            if (typeof this.attributes[key] === 'function') {
                return Object.assign(Object.assign({}, result), { [key]: this.attributes[key].toString() });
            }
            return Object.assign(Object.assign({}, result), { [key]: this.attributes[key] });
        }, {});
        return `window.${callbackName}(${JSON.stringify(serializable)})`;
    }
}
