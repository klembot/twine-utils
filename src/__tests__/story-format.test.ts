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

  it('loads a story format from a file', async () => {
    const harlowe = new StoryFormat();

    await harlowe.load(harloweSrc);
    expect(harlowe.attributes.name).toBe('Harlowe');
    expect(typeof harlowe.attributes.source).toBe('string');
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

    it('transforms function attributes to strings', () => {
      const format = new StoryFormat();

      format.attributes.test = () => console.log('hello world');
      expect(format.toJSONP()).toBe(
        'window.storyFormat({"test":"() => console.log(\'hello world\')"})'
      );
    });
  });
});
