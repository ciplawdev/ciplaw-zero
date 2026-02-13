export type Policy = {
  name: string;
  blockIfContains?: string[];
};

export const defaultPolicy: Policy = {
  name: 'default',
  blockIfContains: ['block', 'malicious']
};

export function evaluatePolicy(policy: Policy, plaintext: string) {
  const checks: Array<{ name: string; passed: boolean; reason?: string }> = [];
  let blocked = false;
  if (policy.blockIfContains) {
    for (const token of policy.blockIfContains) {
      const passed = plaintext.includes(token) === false;
      checks.push({ name: `no-${token}`, passed });
      if (!passed) blocked = true;
    }
  }
  return { blocked, checks };
}
