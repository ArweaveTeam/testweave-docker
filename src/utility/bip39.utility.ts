import {createHash} from 'crypto';
import {entropyToMnemonic} from 'bip39';

export function stringToBip39(input: string) {
  const hash = createHash('sha256')
      .update(input)
      .digest('hex');

  return entropyToMnemonic(hash)
      .replace(
          new RegExp(' ', 'g'),
          '.',
      );
}


export function stringToHash(input: string) {
  return createHash('sha256')
      .update(input)
      .digest('hex');
}
