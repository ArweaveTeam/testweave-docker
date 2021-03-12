import {strictEqual} from 'assert';
import {stringToBip39, stringToHash} from '../../src/utility/bip39.utility';

describe('Arweave Bundles (src/utility/ans.utility.ts)', () => {
  it('Should convert a string to BIP39 encoding', () => {
    const testString = 'foo';
    const result = stringToBip39(testString);

    strictEqual(result, 'club.cup.bracket.spin.wise.elevator.toy.hamster.despair.trumpet.aware.habit.crouch.birth.screen.motor.sausage.amazing.glad.rug.mail.cricket.pact.suggest');
  });

  it('Should convert a string to SHA256 encoding', () => {
    const testString = 'foo';
    const result = stringToHash(testString);

    strictEqual(result, '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');
  });
});
