import test from 'node:test';
import crypto from 'node:crypto';
import assert from 'node:assert';
import convertToBuf from './convertToBuf.mjs';

test('convertToBuf', () => {
  assert.equal(convertToBuf(Buffer.from('123')).toString(), '123');
  assert.equal(convertToBuf('123').toString(), '123');
  assert(Buffer.isBuffer(convertToBuf('123')));
  assert.throws(() => {
    convertToBuf(12);
  });

  const buf = crypto.randomBytes(255);
  assert.equal(buf, convertToBuf(buf));
});
