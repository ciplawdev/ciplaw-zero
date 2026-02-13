import nacl from 'tweetnacl';
import { randomBytes, toBase64, fromBase64, toUtf8, fromUtf8 } from './utils';

type Encrypted = {
  ciphertext: string;
  nonce: string;
  wrappedKey: string;
  alg: string;
};

// Use XSalsa20-Poly1305 via secretbox
export function encryptPayload(plaintext: string, masterKeyBase64: string): Encrypted {
  const dataKey = randomBytes(32);
  const nonce = randomBytes(nacl.secretbox.nonceLength);
  const pt = toUtf8(plaintext);
  const ciphertext = nacl.secretbox(pt, nonce, dataKey);

  // derive wrapping key from master key (masterKey must be 32 bytes base64)
  const masterKey = fromBase64(masterKeyBase64);
  const wrapNonce = randomBytes(nacl.secretbox.nonceLength);
  const wrapped = nacl.secretbox(dataKey, wrapNonce, masterKey);

  return {
    ciphertext: toBase64(ciphertext),
    nonce: toBase64(nonce),
    wrappedKey: toBase64(Buffer.concat([wrapNonce, wrapped])),
    alg: 'xsalsa20-poly1305'
  } as Encrypted;
}

export function decryptPayload(enc: Encrypted, masterKeyBase64: string): string {
  const masterKey = fromBase64(masterKeyBase64);
  const wrappedBuf = fromBase64(enc.wrappedKey);
  const wrapNonce = wrappedBuf.slice(0, nacl.secretbox.nonceLength);
  const wrapped = wrappedBuf.slice(nacl.secretbox.nonceLength);
  const dataKey = nacl.secretbox.open(wrapped, wrapNonce, masterKey);
  if (!dataKey) throw new Error('failed to unwrap key');

  const nonce = fromBase64(enc.nonce);
  const cipher = fromBase64(enc.ciphertext);
  const plain = nacl.secretbox.open(cipher, nonce, dataKey);
  if (!plain) throw new Error('decryption failed');
  return fromUtf8(plain);
}

export function signMessage(message: string, keyBase64: string): string {
  const key = fromBase64(keyBase64);
  const sig = nacl.sign.detached(toUtf8(message), key);
  return toBase64(sig);
}

export function verifyMessage(message: string, sigBase64: string, keyBase64: string): boolean {
  const key = fromBase64(keyBase64);
  const sig = fromBase64(sigBase64);
  return nacl.sign.detached.verify(toUtf8(message), sig, key as Uint8Array);
}
