import { Buffer } from 'node:buffer';

import convertToBuf from './convertToBuf.mjs';

const MAX_BIT_SIZE = 4;
const MAX_CHUNK_SIZE = 2147483647;
const BIT_SIZE_LIMITS = {
  1: 255,
  2: 65535,
  4: MAX_CHUNK_SIZE,
};

export default (b, bitSize = 2) => {
  if (bitSize > MAX_BIT_SIZE || !BIT_SIZE_LIMITS[bitSize]) {
    throw new Error(`\`${bitSize}\` is invalid or exceeds max size ${MAX_BIT_SIZE}`);
  }
  const chunk = convertToBuf(b);
  const chunkLength = chunk.length;
  if (chunkLength > BIT_SIZE_LIMITS[bitSize]) {
    throw new Error(`content size exceeds ${BIT_SIZE_LIMITS[bitSize]}`);
  }
  const sizeBuf = Buffer.allocUnsafe(bitSize);
  const writeMethod = {
    1: 'writeUInt8',
    2: 'writeUInt16BE',
    4: 'writeUInt32BE',
  }[bitSize];

  if (!writeMethod) {
    throw new Error(`\`${bitSize}\` unable to handle`);
  }

  sizeBuf[writeMethod](chunkLength);

  return Buffer.concat([sizeBuf, chunk], bitSize + chunkLength);
};
