import fs from 'fs';
import {storyDirectorySync} from '../path';

describe('Path', () => {
	it('locates the Stories directory synchronously', () => {
		const path = storyDirectorySync();

		expect(() => fs.accessSync(path)).not.toThrow();
	});
});
