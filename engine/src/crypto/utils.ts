import nacl from 'tweetnacl';
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

export function randomBytes(length: number): Uint8Array {
  return nacl.randomBytes(length);
}

export function toBase64(b: Uint8Array): string {
  return encodeBase64(b);
}

export function fromBase64(s: string): Uint8Array {
  return decodeBase64(s);
}

export function toUtf8(s: string): Uint8Array {
  return decodeUTF8(s);
}

export function fromUtf8(b: Uint8Array): string {
  return encodeUTF8(b);
}
