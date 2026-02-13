import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import pino from 'pino';
import dotenv from 'dotenv';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import prisma from './plugins/db';
import * as crypto from '../../engine/src/crypto/index';
import { verifyRecord } from '../../engine/src/verifier/index';

dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const PORT = Number(process.env.PORT || 4000);
const MASTER_KEY = process.env.CIPLAW_MASTER_KEY;
if (!MASTER_KEY) throw new Error('CIPLAW_MASTER_KEY not set');

const server = Fastify({ logger });
await server.register(helmet);

server.get('/healthz', async () => ({ status: 'ok' }));

const VerifyBody = z.object({ payload: z.string().min(1), policy: z.string().optional(), meta: z.record(z.any()).optional() });

server.post('/v1/verify', async (req, reply) => {
  const parsed = VerifyBody.safeParse(req.body);
  if (!parsed.success) return reply.status(400).send({ error: parsed.error.errors });
  const id = uuidv4();
  const requestId = uuidv4();
  const { payload, policy, meta } = parsed.data;

  // envelope encrypt
  const enc = crypto.encryptPayload(payload, MASTER_KEY);

  const record = await prisma.verification_records.create({
    data: {
      id,
      status: 'pending',
      ciphertext: enc.ciphertext,
      nonce: enc.nonce,
      wrapped_key: enc.wrappedKey,
      alg: enc.alg,
      meta_json: meta ?? {}
    }
  });

  // audit
  await prisma.audit_events.create({ data: { type: 'create_verification', data_json: { id, requestId } } });

  // run verifier synchronously for MVP
  const result = await verifyRecord(record, MASTER_KEY, policy);
  await prisma.verification_records.update({ where: { id }, data: { status: result.status, result_json: result } });
  await prisma.audit_events.create({ data: { type: 'verification_result', data_json: { id, result } } });

  return { id, status: result.status };
});

server.get('/v1/verify/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const rec = await prisma.verification_records.findUnique({ where: { id } });
  if (!rec) return reply.status(404).send({ error: 'not found' });
  return { id: rec.id, status: rec.status, createdAt: rec.created_at, meta: rec.meta_json, result: rec.result_json };
});

server.listen({ port: PORT, host: '0.0.0.0' }).then(() => logger.info(`gateway listening ${PORT}`));
