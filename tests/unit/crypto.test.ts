import { describe, it, expect } from 'vitest';
import { encryptPayload, decryptPayload } from '../../engine/src/crypto/index';

const master = Buffer.from(Array.from({ length: 32 }, (_, i) => i)).toString('base64');

describe('crypto encrypt/decrypt', () => {
  it('roundtrips plaintext', () => {
    const enc = encryptPayload('hello secret', master);
    const pt = decryptPayload(enc, master);
    expect(pt).toBe('hello secret');
  });
});
