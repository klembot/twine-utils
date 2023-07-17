/**
 * Options that can be set when creating a Passage object.
 */
export interface PassageOptions {
    /**
     * Attributes on the passage, like name or tags. These appear on the
     * `<tw-passagedata>` element when published.
     */
    attributes?: Record<string, unknown>;
    /**
     * Source text of the passage.
     */
    source?: string;
}
/**
 * A single passage in a story. This does not have a `fromTwee()` method because
 * loading Twee may have story-wide effects.
 */
export declare class Passage {
    /**
     * Attributes on the passage, like name or tags. These appear on the
     * `<tw-passagedata>` element when published.
     */
    attributes: Record<string, unknown>;
    /**
     * Source text of the passage.
     */
    source: string;
    constructor(props?: PassageOptions);
    /**
     * Creates an instance from an HTML fragment.
     * @param source - source HTML to use
     * @param silent - If true, doesn't issue any console warnings about potential problems
     */
    static fromHTML(source: string, silent?: boolean): Passage;
    /**
     * Returns an HTML fragment for this passage, optionally setting the passage
     * id (or pid) manually.
     * @param pid - PID to set in the published HTML
     */
    toHTML(pid?: number): string;
    /**
     * Returns Twee source code for this story. *Warning:* if the Twee version
     * specified is less than 3, this is a lossy conversion.
     * @param tweeVersion version of the Twee spec to use
     * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
     */
    toTwee(tweeVersion?: number): string;
}
