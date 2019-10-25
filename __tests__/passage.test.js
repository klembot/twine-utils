const {readFile} = require('fs');
const Passage = require('../passage');

describe('Passage', () => {
	let testPassageHtml;

	beforeAll(done => {
		readFile(
			'./__tests__/data/test-passage.html',
			{encoding: 'utf8'},
			(err, data) => {
				if (err) {
					throw new Error(err);
				}

				testPassageHtml = data;
				done();
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
		expect(test.attributes.tags).toBe('foo');
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
});
