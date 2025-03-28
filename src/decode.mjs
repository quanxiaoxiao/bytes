import assert from 'node:assert';
import { Buffer } from 'node:buffer';

export default (procedures) => {
  assert(Array.isArray(procedures) && procedures.length > 0);

  const state = {
    index: 0,
    offset: 0,
    size: 0,
    buf: Buffer.alloc(0),
    payload: {},
  };

  return (chunk) => {
    assert(Buffer.isBuffer(chunk));
    if (state.index === procedures.length) {
      throw new Error('parse already complete');
    }

    if (chunk.length > 0) {
      state.size += chunk.length;
      state.buf = Buffer.concat([state.buf, chunk], state.size);
    }

    while (state.size > 0
      && state.index < procedures.length
      && state.size >= state.offset
    ) {
      const handler = procedures[state.index];

      if (typeof handler === 'function') {
        const [offset, skip] = handler(
          state.buf.subarray(state.offset),
          state.payload,
          state.buf,
        ) || [];
        if (offset == null) {
          break;
        }
        assert(Number.isInteger(offset) && offset >= 0);
        state.offset += offset;
        if (skip == null || skip === 0) {
          state.index ++;
        } else {
          assert(Number.isInteger(skip));
          state.index = skip > 0 ? skip : state.index + skip;
        }
        assert(state.index <= procedures.length && state.index >= 0);
      } else {
        assert(handler && typeof handler.fn === 'function');
        const sizeRead = typeof handler.size === 'function'
          ? handler.size(state.payload, state.offset, state.buf)
          : handler.size;
        assert(Number.isInteger(sizeRead) && sizeRead > 0);
        const sizeRemained = state.size - state.offset;
        assert(sizeRemained >= 0);
        if (sizeRemained === 0 || sizeRemained < sizeRead) {
          break;
        }
        handler.fn(
          state.buf.subarray(state.offset, state.offset + sizeRead),
          state.payload,
          state.buf,
        );
        state.offset += sizeRead;
        state.index += 1;
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
};
