import parse from 'node-html-parser';
import {Parser} from 'pickleparser';
import {Passage} from './passage';

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
 * The structure of a parsed TWS (Twine 1 story). Properties are undocumented
 * because their purpose isn't always clear (PRs to clarify this are welcome).
 * This reflects a story created by Twine 1.4.1; earlier versions might have a
 * different structure.
 */
export interface TWSStory {
  buildDestination: string;
  saveDestination: string;
  metadata: Record<string, unknown>;
  target: string;
  storyPanel: {
    scale: number;
    snapping: boolean;
    widgets: TWSPassage[];
  };
}

/**
 * The structure of a passage in a parsed TWS (Twine 1 story). Properties are
 * undocumented because their purpose isn't always clear (PRs to clarify this
 * are welcome).
 */
export interface TWSPassage {
  passage: {
    created: Record<string, unknown>;
    tags: string[];
    text: string;
    title: string;
    modified: Record<string, unknown>;
  };
  pos: number[];
  selected: boolean;
}

/**
 * A Twine story.
 */
export class Story {
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

  constructor(props: StoryOptions = {}) {
    this.attributes = props.attributes ?? {};

    // Set ourselves as the story creator by default.
    this.attributes.creator ??= 'twine-utils';
    this.passages = props.passages ?? [];
    this.javascript = props.javascript ?? '';
    this.stylesheet = props.stylesheet ?? '';
  }

  /**
   * Creates an instance from HTML source.  This converts from Twine 1 attribute
   * names to Twine 2 attribute names where possible. Where a mapping isn't
   * possible, the attributes are set as-is.
   * @param source source HTML to use
   * @param twineVersion Twine version used to created the HTML--must be either
   * `1` or `2`
   * @param silent If true, doesn't issue any console warnings about potential
   * problems
   */
  static fromHTML(source: string, twineVersion = 2, silent = false) {
    const root = parse(source);
    const result = new Story();

    if (twineVersion === 2) {
      const storyEls = root.querySelectorAll('tw-storydata');

      if (storyEls.length === 0) {
        if (!silent) {
          console.warn('There are no stories in this HTML source code.');
        }

        return result;
      } else if (storyEls.length > 1 && !silent) {
        console.warn(
          'There appears to be more than one story in this HTML source code. Using the first.'
        );
      }

      result.attributes = {
        ...storyEls[0].attributes,
        hidden: undefined
      };

      for (const passageEl of storyEls[0].querySelectorAll('tw-passagedata')) {
        const passage = Passage.fromHTML(passageEl.outerHTML, silent);

        result.passages.push(passage);

        if (passage.attributes.pid === result.attributes.startnode) {
          result.startPassage = passage;
        }
      }

      result.stylesheet = storyEls[0]
        .querySelectorAll('style[type="text/twine-css"]')
        .map(el => el.innerHTML)
        .join('\n');

      result.javascript = storyEls[0]
        .querySelectorAll('script[type="text/twine-javascript"]')
        .map(el => el.innerHTML)
        .join('\n');
    } else if (twineVersion === 1) {
      for (const tiddler of root.querySelectorAll('#storeArea div')) {
        if (!tiddler.getAttribute('tiddler')) {
          if (!silent) {
            console.warn(
              'Found a child element of store area that had no tiddler attribute, skipping.'
            );
          }

          continue;
        }

        const passage = new Passage();

        // Mappable attributes.

        passage.attributes.name = tiddler.getAttribute('tiddler');
        passage.attributes.position = tiddler.getAttribute('twine-position');

        if (tiddler.getAttribute('tags') !== '') {
          console.log(tiddler.getAttribute('tags'));
          passage.attributes.tags = tiddler.getAttribute('tags').split(' ');
        } else {
          passage.attributes.tags = [];
        }

        // Unmappable attributes.

        passage.attributes.created = tiddler.getAttribute('created');
        passage.attributes.modifier = tiddler.getAttribute('modifier');

        passage.source = tiddler.innerHTML;

        // The starting passage in TWS stories always had to be named `Start`.

        if (passage.attributes.name === 'Start') {
          result.startPassage = passage;
        }

        // The story name is set by a passage named `StoryTitle`.

        if (passage.attributes.name === 'StoryTitle') {
          result.attributes.name = passage.source;
        }

        result.passages.push(passage);
      }
    } else {
      throw new Error('Twine version must either be 1 or 2.');
    }

    return result;
  }

