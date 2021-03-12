import {mkdir, clean} from '../../src/utility/file.utility';

describe('File utility function (src/utility/file.utility.ts)', () => {
  it('Should create and remove a new folder', () => {
    mkdir('dist/testtest123');
    clean('dist/testtest123');
  });
});
