import { prepareFiles } from '../../src/util/drive';

const mockFilteredFiles = require('../mock-data/filteredFiles.json');
const dateFormater = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' });
const dateFormaterWithYear = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

describe('prepareFiles test', () => {

    it('should have added expected date-format and modifiedBy in file objects', () => {
        prepareFiles(mockFilteredFiles, dateFormater, dateFormaterWithYear);
        mockFilteredFiles.map( (file) => {
            expect(file.modified).not.toBeNull();
            expect(file.modifiedBy).not.toBeNull();
        });
        let filteredFile = mockFilteredFiles[0];
        expect(filteredFile.modified).toMatch("Jun 21");
        expect(filteredFile.modifiedBy).toMatch("Jolly, Nitin");
        filteredFile = mockFilteredFiles[9];
        expect(filteredFile.modified).toMatch("Dec 16, 2019");
        expect(filteredFile.modifiedBy).toMatch("unknown");
    });

});