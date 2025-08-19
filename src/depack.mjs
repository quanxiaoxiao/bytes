import assert from 'node:assert';
import { Buffer } from 'node:buffer';

const VALID_BIT_SIZES = new Set([1, 2, 4]);

export default (bitSize = 2) => {
  assert(typeof bitSize === 'number', 'bitSize must be a number');
  assert(VALID_BIT_SIZES.has(bitSize), `bitSize must be one of ${Array.from(VALID_BIT_SIZES).join(', ')}`);
  const state = {
    size: 0,
    payload: null,
    chunkSize: -1,
    buf: Buffer.from([]),
  };
  const appendChunk = (chunk) => {
    state.size += chunk.length;
    state.buf = Buffer.concat([state.buf, chunk], state.size);
  };

  const lengthReaders = {
    1: (buf) => buf.readUInt8(0),
    2: (buf) => buf.readUInt16BE(0),
    4: (buf) => buf.readUInt32BE(0),
  };

  const readLength = lengthReaders[bitSize];

  if (readLength == null) {
    throw new Error(`Unsupported bitSize: ${bitSize}`);
  }

  return (chunk) => {
    if (state.chunkSize !== -1 && state.size - bitSize >= state.chunkSize) {
      throw new Error('already depack complete');
    }
    if (chunk.length > 0) {
      appendChunk(chunk);
    }

    if (state.chunkSize === -1 && state.size < bitSize) {
      return null;
    }
    if (state.chunkSize === -1 && state.size >= bitSize) {
      state.chunkSize = readLength(state.buf);
    }
    if (state.size - bitSize < state.chunkSize) {
      return null;
    }
    return {
      payload: state.buf.subarray(bitSize, state.chunkSize + bitSize),
      size: state.chunkSize,
      buf: state.buf.subarray(state.chunkSize + bitSize),
    };
  };
};
