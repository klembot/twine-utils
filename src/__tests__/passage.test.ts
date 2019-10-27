import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import Passage from '../passage';

const readFile = promisify(fs.readFile);

describe('Passage', () => {
	let testPassageHtml;

	beforeAll(async () => {
		testPassageHtml = await readFile(
			path.join(__dirname, 'data/test-passage.html'),
			{
				encoding: 'utf8'
			}
		);
	});

	it('creates an empty object when constructed without options', () => {
		const empty = new Passage();

		expect(Object.keys(empty.attributes).length).toBe(0);
		expect(empty.source).toBe('');
	});

	it('loads contents from HTML', () => {
		const test = new Passage();

		test.loadHtml(testPassageHtml);
		expect(test.source.length > 0).toBe(true);
		expect(test.attributes.name).toBe('Untitled Passage');
		expect(test.attributes.tags).toEqual(['foo']);
	});

	it('publishes an HTML fragment', () => {
		const test = new Passage();

		test.loadHtml(testPassageHtml);
		expect(test.toHtml().trim()).toBe(testPassageHtml.trim());
	});

	it('encodes HTML entities in attributes', () => {
		const test = new Passage();

		test.attributes.encoded = '"&<><br>';
		expect(test.toHtml()).toBe(
			'<tw-passagedata encoded="&quot;&amp;&lt;&gt;&lt;br&gt;"></tw-passagedata>'
		);
	});

	it('encodes HTML entities in source', () => {
		const test = new Passage();
		test.source = '"&<><br>';

		expect(test.toHtml()).toBe(
			'<tw-passagedata>&quot;&amp;&lt;&gt;&lt;br&gt;</tw-passagedata>'
		);
	});

	it('publishes Twee source code', () => {
		const test = new Passage();

		test.loadHtml(testPassageHtml);
		expect(test.toTwee()).toBe(
			':: Untitled Passage [foo] {"position":"158,135"}\nThis is some text.\n\n[[1]]'
		);
	});

	it('publishes Twee source code without attributes when version < 3', () => {
		const test = new Passage();

		test.loadHtml(testPassageHtml);
		expect(test.toTwee(1)).toBe(
			':: Untitled Passage [foo]\nThis is some text.\n\n[[1]]'
		);
	});
});
