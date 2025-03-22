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

  const readChunkSize = () => {
    switch (bitSize) {
    case 1:
      return state.buf.readUint8(0);
    case 2:
      return state.buf.readUint16BE(0);
    case 4:
      return state.buf.readUint32BE(0);
    default:
      throw new Error(`Unsupported bitSize: ${bitSize}`);
    }
  };

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
      state.chunkSize = readChunkSize();
    }
    if (state.size - bitSize < state.chunkSize) {
      return null;
    }
    return {
      size: state.chunkSize,
      payload: state.buf.slice(bitSize, state.chunkSize + bitSize),
      buf: state.buf.slice(state.chunkSize + bitSize),
    };
  };
};
