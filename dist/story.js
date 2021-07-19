"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const passage_1 = __importDefault(require("./passage"));
/**
 * A Twine story.
 */
class Story {
    constructor(props = {}) {
        var _a, _b, _c, _d;
        this.attributes = (_a = props.attributes) !== null && _a !== void 0 ? _a : {};
        // Set ourselves as the story creator by default.
        if (this.attributes.creator === undefined) {
            this.attributes.creator = 'twine-utils';
        }
        this.passages = (_b = props.passages) !== null && _b !== void 0 ? _b : [];
        this.javascript = (_c = props.javascript) !== null && _c !== void 0 ? _c : '';
        this.stylesheet = (_d = props.stylesheet) !== null && _d !== void 0 ? _d : '';
    }
    /**
     * Loads the contents of an HTML file, replacing properties of this story.
     */
    loadHtml(source) {
        const $ = cheerio_1.default.load(source);
        const $story = $('tw-storydata');
        if ($story.length === 0) {
            console.warn('Warning: there are no stories in this HTML source code.');
            return this;
        }
        else if ($story.length > 1) {
            console.warn('Warning: there appears to be more than one story in this HTML source code. Using the first.');
        }
        this.attributes = Object.assign(Object.assign({}, $story[0].attribs), { hidden: undefined });
        this.passages = [];
        $story.find('tw-passagedata').each((index, el) => {
            const passage = new passage_1.default().loadHtml(cheerio_1.default.html(el));
            this.passages.push(passage);
            if (passage.attributes.pid === this.attributes.startnode) {
                this.startPassage = passage;
            }
        });
        this.stylesheet = $story.find('style[type="text/twine-css"]').html();
        this.javascript = $story
            .find('script[type="text/twine-javascript"]')
            .html();
        return this;
    }
    /**
     * Merges the contents of another story object with this one.
     */
    mergeStory(story) {
        if (story.passages.length !== 0) {
            this.passages = this.passages.concat(story.passages);
        }
        if (story.stylesheet !== '') {
            this.mergeStylesheet(story.stylesheet);
        }
        if (story.javascript !== '') {
            this.mergeJavaScript(story.javascript);
        }
        // Fill in any undefined attributes.
        Object.keys(story.attributes).forEach(attrib => {
            if (this.attributes[attrib] === undefined) {
                this.attributes[attrib] = story.attributes[attrib];
            }
        });
        // If we didn't have a start passage before, update it.
        if (this.startPassage === undefined && story.startPassage) {
            this.startPassage = story.startPassage;
        }
        return this;
    }
    /**
     * A convenience method that merges the contents of a story in HTML form.
     */
    mergeHtml(source) {
        return this.mergeStory(new Story().loadHtml(source));
    }
    /**
     * Merges JavaScript source in with this story.
     */
    mergeJavaScript(source) {
        this.javascript += '\n' + source;
        return this;
    }
    /**
     * Merges CSS source in with this story.
     */
    mergeStylesheet(source) {
        this.stylesheet += '\n' + source;
        return this;
    }
    /**
     * Merges Twee source in with this story.
     * @param source Twee source
     * @param tweeVersion version of Twee to use
     * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
     */
    mergeTwee(source, tweeVersion = 1) {
        source.split(/^::/m).forEach(src => {
            if (src.trim() === '') {
                return;
            }
            const result = new passage_1.default();
            // The first line will always be the passage title.
            const firstLineMatch = /^.*$/m.exec(src);
            let firstLine;
            if (firstLineMatch) {
                firstLine = firstLineMatch[0];
                result.source = src.substr(firstLineMatch[0].length).trim();
            }
            else {
                result.source = '';
                firstLine = src;
            }
            // If this is Twee v3, there may be a JSON-encoded set of attributes
            // at the end of the first line.
            if (tweeVersion >= 3) {
                const attributeMatch = /[^\\](\{.*\})\s*$/.exec(firstLine);
                if (attributeMatch) {
                    try {
                        firstLine = firstLine.substr(0, attributeMatch.index + 1);
                        Object.assign(result.attributes, JSON.parse(attributeMatch[1]));
                    }
                    catch (e) {
                        console.warn(`Could not parse JSON attributes for passage, ignoring: ${attributeMatch[1]}`);
                    }
                }
            }
            // There may be a list of space-separated tags in square
            // brackets at the end of the first line now.
            const tagListMatch = /[^\\]\[(.*)\]\s*$/.exec(firstLine);
            if (tagListMatch) {
                result.attributes.tags = tagListMatch[1].split(/\s+/);
                firstLine = firstLine.substr(0, tagListMatch.index + 1);
                // Handle script and stylesheet tagged passages.
                if (result.attributes.tags.indexOf('stylesheet') !== -1) {
                    this.mergeStylesheet(result.source);
                }
                if (result.attributes.tags.indexOf('script') !== -1) {
                    this.mergeJavaScript(result.source);
                }
            }
            result.attributes.name = firstLine.trim();
            if (result.attributes.name === '') {
                console.warn('Warning: a passage has no name.');
            }
            if (result.source === '') {
                console.warn(`Warning: the passage "${result.attributes.name}" has no source text.`);
            }
            // There are certain specially-named passages in Twee v3.
            if (tweeVersion >= 3) {
                if (result.attributes.name === 'StoryTitle') {
                    this.attributes.name = result.source;
                }
                else if (result.attributes.name === 'StoryData') {
                    try {
                        Object.assign(this, JSON.parse(result.source));
                    }
                    catch (e) {
                        console.warn('Could not parse JSON source of StoryData passage.');
                    }
                }
            }
            this.passages.push(result);
        });
    }
    /**
     * Sets the start attribute to a named passage.
     */
    setStartByName(name) {
        const target = this.passages.find(passage => passage.attributes.name === name);
        if (!target) {
            throw new Error("This story has no passage named '" + name + "'.");
        }
        this.startPassage = target;
    }
    /**
     * Returns an HTML fragment for this story. Normally, you'd use a
     * StoryFormat to bind it as a complete HTML page.
     */
    toHtml() {
        const output = cheerio_1.default.load('<tw-storydata></tw-storydata>');
        output('tw-storydata')
            .attr(this.attributes)
            .attr('startnode', (this.passages.indexOf(this.startPassage) + 1).toString())
            .html(this.passages.reduce((result, passage, index) => {
            result += passage.toHtml(index + 1);
            return result;
        }, ''))
            .append('<style role="stylesheet" id="twine-user-stylesheet" ' +
            'type="text/twine-css"></style><script role="script" ' +
            'id="twine-user-script" type="text/twine-javascript">' +
            '</script>');
        output('#twine-user-script').text(this.javascript);
        output('#twine-user-stylesheet').text(this.stylesheet);
        return output.html();
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
exports.default = Story;
