const fs = require('fs');
const {promisify} = require('util');
const Passage = require('../passage');
const Story = require('../story');
const StoryFormat = require('../story-format');

const readFile = promisify(fs.readFile);

describe('StoryFormat', () => {
	let harloweSrc;
	let testStoryHtml;

	beforeAll(async () => {
		harloweSrc = await readFile('./__tests__/data/harlowe.js', {
			encoding: 'utf8'
		});
		testStoryHtml = await readFile('./__tests__/data/test-story.html', {
			encoding: 'utf8'
		});
	});

	it('creates an empty object when constructed without options', () => {
		const empty = new StoryFormat();

		expect(empty.loaded).toBe(false);
	});

	it('loads a story format from a file', () => {
		const harlowe = new StoryFormat();

		harlowe.load(harloweSrc);
		expect(harlowe.loaded).toBe(true);
		expect(harlowe.attributes.name).toBe('Harlowe');
		expect(typeof harlowe.rawSource).toBe('string');
		expect(typeof harlowe.attributes.source).toBe('string');
	});

	it('publishes stories', () => {
		const harlowe = new StoryFormat();
		const testStory = new Story();

		harlowe.load(harloweSrc);
		testStory.mergeHtml(testStoryHtml);

		const output = harlowe.publish(testStory);

		expect(output.indexOf('{{STORY_NAME}}')).toBe(-1);
		expect(output.indexOf('{{STORY_DATA}}')).toBe(-1);
		expect(output.indexOf('<tw-storydata')).not.toBe(-1);
		expect(output.indexOf('<tw-passagedata')).not.toBe(-1);
	});

	it('properly encodes HTML while publishing', function() {
		const story = new Story();
		const test = new StoryFormat();

		story.passages.push(new Passage({source: '"&<><br>'}));
		test.attributes = {source: '{{STORY_DATA}}'};

		expect(test.publish(story)).toBe(
			'<tw-storydata creator="twine-utils" startnode="0"><tw-passagedata pid="1">&quot;&amp;&lt;&gt;&lt;br&gt;</tw-passagedata><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style><script role="script" id="twine-user-script" type="text/twine-javascript"></script></tw-storydata>'
		);
	});
});
