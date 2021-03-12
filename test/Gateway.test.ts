import {strictEqual} from 'assert';
import {app, start} from '../src/Gateway';

describe('Server Application Tests (src/Gateway.ts)', () => {
  it('Return the correct types', () => {
    strictEqual(typeof app, 'function');
    strictEqual(typeof start, 'function');
  });
});
