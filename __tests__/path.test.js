const fs = require('fs');
const twinePath = require('../path');

describe('Path', () => {
	it('locates the Stories directory synchronously', () => {
		const path = twinePath.storyDirectorySync();

		expect(() => fs.accessSync(path)).not.toThrow();
	});
});
