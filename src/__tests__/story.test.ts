import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import Passage from '../passage';
import Story from '../story';

const readFile = promisify(fs.readFile);

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
		testTwee3 = await readFile(
			path.join(__dirname, 'data/test-twee-v3.txt'),
			{
				encoding: 'utf8'
			}
		);
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

	it('merges stories in HTML format', () => {
		const test = new Story();

		test.mergeHtml(testStoryHtml);

		// Have to do individual comparisons because these are instances of a class.

		expect(test.passages.length).toBe(2);
		expect(test.passages[0].attributes.name).toBe('Untitled Passage');
		expect(test.passages[0].source).toBe(
			'This is some text with "quotes" & other characters.\n\n[[1]]'
		);
		expect(test.passages[1].attributes.name).toBe('1');
		expect(test.passages[1].source).toBe('This is another passage.');
	});

	it('merges Twee source', () => {
		const test = new Story();

		test.mergeTwee(testTwee);

		// Have to do individual comparisons because these are instances of a class.

		expect(test.passages.length).toBe(5);
		expect(test.passages[0].attributes.name).toBe('My First Passage');
		expect(test.passages[0].attributes.tags).toBeUndefined();
		expect(test.passages[0].source).toBe(
			'It was a dark and stormy [[night]].'
		);
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
	});

	it('merges Twee version 3 source', () => {
		const test = new Story();
		const oldWarn = global.console.warn;

		global.console.warn = jest.fn();

		test.mergeTwee(testTwee3, 3);
		expect(test.passages.length).toBe(5);
		expect(test.passages[0].attributes.name).toBe('a name');
		expect(test.passages[0].attributes.position).toBe('10,10');
		expect(test.passages[0].attributes.tags).toEqual(['with', 'tags']);
		expect(test.passages[0].source).toBe(
			'This passage has position metadata.'
		);
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

	it('retains the start passage when loading HTML', () => {
		const test = new Story();

		test.loadHtml(testStoryHtml);
		expect(test.startPassage).not.toBeUndefined();
		expect(test.startPassage.attributes.name).toBe('Untitled Passage');
	});

	it('handles an empty stylesheet properly when loading HTML', () => {
		const test = new Story();

		test.loadHtml(testStoryHtml);
		expect(test.stylesheet).toBe('');
	});

	it('handles an empty JavaScript property properly when loading HTML', () => {
		const test = new Story();

		test.loadHtml(testStoryHtml);
		expect(test.javascript).toBe('');
	});

	it('updates the start passage when merging in HTML', () => {
		const test = new Story();

		test.mergeHtml(testStoryHtml);
		expect(test.startPassage).not.toBeUndefined();
		expect(test.startPassage.attributes.name).toBe('Untitled Passage');
	});

	it('changes the start passage with setStartByName', () => {
		const test = new Story();

		test.mergeHtml(testStoryHtml);
		expect(test.startPassage.attributes.name).toBe('Untitled Passage');
		test.setStartByName('1');
		expect(test.startPassage.attributes.name).toBe('1');
		expect(test.startPassage.source).toBe('This is another passage.');
	});

	it('publishes an HTML fragment', () => {
		const test = new Story();

		test.mergeHtml(testStoryHtml);

		const $ = cheerio.load(test.toHtml());

		expect($('tw-storydata').length).toBe(1);
		expect($('tw-storydata').attr('name')).toBe('Test');
		expect($('tw-passagedata').length).toBe(2);
		expect(
			$('tw-passagedata')
				.eq(0)
				.attr('name')
		).toBe('Untitled Passage');
		expect(
			$('tw-passagedata')
				.eq(0)
				.text()
		).toBe('This is some text with "quotes" & other characters.\n\n[[1]]');
		expect(
			$('tw-passagedata')
				.eq(1)
				.text()
		).toBe('This is another passage.');
	});

	it('publishes an HTML fragment with ordered passage IDs', () => {
		const test = new Story();

		test.passages = [new Passage(), new Passage(), new Passage()];

		const $ = cheerio.load(test.toHtml());

		$('tw-passagedata').each(function(index) {
			expect(parseInt($(this).attr('pid'))).toBe(index + 1);
		});
	});

	it('publishes an HTML fragment with the correct start node index', () => {
		const test = new Story();

		test.passages = [new Passage(), new Passage(), new Passage()];
		test.startPassage = test.passages[1];

		const $ = cheerio.load(test.toHtml());

		expect($('tw-storydata').attr('startnode')).toBe('2');
	});

	it('publishes the stylesheet as a separate element', () => {
		const test = new Story({stylesheet: 'test 1 2 3'});
		const $ = cheerio.load(test.toHtml());

		expect($('#twine-user-stylesheet').length).toBe(1);
		expect($('#twine-user-stylesheet').html()).toBe('test 1 2 3');
	});

	it('publishes JavaScript as a separate element', () => {
		const test = new Story({javascript: 'test 1 2 3 & 4 <>'});
		const $ = cheerio.load(test.toHtml());

		expect($('#twine-user-script').length).toBe(1);
		expect($('#twine-user-script').html()).toBe('test 1 2 3 & 4 <>');
	});

	it('encodes HTML entities in source properly', () => {
		const test = new Story();
		test.passages.push(new Passage({source: '"&<><br>'}));

		expect(test.toHtml()).toBe(
			'<tw-storydata creator="twine-utils" startnode="0"><tw-passagedata pid="1">&quot;&amp;&lt;&gt;&lt;br&gt;</tw-passagedata><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style><script role="script" id="twine-user-script" type="text/twine-javascript"></script></tw-storydata>'
		);
	});
});
