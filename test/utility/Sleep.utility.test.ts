import {sleep} from '../../src/utility/sleep.utility';

describe('Sleep utility function (src/utility/sleep.utility.ts)', () => {
  it('Should sleep for 250ms', async () => {
    await sleep(250);
  });
});
