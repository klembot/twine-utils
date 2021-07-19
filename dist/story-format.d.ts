import Story from './story';
/**
 * A story format, used to publish a Twine story to playable HTML.
 */
export default class StoryFormat {
    attributes?: Record<string, any>;
    constructor(rawSource?: string);
    /**
     * Creates the `attributes` property, which contains the parsed version of the
     * format's properties, from a JSONP-formatted string.
     */
    load(rawSource: string): this;
    /**
     * Returns HTML for a story bound to this format.
     */
    publish(story: Story): string;
}