  /**
   * Creates an instance from Twee source.
   * @param source Twee source
   * @param tweeVersion version of Twee to use
   * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
   */
  static fromTwee(source: string, tweeVersion = 1, silent = false) {
    const result = new Story();

    for (const passageSource of source.split(/^::/m)) {
      if (passageSource.trim() === '') {
        continue;
      }

      const passage = new Passage();

      // The first line will always be the passage title.

      const firstLineMatch = /^.*$/m.exec(passageSource);
      let firstLine: string;

      if (firstLineMatch) {
        firstLine = firstLineMatch[0];
        passage.source = passageSource
          .substring(firstLineMatch[0].length)
          .trim();
      } else {
        passage.source = '';
        firstLine = passageSource;
      }

      // If this is Twee v3, there may be a JSON-encoded set of attributes
      // at the end of the first line.

      if (tweeVersion >= 3) {
        const attributeMatch = /[^\\](\{.*\})\s*$/.exec(firstLine);

        if (attributeMatch) {
          try {
            firstLine = firstLine.substring(0, attributeMatch.index + 1);
            Object.assign(passage.attributes, JSON.parse(attributeMatch[1]));
          } catch (e) {
            if (!silent) {
              console.warn(
                `Could not parse JSON attributes for passage, ignoring: ${attributeMatch[1]}`
              );
            }
          }
        }
      }

      // There may be a list of space-separated tags in square
      // brackets at the end of the first line now.

      const tagListMatch = /[^\\]\[(.*)\]\s*$/.exec(firstLine);

      if (tagListMatch) {
        const tags = tagListMatch[1].split(/\s+/);

        passage.attributes.tags = tags;
        firstLine = firstLine.substring(0, tagListMatch.index + 1);

        // Handle script and stylesheet tagged passages.

        if (tags.indexOf('stylesheet') !== -1) {
          result.mergeStylesheet(passage.source);
        }

        if (tags.indexOf('script') !== -1) {
          result.mergeJavaScript(passage.source);
        }
      }

      passage.attributes.name = firstLine.trim();

      if (passage.attributes.name === '') {
        console.warn('Warning: a passage has no name.');
      }

      if (passage.source === '') {
        console.warn(
          `Warning: the passage "${passage.attributes.name}" has no source text.`
        );
      }

      // There are certain specially-named passages in Twee v3.

      if (tweeVersion >= 3) {
        if (passage.attributes.name === 'StoryTitle') {
          passage.attributes.name = passage.source;
        } else if (passage.attributes.name === 'StoryData') {
          try {
            Object.assign(this, JSON.parse(passage.source));
          } catch (e) {
            console.warn('Could not parse JSON source of StoryData passage.');
          }
        }
      }

      result.passages.push(passage);
    }

    return result;
  }

  /**
   * Creates an instance from TWS (or Twine 1) source. This converts from Twine
   * 1 attribute names to Twine 2 attribute names where possible. Where a
   * mapping isn't possible, the attributes are set as-is.
   */
  static fromTWS(buffer: Uint8Array | Int8Array | Uint8ClampedArray) {
    const parser = new Parser();
    const parsed = parser.parse(buffer) as TWSStory;
    const result = new Story();

    // Mappable top-level attributes.

    result.attributes.zoom = parsed.storyPanel.scale;

    // Unmappable attributes.

    result.attributes.buildDestination = parsed.buildDestination;
    result.attributes.metadata = parsed.metadata;
    result.attributes.saveDestination = parsed.saveDestination;
    result.attributes.snapping = parsed.storyPanel.snapping;
    result.attributes.target = parsed.target;

    for (const widget of parsed.storyPanel.widgets) {
      const passage = new Passage();

      // Mappable attributes.

      passage.attributes.name = widget.passage.title;
      passage.attributes.tags = widget.passage.tags;
      passage.source = widget.passage.text;

      // Unmappable attributes.

      passage.attributes.created = widget.passage.created;
      passage.attributes.modified = widget.passage.modified;
      passage.attributes.selected = widget.selected;

      // The starting passage in TWS stories always had to be named `Start`.

      if (passage.attributes.name === 'Start') {
        result.startPassage = passage;
      }

      // The story name is set by a passage named `StoryTitle`.

      if (passage.attributes.name === 'StoryTitle') {
        result.attributes.name = passage.source;
      }

      result.passages.push(passage);
    }

    return result;
  }

