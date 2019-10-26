/**
 * A single passage in a story.
 */
interface PassageOptions {
    attributes?: {
        [key: string]: any;
    };
    source?: string;
}
export default class Passage {
    attributes: {
        [key: string]: any;
    };
    source: string;
    constructor(props?: PassageOptions);
    /**
     *  Loads the contents of an HTML fragment, replacing properties of this
     *  object.
     */
    loadHtml(src: string): this;
    /**
     * Outputs the passage as an HTML fragment, optionally setting the passage
     * id (or pid) manually.
     */
    toHtml(pid?: number): any;
}
export {};
