import dotenv from 'dotenv';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import { setTimeout } from 'timers/promises';

dotenv.config();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const prisma = new PrismaClient();

async function poll() {
  while (true) {
    try {
      const recent = await prisma.audit_events.findMany({ orderBy: { created_at: 'desc' }, take: 10 });
      for (const e of recent) {
        logger.info({ event: e.type, data: e.data_json }, 'audit');
      }

      // simple anomaly rule: burst of same type
      const counts: Record<string, number> = {};
      for (const e of recent) counts[e.type] = (counts[e.type] || 0) + 1;
      for (const k of Object.keys(counts)) {
        if (counts[k] >= 5) logger.warn({ type: k, count: counts[k] }, 'anomaly: burst');
      }
    } catch (err) {
      logger.error({ err }, 'sentinel error');
    }
    await setTimeout(5000);
  }
}

poll().catch((e) => {
  logger.error(e);
  process.exit(1);
});
