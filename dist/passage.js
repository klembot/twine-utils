"use strict";
/**
 * A single passage in a story.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const html_entities_1 = require("html-entities");
class Passage {
    constructor(props = {}) {
        this.attributes = props.attributes || {};
        this.source = props.source || '';
    }
    /**
     *  Loads the contents of an HTML fragment, replacing properties of this
     *  object.
     */
    loadHtml(src) {
        const $ = cheerio_1.default.load(src);
        const $passage = $('tw-passagedata');
        if ($passage.length === 0) {
            console.error('Warning: there are no passages in this HTML ' + 'source code.');
            return this;
        }
        else if ($passage.length > 1) {
            console.error('Warning: there appears to be more than one ' +
                'passage in this HTML source code. Using the first.');
        }
        this.attributes = $passage[0].attribs;
        this.source = $passage.eq(0).text();
        return this;
    }
    /**
     * Outputs the passage as an HTML fragment, optionally setting the passage
     * id (or pid) manually.
     */
    toHtml(pid) {
        const output = cheerio_1.default.load('<tw-passagedata></tw-passagedata>');
        output('tw-passagedata')
            .attr(this.attributes)
            .html(html_entities_1.AllHtmlEntities.encode(this.source));
        if (pid || this.attributes.pid) {
            output('tw-passagedata').attr('pid', pid || this.attributes.pid);
        }
        return output.html();
    }
}
exports.default = Passage;
