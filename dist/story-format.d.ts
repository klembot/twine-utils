/**
 * Represents a story format.
 */
import Story from './story';
export default class StoryFormat {
    attributes?: Record<string, unknown>;
    constructor(rawSource?: string);
    /**
     * Create the `attributes` property, which contains the parsed version of
     * the format's properties.
     */
    load(rawSource: string): Promise<void>;
    /**
     * Returns HTML for a story bound to this format.
     */
    publish(story: Story): string;
    /**
     * Returns a JSONP representation of the story format's attributes.
     */
    toJSONP(callbackName?: string): string;
}
