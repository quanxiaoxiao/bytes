import test from 'node:test';
import assert from 'node:assert';
import generateID from './generateID.mjs';

test('generateID', () => {
  assert.throws(() => {
    generateID(0);
  });
  assert.throws(() => {
    generateID(1);
  });
  const count = 10;
  const _id = generateID(count);
  for (let i = 0; i < 1003; i++) {
    assert.equal(_id(), (i % count) + 1);
  }
});
