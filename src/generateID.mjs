import assert from 'node:assert';

export default (startAt = 0, max = 2147483647) => {
  assert(typeof max === 'number' && Number.isInteger(max) && max > 1, 'max must be an integer greater than 1');

  let current = startAt || 0;

  if (current >= max) {
    current = 0;
  }

  return () => {
    const _id = current;
    current = (current + 1) % max;
    return _id;
  };
};
