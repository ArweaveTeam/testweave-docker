import {strictEqual} from 'assert';
import {ansDeps, ansBundles} from '../../src/utility/ans.utility';

describe('Arweave Bundles (src/utility/ans.utility.ts)', () => {
  it('Should have the correct types', () => {
    strictEqual(typeof ansDeps, 'object');
    strictEqual(typeof ansBundles, 'object');
  });
});
