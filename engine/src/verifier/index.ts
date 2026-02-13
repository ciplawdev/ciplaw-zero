import { decryptPayload } from '../crypto';
import { evaluatePolicy, defaultPolicy } from './policy';

export type VerifyResult = {
  status: 'approved' | 'rejected';
  checks: Array<{ name: string; passed: boolean; reason?: string }>;
  createdAt: string;
};

export async function verifyRecord(record: {
  id: string;
  ciphertext: string;
  nonce: string;
  wrappedKey: string;
  alg: string;
  meta_json?: any;
}, masterKey: string, policyName?: string): Promise<VerifyResult> {
  // decrypt using engine crypto
  const plaintext = decryptPayload({ ciphertext: record.ciphertext, nonce: record.nonce, wrappedKey: record.wrappedKey, alg: record.alg }, masterKey);
  const policy = defaultPolicy; // in future choose by name
  const evaluation = evaluatePolicy(policy, plaintext);
  const status = evaluation.blocked ? 'rejected' : 'approved';
  return {
    status,
    checks: evaluation.checks,
    createdAt: new Date().toISOString()
  };
}
