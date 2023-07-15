/**
 * Represents a Twine story.
 */
import Passage from './passage';
export interface StoryOptions {
    attributes?: Record<string, unknown>;
    javascript?: string;
    stylesheet?: string;
    passages?: Passage[];
}
export default class Story {
    attributes: Record<string, unknown>;
    javascript: string;
    startPassage: Passage;
    stylesheet: string;
    passages: Passage[];
    constructor(props?: StoryOptions);
    /**
     * Creates an instance from HTML source.
     */
    static fromHTML(source: string, silent?: boolean): Story;
    /**
     * Creates an instance from Twee source.
     * @param source Twee source
     * @param tweeVersion version of Twee to use
     * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
     */
    static fromTwee(source: string, tweeVersion?: number, silent?: boolean): Story;
    /**
     * Merges the contents of another story object with this one.
     */
    mergeStory(story: Story): this;
    /**
     * Merges JavaScript source in with this story.
     */
    mergeJavaScript(source: string): this;
    /**
     * Merges CSS source in with this story.
     */
    mergeStylesheet(source: string): this;
    /**
     * Sets the start attribute to a named passage.
     */
    setStartByName(name: string): this;
    /**
     * Returns an HTML fragment for this story. Normally, you'd use a
     * StoryFormat to bind it as a complete HTML page.
     */
    toHTML(): string;
    /**
     * Returns Twee source code for this story. *Warning:* if the Twee version
     * specified is less than 3, this is a lossy conversion.
     * @param tweeVersion version of Twee to use
     * @param passageSpacer text to output between passages, e.g. one or more newlines
     * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
     */
    toTwee(tweeVersion?: number, passageSpacer?: string): string;
}
