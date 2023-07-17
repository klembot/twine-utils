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
    function isSerializable(value: unknown): boolean {
      if (Array.isArray(value)) {
        return value.every(isSerializable);
      }

      if (typeof value === 'object') {
        return Object.values(value).every(isSerializable);
      }

      return ['boolean', 'number', 'string'].includes(typeof value);
    }

    function dehydrate(value: unknown): string {
      if (Array.isArray(value)) {
        return `[${value.map(dehydrate)}]`;
      }

      if (typeof value === 'object') {
        let result = '{';

        for (const key in value) {
          result += `${key}:${dehydrate(value[key])}`;
        }

        return result + '}';
      }

      return value.toString();
    }

    const serialized: Record<string, unknown> = {};
    const hydrated = {};

    for (const key in this.attributes) {
      if (isSerializable(this.attributes[key])) {
        serialized[key] = this.attributes[key];
      } else {
        hydrated[key] = this.attributes[key];
      }
    }

    if (Object.keys(hydrated).length > 0) {
      if ('hydrate' in serialized) {
        throw new Error(
          'A hydrate property is needed for this story format, but hydrate is already defined in its attributes.'
        );
      }

      let hydratedString = '';

      for (const key in hydrated) {
        hydratedString += `this.${key}=${dehydrate(hydrated[key])};`;
      }

      serialized.hydrate = hydratedString;
    }

    return `window.${callbackName}(${JSON.stringify(serialized)})`;
  }
}
