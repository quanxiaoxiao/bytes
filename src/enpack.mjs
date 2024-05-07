import { Buffer } from 'node:buffer';
import convertToBuf from './convertToBuf.mjs';

export default (b, bitSize = 2) => {
  if (bitSize > 4) {
    throw new Error(`\`${bitSize}\` exceed max size 4`);
  }
  const chunk = convertToBuf(b);
  const chunkLength = chunk.length;
  if (chunkLength > 2147483647) {
    throw new Error('content size exceed 2147483647');
  }
  const sizeBuf = Buffer.allocUnsafe(bitSize);
  switch (bitSize) {
    case 1: {
      if (chunkLength > 255) {
        throw new Error('content size exceed 255');
      }
      sizeBuf.writeUInt8(chunkLength);
      break;
    }
    case 2: {
      if (chunkLength > 65535) {
        throw new Error('content size exceed 65535');
      }
      sizeBuf.writeUInt16BE(chunkLength);
      break;
    }
    case 4: {
      sizeBuf.writeUInt32BE(chunkLength);
      break;
    }
    default: {
      throw new Error(`\`${bitSize}\` unable handle`);
    }
  }
  return Buffer.concat([
    sizeBuf,
    chunk,
  ], bitSize + chunkLength);
};
