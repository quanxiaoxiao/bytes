import assert from 'node:assert';
import { Buffer } from 'node:buffer';

export default (procedures) => {
  assert(Array.isArray(procedures) && procedures.length > 0, 'procedures must be a non-empty array');

  const state = {
    index: 0,
    offset: 0,
    size: 0,
    buf: Buffer.alloc(0),
    payload: {},
  };

  const parseChunk = (chunk) => {
    assert(Buffer.isBuffer(chunk), 'chunk must be a Buffer');

    if (state.index >= procedures.length) {
      throw new Error('Parser already completed - cannot process more data');
    }

    const canProcessNextStep = () => {
      return state.size > 0
      && state.index < procedures.length
      && state.size >= state.offset;
    };

    const processFunctionHandler = (handler) => {
      const [offset, skip] = handler(
        state.buf.subarray(state.offset),
        state.payload,
        state.buf,
      ) || [];
      if (offset == null) {
        return false;
      }
      assert(Number.isInteger(offset) && offset >= 0, 'offset must be a non-negative integer');
      state.offset += offset;
      if (skip == null || skip === 0) {
        state.index ++;
      } else {
        assert(state.index >= 0 && state.index <= procedures.length, 'procedure index out of bounds');
        state.index = skip > 0 ? skip : state.index + skip;
      }
      assert(state.index <= procedures.length && state.index >= 0);
      return true;
    };

    const processObjectHandler = (handler) => {
      assert(handler && typeof handler.fn === 'function', 'handler must have a function property "fn"');
      const sizeRead = typeof handler.size === 'function'
        ? handler.size(state.payload, state.offset, state.buf)
        : handler.size;
      assert(Number.isInteger(sizeRead) && sizeRead > 0, 'size must be a positive integer');
      const sizeRemained = state.size - state.offset;
      assert(sizeRemained >= 0);
      if (sizeRemained === 0 || sizeRemained < sizeRead) {
        return false;
      }
      handler.fn(
        state.buf.subarray(state.offset, state.offset + sizeRead),
        state.payload,
        state.buf,
      );
      state.offset += sizeRead;
      state.index += 1;
      return true;
    };

    if (chunk.length > 0) {
      state.buf = Buffer.concat([state.buf, chunk]);
      state.size = state.buf.length;
    }

    while (canProcessNextStep()) {
      const handler = procedures[state.index];

      if (typeof handler === 'function') {
        if (!processFunctionHandler(handler)) {
          break;
        }
      } else if (!processObjectHandler(handler)) {
        break;
      }
    }

    if (state.index !== procedures.length) {
      return null;
    }

    return {
      payload: state.payload,
      size: state.offset,
      buf: state.buf.subarray(state.offset),
    };
  };
  return parseChunk;
};
