import assert from 'node:assert';

export default (max = 2147483647) => {
  assert(typeof max === 'number' && max > 1);
  const state = {
    current: 1,
  };

  return () => {
    const _id = state.current;
    state.current += 1;
    if (state.current > max) {
      state.current = 1;
    }
    return _id;
  };
};
