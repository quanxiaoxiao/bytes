import assert from 'node:assert';

export default (max = 2147483647) => {
  assert(typeof max === 'number' && Number.isInteger(max) && max > 1, 'max must be an integer greater than 1');

  let current = 0;

  return () => {
    current = (current % max) + 1;
    return current;
  };
};
