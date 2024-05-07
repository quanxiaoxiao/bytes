import test from 'node:test';
import assert from 'node:assert';
import depack from './depack.mjs';

test('depack', () => {
  assert.throws(() => {
    depack(5);
  });
  assert.equal(
    depack(2)(Buffer.concat([
      Buffer.from([0, 5]),
      Buffer.from([1, 2, 3]),
    ])),
    null,
  );
  let decode = depack(2);
  let ret = decode(Buffer.from([0]));
  assert.equal(ret, null);
  ret = decode(Buffer.from([4]));
  assert.equal(ret, null);
  ret = decode(Buffer.from([1, 2, 3]));
  assert.equal(ret, null);
  ret = decode(Buffer.from([4]));
  assert.equal(ret.size, 4);
  assert.equal(ret.payload.toString('hex'), '01020304');
  assert.equal(ret.buf.length, 0);
  decode = depack(1);
  ret = decode(Buffer.from([2]));
  assert.equal(ret, null);
  ret = decode(Buffer.from([1]));
  assert.equal(ret, null);
  ret = decode(Buffer.from([2, 3, 4]));
  assert.equal(ret.payload.toString('hex'), '0102');
  assert.equal(ret.buf.length, 2);
  assert.equal(ret.buf.toString('hex'), '0304');
  assert.throws(() => {
    decode(Buffer.from([2]));
  });
});
