import assert from 'node:assert';
import crypto from 'node:crypto';
import test, { mock } from 'node:test';

import convertToBuf from './convertToBuf.mjs';
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

test('enpack3', async (t) => {
  const convertToBufMock = mock.fn(convertToBuf);

  await t.test('should handle bitSize = 1 correctly', () => {
    const mockData = Buffer.from([0x01, 0x02, 0x03]);
    convertToBufMock.mock.mockImplementation(() => mockData);

    const result = enpack(mockData, 1);
    assert.deepStrictEqual(result, Buffer.concat([Buffer.from([0x03]), mockData]));
  });

  await t.test('should handle bitSize = 2 correctly', () => {
    const mockData = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    convertToBufMock.mock.mockImplementation(() => mockData);

    const result = enpack(mockData, 2);
    assert.deepStrictEqual(result, Buffer.concat([Buffer.from([0x00, 0x04]), mockData]));
  });

  await t.test('should handle bitSize = 4 correctly', () => {
    const mockData = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
    convertToBufMock.mock.mockImplementation(() => mockData);

    const result = enpack(mockData, 4);
    assert.deepStrictEqual(result, Buffer.concat([Buffer.from([0x00, 0x00, 0x00, 0x05]), mockData]));
  });

  await t.test('should throw an error if bitSize is invalid', () => {
    const mockData = Buffer.from([0x01]);
    convertToBufMock.mock.mockImplementation(() => mockData);

    assert.throws(() => enpack(mockData, 3), {
      message: '`3` is invalid or exceeds max size 4',
    });
  });

  await t.test('should throw an error if chunk size exceeds limit for bitSize = 1', () => {
    const mockData = Buffer.alloc(256);
    convertToBufMock.mock.mockImplementation(() => mockData);

    assert.throws(() => enpack(mockData, 1), {
      message: 'content size exceeds 255',
    });
  });

  await t.test('should throw an error if chunk size exceeds limit for bitSize = 2', () => {
    const mockData = Buffer.alloc(65536);
    convertToBufMock.mock.mockImplementation(() => mockData);

    assert.throws(() => enpack(mockData, 2), {
      message: 'content size exceeds 65535',
    });
  });

  await t.test('should throw an error if chunk size exceeds limit for bitSize = 4', () => {
    const mockData = Buffer.alloc(2147483648);
    convertToBufMock.mock.mockImplementation(() => mockData);

    assert.throws(() => enpack(mockData, 4), {
      message: 'content size exceeds 2147483647',
    });
  });

  await t.test('should throw an error if bitSize is not supported', () => {
    const mockData = Buffer.from([0x01]);
    convertToBufMock.mock.mockImplementation(() => mockData);

    assert.throws(() => enpack(mockData, 5), {
      message: '`5` is invalid or exceeds max size 4',
    });
  });
});
