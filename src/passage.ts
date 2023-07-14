import {decode, encode} from 'html-entities';
import parse from 'node-html-parser';

interface PassageOptions {
	attributes?: {[key: string]: any};
	source?: string;
}

export default class Passage {
  attributes: Record<string, unknown>;
  source: string;

  constructor(props: PassageOptions = {}) {
    this.attributes = props.attributes ?? {};
    this.source = props.source ?? '';
  }

  /**
   * Creates an instance from an HTML fragment.
   */
  static fromHTML(source: string, silent = false) {
    const root = parse(source);

    const passageEls = root.querySelectorAll('tw-passagedata');
    const result = new Passage();

    if (passageEls.length === 0) {
      if (!silent) {
        console.warn(
          'Warning: there are no passages in this HTML source code.'
        );
        return result;
      }
    } else if (passageEls.length > 1 && !silent) {
      console.warn(
        'Warning: there appears to be more than one passage in this HTML source code. Using the first.'
      );
    }

    result.attributes = {...passageEls[0].attributes};

    if (typeof result.attributes.tags === 'string') {
      result.attributes.tags = result.attributes.tags
        .split(' ')
        .filter(s => s.trim() !== '');
    }

    result.source = decode(passageEls[0].innerHTML);
    return result;
  }

  /**
   * Returns an HTML fragment for this passage, optionally setting the passage
   * id (or pid) manually.
   */
  toHTML(pid?: number) {
    const root = parse('<div><tw-passagedata></tw-passagedata></div>');
    const output = root.querySelector('tw-passagedata');

    for (const attrib in this.attributes) {
      output.setAttribute(attrib, encode(this.attributes[attrib].toString()));
    }

    output.innerHTML = encode(this.source);

    if (pid || typeof this.attributes.pid === 'string') {
      output.setAttribute(
        'pid',
        pid ? pid.toString() : (this.attributes.pid as string)
      );
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

    if (
      Array.isArray(this.attributes.tags) &&
      this.attributes.tags.length > 0
    ) {
      output += ` [${this.attributes.tags.join(' ')}]`;
    }

    if (tweeVersion >= 3) {
      const extraAttributes = JSON.stringify({
        ...this.attributes,
        name: undefined,
        pid: undefined,
        tags: undefined
      });

      if (extraAttributes !== '{}') {
        output += ` ${extraAttributes}`;
      }
    }

    return output + `\n${this.source}`;
  }
}
