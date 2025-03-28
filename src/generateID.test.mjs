import assert from 'node:assert';
import test from 'node:test';

import generateID from './generateID.mjs';

test('generateID', () => {
  assert.throws(() => {
    generateID(0, 0);
  });
  assert.throws(() => {
    generateID(0, 1);
  });
  const count = 10;
  const _id = generateID(0, count);
  for (let i = 0; i < 1003; i++) {
    assert.equal(_id(), (i % count));
  }

  assert.equal(generateID(5)(), 5);
  assert.equal(generateID(9)(), 9);
  assert.equal(generateID(9, 5)(), 0);
});
