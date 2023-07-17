import {readFile} from 'fs/promises';
import path from 'path';
import {Passage} from '../passage';
import {Story} from '../story';
import parse from 'node-html-parser';

describe('Story', () => {
  let testTwee: string;
  let testTwee3: string;
  let testStoryHtml: string;

  beforeAll(async () => {
    testStoryHtml = await readFile(
      path.join(__dirname, 'data/test-story.html'),
      {encoding: 'utf8'}
    );
    testTwee = await readFile(path.join(__dirname, 'data/test-twee.txt'), {
      encoding: 'utf8'
    });
    testTwee3 = await readFile(path.join(__dirname, 'data/test-twee-v3.txt'), {
      encoding: 'utf8'
    });
  });

  it('creates an empty object when constructed without options', () => {
    const empty = new Story();

    expect(empty.attributes.creator).toBe('twine-utils');
    expect(typeof empty.passages).toBe('object');
    expect(empty.passages.length).toBe(0);
    expect(empty.stylesheet).toBe('');
    expect(empty.javascript).toBe('');
  });

  it('merges JavaScript', () => {
    const test = new Story({javascript: 'line 1\nline 2'});

    expect(test.javascript).toBe('line 1\nline 2');
    test.mergeJavaScript('line 3\nline 4');
    expect(test.javascript).toBe('line 1\nline 2\nline 3\nline 4');
  });

  it('merges stylesheets', () => {
    const test = new Story({stylesheet: 'line 1\nline 2'});

    expect(test.stylesheet).toBe('line 1\nline 2');
    test.mergeStylesheet('line 3\nline 4');
    expect(test.stylesheet).toBe('line 1\nline 2\nline 3\nline 4');
  });

  it('merges a stylesheet into an empty one', () => {
    const test = new Story();

    test.mergeStylesheet('line 1\nline 2');
    expect(test.stylesheet).toBe('\nline 1\nline 2');
  });

  it('creates stories from HTML', () => {
    const test = Story.fromHTML(testStoryHtml);

    // Have to do individual comparisons because these are instances of a class.

    expect(test.passages.length).toBe(3);
    expect(test.passages[0].attributes.name).toBe('Untitled Passage');
    expect(test.passages[0].source).toBe(
      'This is some text with "quotes" & other characters.\n\n[[1]]'
    );
    expect(test.passages[1].attributes.name).toBe('1');
    expect(test.passages[1].source).toBe('This is another passage.');
    expect(test.passages[2].attributes.name).toBe('HTML');
    expect(test.passages[2].source).toBe(
      'This is a passage <span>with an encoded tag</span>.'
    );
  });

  it('creates stories from Twee source', () => {
    const test = Story.fromTwee(testTwee);

    // Have to do individual comparisons because these are instances of a class.

    expect(test.passages.length).toBe(6);
    expect(test.passages[0].attributes.name).toBe('My First Passage');
    expect(test.passages[0].attributes.tags).toBeUndefined();
    expect(test.passages[0].source).toBe('It was a dark and stormy [[night]].');
    expect(test.passages[1].attributes.name).toBe('night');
    expect(test.passages[1].attributes.tags).toEqual(['red']);
    expect(test.passages[1].source).toBe('Ugh, so :: dark.');
    expect(test.passages[2].attributes.name).toBe('not linked, but tagged');
    expect(test.passages[2].attributes.tags).toEqual([
      'sneaky',
      'and-hyphenated'
    ]);
    expect(test.passages[2].source).toBe("You'd never see this normally.");
    expect(test.passages[3].attributes.name).toBe('a cramped');
    expect(test.passages[3].attributes.tags).toEqual(['passage-with-tag']);
    expect(test.passages[4].attributes.name).toBe('A long passage');
    expect(test.passages[4].attributes.tags).toBeUndefined();
    expect(test.passages[4].source).toBe(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nisl tortor,\nultricies congue semper non, commodo vel dui. Donec sollicitudin turpis id nisi\ndictum fringilla. Integer congue, massa sed aliquet imperdiet, neque dolor\nscelerisque diam, quis congue elit massa a ex. Nunc iaculis lacinia sem id\nconvallis. Nam eget efficitur risus, et ullamcorper libero. Nam nec rhoncus\nurna, eu volutpat tortor. Donec vulputate nunc non ante volutpat sollicitudin.\nPhasellus at lorem in ex fringilla consectetur sed eu tellus. Sed feugiat\nsagittis ante, et tempus ligula aliquam et. Mauris vestibulum magna ac ante\naliquet aliquam. Cras tortor ligula, finibus eu rutrum eget, tristique vitae\nenim. Morbi nunc magna, pharetra nec ipsum sed, mollis fermentum orci.'
    );
    expect(test.passages[5].attributes.name).toBe('A passage with HTML');
    expect(test.passages[5].source).toBe(
      "It's a <span>word</span> in a passage."
    );
  });

  it('creates stories from Twee version 3 source', () => {
    const oldWarn = global.console.warn;

    global.console.warn = jest.fn();

    const test = Story.fromTwee(testTwee3, 3);
    expect(test.passages.length).toBe(5);
    expect(test.passages[0].attributes.name).toBe('a name');
    expect(test.passages[0].attributes.position).toBe('10,10');
    expect(test.passages[0].attributes.tags).toEqual(['with', 'tags']);
    expect(test.passages[0].source).toBe('This passage has position metadata.');
    expect(test.passages[1].attributes.name).toBe('another name');
    expect(test.passages[1].attributes.color).toEqual({
      hue: 'red',
      lightness: 0.5
    });
    expect(test.passages[1].attributes.tags).toBeUndefined();
    expect(test.passages[1].source).toBe(
      "This passage has nested metadata, which isn't part of the spec but should be parsed correctly."
    );
    expect(test.passages[2].attributes.name).toBe('a cramped');
    expect(test.passages[2].attributes.position).toBe('10,10');
    expect(test.passages[2].attributes.tags).toEqual(['tag']);
    expect(test.passages[2].source).toBe('This is allowed.');
    expect(test.passages[3].attributes.name).toBe('\\[a bracketed name\\]');
    expect(test.passages[3].attributes.tags).toEqual(['with-a-tag']);
    expect(test.passages[3].source).toBe('With text.');
    expect(test.passages[4].attributes.name).toBe('a passage');
    expect(test.passages[4].source).toBe('With other text.');
    expect(global.console.warn).toBeCalledTimes(1); // warning about malformed JSON in last passage

    global.console.warn = oldWarn;
  });

  it('creates stories from TWS source', async () => {
    const fileData = await readFile(
      path.join(__dirname, 'data/test-twine1.tws'),
      'binary'
    );
    const buffer = Buffer.from(fileData, 'binary');
    const test = Story.fromTWS(buffer);

    expect(test.attributes.buildDestination).toBe('');
    expect(test.attributes.metadata).toEqual({});
    expect(test.attributes.name).toBe('Untitled Story');
    expect(test.attributes.snapping).toBe(false);
    expect(test.attributes.saveDestination).toBe('/Test.tws');
    expect(test.attributes.target).toBe('sugarcane');
    expect(test.attributes.zoom).toBe(1);
    expect(test.passages.length).toBe(4);
    expect(test.passages[0].attributes.name).toBe('Start');
    expect(test.passages[0].attributes.tags).toEqual([]);
    expect(test.passages[0].source).toEqual(
      'Your story will display this passage first. Edit it by double clicking it.'
    );
    expect(test.passages[0].attributes.created).toEqual({});
    expect(test.passages[0].attributes.modified).toEqual({});
    expect(test.passages[0].attributes.selected).toBe(false);
    expect(test.passages[1].attributes.name).toBe('StoryTitle');
    expect(test.passages[1].attributes.tags).toEqual([]);
    expect(test.passages[1].source).toEqual('Untitled Story');
    expect(test.passages[1].attributes.created).toEqual({});
    expect(test.passages[1].attributes.modified).toEqual({});
    expect(test.passages[1].attributes.selected).toBe(false);
    expect(test.passages[2].attributes.name).toBe('StoryAuthor');
    expect(test.passages[2].attributes.tags).toEqual([]);
    expect(test.passages[2].source).toEqual('Anonymous');
    expect(test.passages[2].attributes.created).toEqual({});
    expect(test.passages[2].attributes.modified).toEqual({});
    expect(test.passages[2].attributes.selected).toBe(false);
    expect(test.passages[3].attributes.name).toBe('Tagged Passage');
    expect(test.passages[3].attributes.tags).toEqual(['tag1', 'tag2']);
    expect(test.passages[3].source).toEqual('This passage has tags.');
    expect(test.passages[3].attributes.created).toEqual({});
    expect(test.passages[3].attributes.modified).toEqual({});
    expect(test.passages[3].attributes.selected).toBe(true);
  });

  it('retains the start passage when loading HTML', () => {
    const test = Story.fromHTML(testStoryHtml);

    expect(test.startPassage).not.toBeUndefined();
    expect(test.startPassage?.attributes.name).toBe('Untitled Passage');
  });

  it('handles an empty stylesheet properly when loading HTML', () => {
    const test = Story.fromHTML(testStoryHtml);

    expect(test.stylesheet).toBe('');
  });

  it('handles an empty JavaScript property properly when loading HTML', () => {
    const test = Story.fromHTML(testStoryHtml);

    expect(test.javascript).toBe('');
  });

  it('updates the start passage when merging in HTML', () => {
    const test = Story.fromHTML(testStoryHtml);

    expect(test.startPassage).not.toBeUndefined();
    expect(test.startPassage?.attributes.name).toBe('Untitled Passage');
  });

  it('changes the start passage with setStartByName', () => {
    const test = Story.fromHTML(testStoryHtml);

    expect(test.startPassage?.attributes.name).toBe('Untitled Passage');
    test.setStartByName('1');
    expect(test.startPassage?.attributes.name).toBe('1');
    expect(test.startPassage?.source).toBe('This is another passage.');
  });

  it('publishes an HTML fragment', () => {
    const test = Story.fromHTML(testStoryHtml);

    const root = parse(test.toHTML());

    expect(root.querySelectorAll('tw-storydata').length).toBe(1);
    expect(root.querySelector('tw-storydata')?.getAttribute('name')).toBe(
      'Test'
    );

    const passageData = root.querySelectorAll('tw-passagedata');

    expect(passageData.length).toBe(3);
    expect(passageData[0].getAttribute('name')).toBe('Untitled Passage');
    expect(passageData[0].innerHTML).toBe(
      'This is some text with &quot;quotes&quot; &amp; other characters.\n\n[[1]]'
    );
    expect(passageData[1].getAttribute('name')).toBe('1');
    expect(passageData[1].innerHTML).toBe('This is another passage.');
    expect(passageData[2].getAttribute('name')).toBe('HTML');
    expect(passageData[2].innerHTML).toBe(
      'This is a passage &lt;span&gt;with an encoded tag&lt;/span&gt;.'
    );
  });

  it('publishes an HTML fragment with ordered passage IDs', () => {
    const test = new Story();

    test.passages = [new Passage(), new Passage(), new Passage()];

    const root = parse(test.toHTML());

    expect.assertions(root.querySelectorAll('tw-passagedata').length);
    root.querySelectorAll('tw-passagedata').forEach((el, index) => {
      expect(parseInt(el.getAttribute('pid') ?? '')).toBe(index + 1);
    });
  });

  it('publishes an HTML fragment with the correct start node index', () => {
    const test = new Story();

    test.passages = [new Passage(), new Passage(), new Passage()];
    test.startPassage = test.passages[1];

    const root = parse(test.toHTML());

    expect(root.querySelector('tw-storydata')?.getAttribute('startnode')).toBe(
      '2'
    );
  });

  it('publishes the stylesheet as a separate element', () => {
    const test = new Story({stylesheet: 'test 1 2 3'});
    const root = parse(test.toHTML());

    expect(root.querySelectorAll('#twine-user-stylesheet').length).toBe(1);
    expect(root.querySelector('#twine-user-stylesheet')?.innerHTML).toBe(
      'test 1 2 3'
    );
  });

  it('publishes JavaScript as a separate element', () => {
    const test = new Story({javascript: 'test 1 2 3 & 4 <>'});
    const root = parse(test.toHTML());

    expect(root.querySelectorAll('#twine-user-script').length).toBe(1);
    expect(root.querySelector('#twine-user-script')?.innerHTML).toBe(
      'test 1 2 3 & 4 <>'
    );
  });

  it('encodes HTML entities in source properly', () => {
    const test = Story.fromHTML(testStoryHtml);

    test.passages = [new Passage({source: '"&<><br>'})];
    expect(test.toHTML()).toBe(
      '<tw-storydata name="Test" startnode="0" creator="Twine" creator-version="2.0.11" ifid="3AE380EE-4B34-4D0D-A8E2-BE624EB271C9" format="SugarCube" options hidden><tw-passagedata pid="1">&quot;&amp;&lt;&gt;&lt;br&gt;</tw-passagedata><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style><script role="script" id="twine-user-script" type="text/twine-javascript"></script></tw-storydata>'
    );
  });

  it('outputs Twee', () => {
    const test = Story.fromHTML(testStoryHtml);

    expect(test.toTwee()).toBe(
      ':: Untitled Passage [foo] {"position":"158,135"}\nThis is some text with "quotes" & other characters.\n\n[[1]]\n\n:: 1 {"position":"247,286"}\nThis is another passage.\n\n:: HTML {"position":"400,400"}\nThis is a passage <span>with an encoded tag</span>.\n\n:: StoryTitle\nTest\n\n:: StoryData\n{\n  "startnode": "1",\n  "creator": "Twine",\n  "creator-version": "2.0.11",\n  "ifid": "3AE380EE-4B34-4D0D-A8E2-BE624EB271C9",\n  "format": "SugarCube",\n  "options": ""\n}'
    );
  });

  it('outputs Twee < version 3', () => {
    const test = Story.fromHTML(testStoryHtml);

    expect(test.toTwee(1)).toBe(
      ':: Untitled Passage [foo]\nThis is some text with "quotes" & other characters.\n\n[[1]]\n\n:: 1\nThis is another passage.\n\n:: HTML\nThis is a passage <span>with an encoded tag</span>.'
    );
  });
});
