import ByteBuffer from 'bytebuffer';

export const toBuffer = <T>(data: T): ByteBuffer => {
  const jsonSer = JSON.stringify(data);
  const jsonBytes = Buffer.from(jsonSer, 'utf8');
  const buffer = new ByteBuffer(jsonBytes.length + 2, true);
  // TODO: serialize data using msgpack instead of just putting json in it
  buffer.writeVarint32(jsonBytes.length);
  buffer.append(jsonBytes, 'hex');
  return buffer;
};

export const toBytes = <T>(data: T): Uint8Array => {
  const buffer = toBuffer(data);
  buffer.flip();
  const bytes = Uint8Array.from(buffer.toBuffer());
  return bytes;
};

export const fromBuffer = <T>(buffer: ByteBuffer): T => {
  const length = buffer.readVarint32();
  const jsonSer = buffer.readString(length);
  const data = JSON.parse(jsonSer) as unknown as T;
  return data;
};