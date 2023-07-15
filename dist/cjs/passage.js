"use strict";
/**
 * A single passage in a story. This does not have a loadTwee() method because
 * loading Twee may have story-wide effects.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const html_entities_1 = require("html-entities");
const node_html_parser_1 = __importDefault(require("node-html-parser"));
/**
 * A single passage in a story. This does not have a fromTwee() method because
 * loading Twee may have story-wide effects.
 */
class Passage {
    constructor(props = {}) {
        var _a, _b;
        this.attributes = (_a = props.attributes) !== null && _a !== void 0 ? _a : {};
        this.source = (_b = props.source) !== null && _b !== void 0 ? _b : '';
    }
    /**
     * Creates an instance from an HTML fragment.
     */
    static fromHTML(source, silent = false) {
        const root = (0, node_html_parser_1.default)(source);
        const passageEls = root.querySelectorAll('tw-passagedata');
        const result = new Passage();
        if (passageEls.length === 0) {
            if (!silent) {
                console.warn('Warning: there are no passages in this HTML source code.');
                return result;
            }
        }
        else if (passageEls.length > 1 && !silent) {
            console.warn('Warning: there appears to be more than one passage in this HTML source code. Using the first.');
        }
        result.attributes = Object.assign({}, passageEls[0].attributes);
        if (typeof result.attributes.tags === 'string') {
            result.attributes.tags = result.attributes.tags
                .split(' ')
                .filter(s => s.trim() !== '');
        }
        result.source = (0, html_entities_1.decode)(passageEls[0].innerHTML);
        return result;
    }
    /**
     * Returns an HTML fragment for this passage, optionally setting the passage
     * id (or pid) manually.
     */
    toHTML(pid) {
        const root = (0, node_html_parser_1.default)('<div><tw-passagedata></tw-passagedata></div>');
        const output = root.querySelector('tw-passagedata');
        for (const attrib in this.attributes) {
            output.setAttribute(attrib, (0, html_entities_1.encode)(this.attributes[attrib].toString()));
        }
        output.innerHTML = (0, html_entities_1.encode)(this.source);
        if (pid || typeof this.attributes.pid === 'string') {
            output.setAttribute('pid', pid ? pid.toString() : this.attributes.pid);
        }
        return output.outerHTML;
    }
    /**
     * Returns Twee source code for this story. *Warning:* if the Twee version
     * specified is less than 3, this is a lossy conversion.
     * @see https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
     */
    toTwee(tweeVersion = 3) {
        let output = `:: ${this.attributes.name}`;
        if (Array.isArray(this.attributes.tags) &&
            this.attributes.tags.length > 0) {
            output += ` [${this.attributes.tags.join(' ')}]`;
        }
        if (tweeVersion >= 3) {
            const extraAttributes = JSON.stringify(Object.assign(Object.assign({}, this.attributes), { name: undefined, pid: undefined, tags: undefined }));
            if (extraAttributes !== '{}') {
                output += ` ${extraAttributes}`;
            }
        }
        return output + `\n${this.source}`;
    }
}
exports.default = Passage;