  /**
   * Merges the contents of another story object with this one.
   * @param story Other story to merge with; will not be modified
   */
  mergeStory(story: Story) {
    if (story.passages.length !== 0) {
      this.passages = [...this.passages, ...story.passages];
    }

    if (story.stylesheet !== '') {
      this.mergeStylesheet(story.stylesheet);
    }

    if (story.javascript !== '') {
      this.mergeJavaScript(story.javascript);
    }

    // Fill in any undefined attributes.

    for (const attrib in story.attributes) {
      if (!(attrib in this.attributes)) {
        this.attributes[attrib] = story.attributes[attrib];
      }
    }

    // If we didn't have a start passage before, update it.

    if (this.startPassage === undefined && story.startPassage) {
      this.startPassage = story.startPassage;
    }

    return this;
  }

  /**
   * Merges JavaScript source into this story, adding to any existing.
   * @param source Source JavaScript to add
   */
  mergeJavaScript(source: string) {
    this.javascript += '\n' + source;
    return this;
  }

  /**
   * Merges CSS source into this story, adding to any existing.
   * @param source Source CSS to add
   */
  mergeStylesheet(source: string) {
    this.stylesheet += '\n' + source;
    return this;
  }

  /**
   * Sets the start attribute to a named passage. If the passage with this name doesn't exist, this throws an error.
   * @param name Passage name
   */
  setStartByName(name: string) {
    const target = this.passages.find(
      passage => passage.attributes.name === name
    );

    if (!target) {
      throw new Error("This story has no passage named '" + name + "'.");
    }

    this.startPassage = target;
    return this;
  }

  /**
   * Returns a Twine 2 HTML fragment for this story. Normally, you'd use a
   * StoryFormat to bind it as a complete HTML page.
   */
  toHTML() {
    const root = parse('<div><tw-storydata></tw-storydata></div>');
    const output = root.querySelector('tw-storydata');

    for (const attrib in this.attributes) {
      const value = this.attributes[attrib];

      if (value?.toString) {
        output.setAttribute(attrib, this.attributes[attrib].toString());
      } else {
        output.setAttribute(attrib, '');
      }
    }

    output.setAttribute(
      'startnode',
      (this.passages.indexOf(this.startPassage) + 1).toString()
    );

    output.innerHTML = this.passages.reduce((result, passage, index) => {
      result += passage.toHTML(index + 1);
      return result;
    }, '');

    const script = parse(
      '<div><script role="script" id="twine-user-script" type="text/twine-javascript"></script></div>'
    ).querySelector('script');
    const style = parse(
      '<div><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style></div>'
    ).querySelector('style');

    script.innerHTML = this.javascript;
    style.innerHTML = this.stylesheet;

    output.appendChild(style);
    output.appendChild(script);
    return output.outerHTML;
  }

  /**
   * Returns Twee source code for this story. *Warning:* if the Twee version
   * specified is less than 3, this is a lossy conversion.
   * @param tweeVersion version of Twee to use
   * @param passageSpacer text to output between passages, e.g. one or more newlines
   * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
   */
  toTwee(tweeVersion = 3, passageSpacer = '\n\n') {
    let output = this.passages.reduce((result, current) => {
      return result + current.toTwee(tweeVersion) + passageSpacer;
    }, '');

    if (tweeVersion >= 3) {
      output += `:: StoryTitle\n${this.attributes.name}` + passageSpacer;
      output += `:: StoryData\n${JSON.stringify(
        {
          ...this.attributes,
          name: undefined
        },
        null,
        2
      )}`;
    }

    return output.trim();
  }
}
