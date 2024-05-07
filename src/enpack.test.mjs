import test from 'node:test';
import crypto from 'node:crypto';
import assert from 'node:assert';
import enpack from './enpack.mjs';

test('enpack', () => {
  assert.throws(() => {
    enpack(Buffer.from('123'), 5);
  });
  assert.throws(() => {
    enpack(Buffer.from('123'), 3);
  });
  assert.throws(() => {
    enpack(111);
  });
  assert.throws(() => {
    const buf1 = crypto.randomBytes(2147483647);
    const buf2 = crypto.randomBytes(99);
    enpack(Buffer.concat([buf1, buf2]), 4);
  });
  assert.throws(() => {
    enpack(crypto.randomBytes(256), 1);
  });
  assert.throws(() => {
    enpack(crypto.randomBytes(65536), 2);
  });
  assert(enpack(Buffer.from([2, 3, 4]), 1).equals(Buffer.from([3, 2, 3, 4])));
  assert(enpack(Buffer.from([2, 3, 4]), 2).equals(Buffer.from([0, 3, 2, 3, 4])));
  assert(enpack(Buffer.from([2, 3, 4]), 4).equals(Buffer.from([0, 0, 0, 3, 2, 3, 4])));
});

test('enpack2', () => {
  const buf = crypto.randomBytes(255);
  let chunk = enpack(buf, 1);
  assert(chunk.equals(Buffer.concat([Buffer.from('ff', 'hex'), buf])));
  chunk = enpack(buf, 2);
  assert(chunk.equals(Buffer.concat([Buffer.from('00ff', 'hex'), buf])));
  chunk = enpack(buf, 4);
  assert(chunk.equals(Buffer.concat([Buffer.from('000000ff', 'hex'), buf])));
});
