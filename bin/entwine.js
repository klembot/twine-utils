#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var Story = require('../story');
var StoryFormat = require('../story-format');
var argv = require('yargs')
	.usage('Usage: $0 <files to combine> [options]')
	.alias('n', 'name')
	.describe('name', 'Name to set on the generated file')
	.alias('f', 'format')
	.describe('format', 'Path to a Twine 2 story format to use')
	.alias('s', 'start')
	.describe('start', 'Name of the passage to set as start')
	.demand('format', 'A story format must be specified')
	.demand(1)
	.help()
	.argv;

var format = new StoryFormat(fs.readFileSync(argv.format, { encoding: 'utf8' }));
var story = new Story();

argv._.forEach(function(srcFile) {
	var src = fs.readFileSync(srcFile, { encoding: 'utf8' });

	switch (path.extname(srcFile)) {
		case 'css':
			story.mergeStylesheet(src);
			break;

		case 'htm':
		case 'html':
			story.mergeHtml(src);
			break;

		case 'js':
			story.mergeJavascript(src);
			break;

		case 'txt':
		case 'twee':
		case 'tw':
			story.mergeTwee(src);
			break;

		default:
			console.error(
				"Don't know how to merge a file with extension " + path.extname(src)
			);
	}
});

if (argv.name) {
	story.attributes.name = argv.name;
}

if (argv.start) {
	story.setStartByName(argv.start);
}

console.log(format.publish(story));
