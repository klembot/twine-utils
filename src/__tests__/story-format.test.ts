import {readFile} from 'fs/promises';
import path from 'path';
import {Passage} from '../passage';
import {Story} from '../story';
import {StoryFormat} from '../story-format';

describe('StoryFormat', () => {
  let harloweSrc: string;
  let testStoryHtml: string;

  beforeAll(async () => {
    harloweSrc = await readFile(path.join(__dirname, 'data/harlowe.js'), {
      encoding: 'utf8'
    });
    testStoryHtml = await readFile(
      path.join(__dirname, 'data/test-story.html'),
      {
        encoding: 'utf8'
      }
    );
  });

  it('creates an empty object when constructed without options', () => {
    const empty = new StoryFormat();

    expect(empty.attributes).toEqual({});
  });

  it('loads a story format from JSONP source', async () => {
    const harlowe = new StoryFormat();

    await harlowe.load(harloweSrc);
    expect(harlowe.attributes.name).toBe('Harlowe');
    expect(typeof harlowe.attributes.source).toBe('string');
  });

  it('hydrates attributes', async () => {
    const format = new StoryFormat();

    await format.load(
      'window.storyFormat({"hydrate":"this.test = \'passed\'"})'
    );
    expect(format.attributes.test).toBe('passed');
  });

  it('publishes stories', () => {
    const harlowe = new StoryFormat();
    const testStory = Story.fromHTML(testStoryHtml);

    harlowe.load(harloweSrc);

    const output = harlowe.publish(testStory);

    expect(output.indexOf('{{STORY_NAME}}')).toBe(-1);
    expect(output.indexOf('{{STORY_DATA}}')).toBe(-1);
    expect(output.indexOf('<tw-storydata')).not.toBe(-1);
    expect(output.indexOf('<tw-passagedata')).not.toBe(-1);
  });

  it('properly encodes HTML while publishing', () => {
    const story = new Story();
    const test = new StoryFormat();

    story.passages.push(new Passage({source: '"&<><br>'}));
    test.attributes = {source: '{{STORY_DATA}}'};

    expect(test.publish(story)).toBe(
      '<tw-storydata creator="twine-utils" startnode="0"><tw-passagedata pid="1">&quot;&amp;&lt;&gt;&lt;br&gt;</tw-passagedata><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style><script role="script" id="twine-user-script" type="text/twine-javascript"></script></tw-storydata>'
    );
  });

  describe('toJSONP()', () => {
    it('returns a JSONP representation of attributes', () => {
      const format = new StoryFormat();

      format.attributes.author = 'test-author';
      format.attributes.name = 'test-name';
      expect(format.toJSONP()).toBe(
        'window.storyFormat({"author":"test-author","name":"test-name"})'
      );
    });

    it('defines functions in the hydrate property', () => {
      const format = new StoryFormat();

      format.attributes.test = () => '"test passed"';
      format.attributes.test2 = () => "'test passed'";

      const jsonp = format.toJSONP();

      expect(jsonp).toBe(
        'window.storyFormat({"hydrate":"this.test=() => \'\\"test passed\\"\';this.test2=() => \\"\'test passed\'\\";"})'
      );

      const roundtrip = new StoryFormat(jsonp);

      expect((roundtrip.attributes.test as () => string)()).toBe(
        '"test passed"'
      );
      expect((roundtrip.attributes.test2 as () => string)()).toBe(
        "'test passed'"
      );
    });

    it('handles nested functions properly', () => {
      const format = new StoryFormat();

      format.attributes = {
        nested: {
          second: {
            test: () => 'test passed',
            test2: () => '"test passed"'
          }
        }
      };

      const jsonp = format.toJSONP();

      expect(jsonp).toBe(
        'window.storyFormat({"hydrate":"this.nested={second:{test:() => \'test passed\',test2:() => \'\\"test passed\\"\'}};"})'
      );

      const roundtrip = new StoryFormat(jsonp);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      expect((roundtrip.attributes as any).nested.second.test()).toBe(
        'test passed'
      );
      expect((roundtrip.attributes as any).nested.second.test2()).toBe(
        '"test passed"'
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });

    it('handles arrays of functions properly', () => {
      const format = new StoryFormat();

      format.attributes = {
        array: [() => 'test passed', () => '"test passed"']
      };

      const jsonp = format.toJSONP();

      expect(jsonp).toBe(
        'window.storyFormat({"hydrate":"this.array=[() => \'test passed\',() => \'\\"test passed\\"\'];"})'
      );

      const roundtrip = new StoryFormat(jsonp);

      expect(Array.isArray(roundtrip.attributes.array)).toBe(true);
      /* eslint-disable @typescript-eslint/no-explicit-any */
      expect((roundtrip.attributes as any).array[0]()).toBe('test passed');
      expect((roundtrip.attributes as any).array[1]()).toBe('"test passed"');
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });

    it("throws an error if an attribute needs to be hydrated, but there's a pre-existing hydrate property", () => {
      const format = new StoryFormat();

      format.attributes = {
        hydrate: true,
        test: () => {}
      };

      expect(() => format.toJSONP()).toThrow();
    });
  });
});
