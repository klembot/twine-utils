import {Story} from './story';

/**
 * A story format, used to publish a Twine story to playable HTML.
 */
export class StoryFormat {
  attributes: Record<string, unknown>;

  constructor(rawSource?: string) {
    this.attributes = {};

    if (rawSource) {
      this.load(rawSource);
    }
  }

  /**
   * Creates the `attributes` property, which contains the parsed version of the
   * format's properties, from a JSONP-formatted string. This also invokes the
   * hydrate property of the format if defined. See
   * https://github.com/klembot/twinejs/blob/develop/EXTENDING.md#hydration
   */
  load(rawSource: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const oldWindow = global.window;

      if (oldWindow?.storyFormat) {
        reject(
          new Error(
            'Asked to load a story format but window.storyFormat is currently defined. Did another format fail to load?'
          )
        );
      }

      const loader = (attributes: Record<string, unknown>) => {
        const hydrateResult = {};

        if (typeof attributes.hydrate === 'string') {
          const hydrateFunc = new Function(attributes.hydrate);

          hydrateFunc.call(hydrateResult);
        }

        this.attributes = {...hydrateResult, ...attributes};
        global.window = oldWindow;
        resolve();
      };

      global.window = {storyFormat: loader};
      new Function(rawSource)();
    });
  }

  /**
   * Returns HTML for a story bound to this format.
   */
  publish(story: Story) {
    if (!this.attributes.source) {
      throw new Error('This story format has no source attribute.');
    }

    if (typeof this.attributes.source !== 'string') {
      throw new Error("This story format's source attribute is not a string.");
    }

    let output = this.attributes.source;

    output = output.replace(/{{STORY_NAME}}/g, story.attributes.name as string);
    output = output.replace(/{{STORY_DATA}}/g, story.toHTML());
    return output;
  }

  /**
   * Returns a JSONP representation of the story format's attributes.
   */
  toJSONP(callbackName = 'storyFormat') {
    const serializable = Object.keys(this.attributes).reduce((result, key) => {
      if (typeof this.attributes[key] === 'function') {
        return {...result, [key]: this.attributes[key].toString()};
      }

      return {...result, [key]: this.attributes[key]};
    }, {});

    return `window.${callbackName}(${JSON.stringify(serializable)})`;
  }
}
