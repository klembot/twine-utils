/**
 * A single passage in a story. This does not have a loadTwee() method because
 * loading Twee may have story-wide effects.
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
   * Returns an HTML fragment for this passage, optionally setting the passage
   * id (or pid) manually.
   */
  toHTML(pid?: number): string;
  /**
   * Returns Twee source code for this story. *Warning:* if the Twee version
   * specified is less than 3, this is a lossy conversion.
   * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
   */
  toTwee(tweeVersion?: number): string;
}
export {};
