import assert from 'node:assert';

export default (startAt = 0, max = Number.MAX_SAFE_INTEGER) => {
  assert(
    typeof max === 'number' && Number.isInteger(max) && max > 1,
    `max must be an integer greater than 1, got ${max}`,
  );

  assert(
    typeof startAt === 'number' && Number.isInteger(startAt) && startAt >= 0,
    `startAt must be a non-negative integer, got ${startAt}`,
  );

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
