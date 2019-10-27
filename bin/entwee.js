#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {Story} = require('../dist');
const argv = require('yargs')
	.usage('Usage: $0 <files to combine> [options]')
	.alias('n', 'name')
	.describe('name', 'Name to set on the generated file')
	.alias('o', 'sort')
	.describe('sort', 'Sort passages by name')
	.alias('s', 'start')
	.describe('start', 'Name of the passage to set as start')
	.describe('twee-version', 'Version of Twee spec to use')
	.default('twee-version', 3)
	.demand(1)
	.help().argv;

const story = new Story();

argv._.forEach(srcFile => {
	const src = fs.readFileSync(srcFile, {encoding: 'utf8'});

	switch (path.extname(srcFile)) {
		case '.css':
			story.mergeStylesheet(src);
			break;

		case '.htm':
		case '.html':
			story.mergeHtml(src);
			break;

		case '.js':
			story.mergeJavaScript(src);
			break;

		case '.txt':
		case '.twee':
		case '.tw':
			story.mergeTwee(src);
			break;

		default:
			console.error(
				"Don't know how to merge a file with extension " +
					path.extname(srcFile)
			);
	}
});

if (argv.name) {
	story.attributes.name = argv.name;
}

if (argv.sort) {
	story.passages.sort((a, b) => {
		if (a.attributes.name < b.attributes.name) {
			return -1;
		}

		if (b.attributes.name < a.attributes.name) {
			return 1;
		}

		return 0;
	});
}

if (argv.start) {
	story.setStartByName(argv.start);
}

console.log(story.toTwee(argv.tweeVersion));
