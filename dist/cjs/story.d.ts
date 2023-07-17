import { Passage } from './passage';
/**
 * Options that can be set when creating a Story object.
 */
export interface StoryOptions {
    /**
     * General attributes of the story itself, like name or startnode. These
     * appear on the `<tw-storydata>` element when published.
     */
    attributes?: Record<string, unknown>;
    /**
     * The story's custom JavaScript.
     */
    javascript?: string;
    /**
     * The story's custom stylesheet.
     */
    stylesheet?: string;
    /**
     * Passages in the story.
     */
    passages?: Passage[];
}
/**
 * A Twine story.
 */
export declare class Story {
    /**
     * General attributes of the story itself, like name or startnode. These
     * appear on the `<tw-storydata>` element when published.
     */
    attributes: Record<string, unknown>;
    /**
     * The story's custom JavaScript.
     */
    javascript: string;
    /**
     * The start passage of the story, if one exists. This should always be a
     * member of `passages`.
     */
    startPassage?: Passage;
    /**
     * The story's custom stylesheet.
     */
    stylesheet: string;
    /**
     * Passages in the story.
     */
    passages: Passage[];
    constructor(props?: StoryOptions);
    /**
     * Creates an instance from HTML source.
     * @param source source HTML to use
     * @param silent - If true, doesn't issue any console warnings about potential problems
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
     * @param story Other story to merge with; will not be modified
     */
    mergeStory(story: Story): this;
    /**
     * Merges JavaScript source into this story, adding to any existing.
     * @param source Source JavaScript to add
     */
    mergeJavaScript(source: string): this;
    /**
     * Merges CSS source into this story, adding to any existing.
     * @param source Source CSS to add
     */
    mergeStylesheet(source: string): this;
    /**
     * Sets the start attribute to a named passage. If the passage with this name doesn't exist, this throws an error.
     * @param name Passage name
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
