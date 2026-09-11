import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";

export function file(name, contents, mode = 0o644) {
  return {
    bytes: Buffer.from(contents),
    linkName: "",
    mode,
    name,
    type: "0",
  };
}

export function tarball(entries, gzipOptions = {}) {
  const blocks = [];
  for (const entry of entries) {
    const header = Buffer.alloc(512);
    writeString(header, 0, 100, entry.name);
    writeOctal(header, 100, 8, entry.mode);
    writeOctal(header, 108, 8, 0);
    writeOctal(header, 116, 8, 0);
    writeOctal(header, 124, 12, entry.bytes.length);
    writeOctal(header, 136, 12, 0);
    header.fill(0x20, 148, 156);
    writeString(header, 156, 1, entry.type);
    writeString(header, 157, 100, entry.linkName);
    writeString(header, 257, 6, "ustar");
    writeString(header, 263, 2, "00");
    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    writeChecksum(header, checksum);
    blocks.push(header, entry.bytes);
    const padding = entry.bytes.length % 512;
    if (padding !== 0) {
      blocks.push(Buffer.alloc(512 - padding));
    }
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks), gzipOptions);
}

function writeChecksum(header, value) {
  const encoded = value.toString(8).padStart(6, "0");
  header.write(encoded, 148, 6, "ascii");
  header[154] = 0;
  header[155] = 0x20;
}

function writeOctal(header, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 1, "0");
  assert.equal(encoded.length, length - 1);
  header.write(encoded, offset, length - 1, "ascii");
  header[offset + length - 1] = 0;
}

function writeString(header, offset, length, value) {
  const bytes = Buffer.from(value, "utf8");
  assert(bytes.length <= length);
  bytes.copy(header, offset);
}
