"use strict";
/**
 * Represents a Twine story.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Story = void 0;
const node_html_parser_1 = __importDefault(require("node-html-parser"));
const passage_1 = require("./passage");
/**
 * A Twine story.
 */
class Story {
    constructor(props = {}) {
        var _a, _b, _c, _d, _e;
        var _f;
        this.attributes = (_a = props.attributes) !== null && _a !== void 0 ? _a : {};
        // Set ourselves as the story creator by default.
        (_b = (_f = this.attributes).creator) !== null && _b !== void 0 ? _b : (_f.creator = 'twine-utils');
        this.passages = (_c = props.passages) !== null && _c !== void 0 ? _c : [];
        this.javascript = (_d = props.javascript) !== null && _d !== void 0 ? _d : '';
        this.stylesheet = (_e = props.stylesheet) !== null && _e !== void 0 ? _e : '';
    }
    /**
     * Creates an instance from HTML source.
     * @param source source HTML to use
     * @param silent - If true, doesn't issue any console warnings about potential problems
     */
    static fromHTML(source, silent = false) {
        const root = (0, node_html_parser_1.default)(source);
        const storyEls = root.querySelectorAll('tw-storydata');
        const result = new Story();
        if (storyEls.length === 0) {
            if (!silent) {
                console.warn('There are no stories in this HTML source code.');
            }
            return result;
        }
        else if (storyEls.length > 1 && !silent) {
            console.warn('There appears to be more than one story in this HTML source code. Using the first.');
        }
        result.attributes = Object.assign(Object.assign({}, storyEls[0].attributes), { hidden: undefined });
        for (const passageEl of storyEls[0].querySelectorAll('tw-passagedata')) {
            const passage = passage_1.Passage.fromHTML(passageEl.outerHTML, silent);
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
        return result;
    }
    /**
     * Creates an instance from Twee source.
     * @param source Twee source
     * @param tweeVersion version of Twee to use
     * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
     */
    static fromTwee(source, tweeVersion = 1, silent = false) {
        const result = new Story();
        for (const passageSource of source.split(/^::/m)) {
            if (passageSource.trim() === '') {
                continue;
            }
            const passage = new passage_1.Passage();
            // The first line will always be the passage title.
            const firstLineMatch = /^.*$/m.exec(passageSource);
            let firstLine;
            if (firstLineMatch) {
                firstLine = firstLineMatch[0];
                passage.source = passageSource
                    .substring(firstLineMatch[0].length)
                    .trim();
            }
            else {
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
                    }
                    catch (e) {
                        if (!silent) {
                            console.warn(`Could not parse JSON attributes for passage, ignoring: ${attributeMatch[1]}`);
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
                console.warn(`Warning: the passage "${passage.attributes.name}" has no source text.`);
            }
            // There are certain specially-named passages in Twee v3.
            if (tweeVersion >= 3) {
                if (passage.attributes.name === 'StoryTitle') {
                    passage.attributes.name = passage.source;
                }
                else if (passage.attributes.name === 'StoryData') {
                    try {
                        Object.assign(this, JSON.parse(passage.source));
                    }
                    catch (e) {
                        console.warn('Could not parse JSON source of StoryData passage.');
                    }
                }
            }
            result.passages.push(passage);
        }
        return result;
    }
    /**
     * Merges the contents of another story object with this one.
     * @param story Other story to merge with; will not be modified
     */
    mergeStory(story) {
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
    mergeJavaScript(source) {
        this.javascript += '\n' + source;
        return this;
    }
    /**
     * Merges CSS source into this story, adding to any existing.
     * @param source Source CSS to add
     */
    mergeStylesheet(source) {
        this.stylesheet += '\n' + source;
        return this;
    }
    /**
     * Sets the start attribute to a named passage. If the passage with this name doesn't exist, this throws an error.
     * @param name Passage name
     */
    setStartByName(name) {
        const target = this.passages.find(passage => passage.attributes.name === name);
        if (!target) {
            throw new Error("This story has no passage named '" + name + "'.");
        }
        this.startPassage = target;
        return this;
    }
    /**
     * Returns an HTML fragment for this story. Normally, you'd use a
     * StoryFormat to bind it as a complete HTML page.
     */
    toHTML() {
        const root = (0, node_html_parser_1.default)('<div><tw-storydata></tw-storydata></div>');
        const output = root.querySelector('tw-storydata');
        for (const attrib in this.attributes) {
            const value = this.attributes[attrib];
            if (value === null || value === void 0 ? void 0 : value.toString) {
                output.setAttribute(attrib, this.attributes[attrib].toString());
            }
            else {
                output.setAttribute(attrib, '');
            }
        }
        output.setAttribute('startnode', (this.passages.indexOf(this.startPassage) + 1).toString());
        output.innerHTML = this.passages.reduce((result, passage, index) => {
            result += passage.toHTML(index + 1);
            return result;
        }, '');
        const script = (0, node_html_parser_1.default)('<div><script role="script" id="twine-user-script" type="text/twine-javascript"></script></div>').querySelector('script');
        const style = (0, node_html_parser_1.default)('<div><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style></div>').querySelector('style');
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
            output += `:: StoryData\n${JSON.stringify(Object.assign(Object.assign({}, this.attributes), { name: undefined }), null, 2)}`;
        }
        return output.trim();
    }
}
exports.Story = Story;
