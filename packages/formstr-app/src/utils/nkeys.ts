// nkeys.ts
import { bech32 } from "bech32";

// --- UTF-8 helpers ---
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

//---------------------------------------------
// TLV ENCODE
//---------------------------------------------
function encodeTLV(fields: Record<number, Uint8Array[]>): Uint8Array {
  const parts: Uint8Array[] = [];

  for (const [typeStr, values] of Object.entries(fields)) {
    const t = Number(typeStr);
    for (const v of values) {
      const header = new Uint8Array([t, v.length]);
      parts.push(header);
      parts.push(v);
    }
  }

  return concatBytes(parts);
}

//---------------------------------------------
// TLV DECODE
//---------------------------------------------
function decodeTLV(data: Uint8Array): Record<number, Uint8Array[]> {
  const result: Record<number, Uint8Array[]> = {};
  let i = 0;

  while (i < data.length) {
    const t = data[i];
    const len = data[i + 1];
    const value = data.slice(i + 2, i + 2 + len);

    if (!result[t]) result[t] = [];
    result[t].push(value);

    i += 2 + len;
  }

  return result;
}

//---------------------------------------------
// bech32 helpers
//---------------------------------------------
function encodeBech32(prefix: string, data: Uint8Array): string {
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words, 2048); // same as naddr
}

function decodeBech32(str: string): Uint8Array {
  const { words } = bech32.decode(str, 2048);
  return new Uint8Array(bech32.fromWords(words));
}

// Utility: concat Uint8Arrays
function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const length = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

// =================================================================
// PUBLIC: ENCODE MULTIPLE KEYS INTO "nkeys1...."
// =================================================================
export function encodeNKeys(obj: Record<string, string>): string {
  const fields: Record<number, Uint8Array[]> = { 0: [], 1: [] };

  for (const [k, v] of Object.entries(obj)) {
    fields[0].push(utf8Encoder.encode(k));
    fields[1].push(utf8Encoder.encode(v));
  }

  const data = encodeTLV(fields);
  return encodeBech32("nkeys", data);
}

// =================================================================
// PUBLIC: DECODE "nkeys1..." BACK INTO { key: value }
// =================================================================
export function decodeNKeys(str: string): Record<string, string> {
  const data = decodeBech32(str);
  const tlv = decodeTLV(data);

  const result: Record<string, string> = {};

  const keys = tlv[0] || [];
  const values = tlv[1] || [];

  keys.forEach((keyBytes, idx) => {
    const k = utf8Decoder.decode(keyBytes);
    const vBytes = values[idx];
    const v = vBytes ? utf8Decoder.decode(vBytes) : "";
    result[k] = v;
  });

  return result;
}
