/**
 * Represents a Twine story.
 */
import Passage from './passage';
interface StoryOptions {
    attributes?: {
        [key: string]: any;
    };
    javascript?: string;
    stylesheet?: string;
    passages?: Passage[];
}
export default class Story {
    attributes: {
        [key: string]: any;
    };
    javascript: string;
    startPassage: Passage;
    stylesheet: string;
    passages: Passage[];
    constructor(props?: StoryOptions);
    /**
     * Loads the contents of an HTML file, replacing properties of this story.
     */
    loadHtml(source: string): this;
    /**
     * Merges the contents of another story object with this one.
     */
    mergeStory(story: Story): this;
    /**
     * A convenience method that merges the contents of a story in HTML form.
     */
    mergeHtml(source: string): this;
    /**
     * Merges JavaScript source in with this story.
     */
    mergeJavaScript(source: string): this;
    /**
     * Merges CSS source in with this story.
     */
    mergeStylesheet(source: string): this;
    /**
     * Merges Twee source in with this story.
     */
    mergeTwee(source: string): void;
    /**
     * Sets the start attribute to a named passage.
     */
    setStartByName(name: string): void;
    /**
     * Returns an HTML fragment for this story. Normally, you'd use a
     * StoryFormat to bind it as a complete HTML page.
     */
    toHtml(): any;
}
export {};
