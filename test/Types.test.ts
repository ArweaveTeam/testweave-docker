import {strictEqual} from 'assert';
import {Tag, Transaction} from '../src/types/arweave.types';

describe('Typesystem (src/types)', () => {
  it('Should instantiate the Tag type', () => {
    const tag: Tag = {
      name: 'foo',
      value: 'bar',
    };

    strictEqual(tag.name, 'foo');
    strictEqual(tag.value, 'bar');
  });

  it('Should instantiate the Transaction type', () => {
    const tx: Transaction = {
      format: 1,
      id: 'foo',
      signature: 'bar',
      owner: 'foo',
      target: 'bar',
      data: 'foo',
      reward: 'bar',
      last_tx: 'foo',
      tags: [],
      quantity: 'bar',
      data_size: 1,
      data_root: 'foo',
      data_tree: [],
    };

    strictEqual(tx.format, 1);
    strictEqual(tx.id, 'foo');
    strictEqual(tx.signature, 'bar');
    strictEqual(tx.owner, 'foo');
    strictEqual(tx.target, 'bar');
    strictEqual(tx.data, 'foo');
    strictEqual(tx.reward, 'bar');
    strictEqual(tx.last_tx, 'foo');
    strictEqual(typeof tx.tags, 'object');
    strictEqual(tx.quantity, 'bar');
    strictEqual(tx.data_size, 1);
    strictEqual(tx.data_root, 'foo');
    strictEqual(typeof tx.data_tree, 'object');
  });
});
