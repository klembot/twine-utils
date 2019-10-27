/**
 * Represents a story format.
 */
import Story from './story';
export default class StoryFormat {
    attributes: {
        [key: string]: any;
    };
    loaded: boolean;
    rawSource: string;
    constructor(rawSource?: string);
    /**
     * Create the `attributes` property, which contains the parsed version of
     * the format's properties.
     */
    load(rawSource: string): this;
    /**
     * Returns HTML for a story bound to this format.
     */
    publish(story: Story): any;
}
