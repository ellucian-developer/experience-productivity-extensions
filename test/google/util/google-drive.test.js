import expect from 'expect';

import {filterFiles} from '../../../src/google/util/google-drive';
import {noDeletedFiles, someDeletedFiles} from './google-drive-data.json';


describe('Google drive tests', () => {
	it('filter Files to 10 undeleted files - none deleted', () => {
		const result = filterFiles(noDeletedFiles);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toEqual(10);

		const [firstFile, secondFile] = result;
		expect(firstFile.name.includes('long name')).toBe(true);
		expect(firstFile.modifiedTime).toBe('2021-06-06T01:45:08.801Z');

		expect(secondFile.lastModifyingUser.emailAddress).toBe('bret.ellucian@gmail.com');
	});

	it('filter Files to 10 undeleted files - some deleted', () => {
		const result = filterFiles(someDeletedFiles);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toEqual(10);

		const [firstFile, secondFile] = result;
		expect(firstFile.name.includes('Terrific Work')).toBe(true);
		expect(firstFile.modifiedTime).toBe('2021-05-24T20:53:32.651Z');

		expect(secondFile.lastModifyingUser.emailAddress).toBe('bret.ellucian@gmail.com');
	});
});
