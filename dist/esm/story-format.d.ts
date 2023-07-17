import { Story } from './story';
/**
 * A story format, used to publish a Twine story to playable HTML.
 */
export declare class StoryFormat {
    /**
     * Attributes on the story format, like source.
     */
    attributes: Record<string, unknown>;
    /**
     * @param rawSource JSONP source to initially load
     */
    constructor(rawSource?: string);
    /**
     * Creates the `attributes` property, which contains the parsed version of the
     * format's properties, from a JSONP-formatted string. This also invokes the
     * hydrate property of the format if defined. If the format is malformed, this
     * will reject.
     * @param rawSource JSONP source to load
     * @see https://github.com/klembot/twinejs/blob/develop/EXTENDING.md#hydration
     */
    load(rawSource: string): Promise<void>;
    /**
     * Returns HTML for a story bound to this format.
     * @param story Story to publish
     */
    publish(story: Story): string;
    /**
     * Returns a JSONP representation of the story format's attributes.
     */
    toJSONP(callbackName?: string): string;
}
