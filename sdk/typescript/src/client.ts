import fetch from 'node-fetch';

export type VerifyResponse = { id: string; status: string };
export type VerifyResult = { id: string; status: string; createdAt: string; meta?: any; result?: any };

export class CiplawClient {
  constructor(private baseUrl: string) {}

  async verify(payload: string, policy?: string, meta?: any): Promise<VerifyResponse> {
    const res = await fetch(`${this.baseUrl}/v1/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload, policy, meta })
    });
    return res.json() as Promise<VerifyResponse>;
  }

  async get(id: string): Promise<VerifyResult> {
    const res = await fetch(`${this.baseUrl}/v1/verify/${id}`);
    return res.json() as Promise<VerifyResult>;
  }
}
