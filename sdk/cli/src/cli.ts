#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fetch from 'node-fetch';

const argv = yargs(hideBin(process.argv))
  .command('verify', 'Submit payload', (y) => y.option('payload', { type: 'string', demandOption: true }))
  .command('get <id>', 'Get result', () => {}, async (args) => {
    const base = process.env.CIPLAW_BASE_URL || 'http://localhost:4000';
    const res = await fetch(`${base}/v1/verify/${args.id}`);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  })
  .help().argv;

if (argv._[0] === 'verify') {
  (async () => {
    const payload = (argv as any).payload as string;
    const base = process.env.CIPLAW_BASE_URL || 'http://localhost:4000';
    const res = await fetch(`${base}/v1/verify`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ payload }) });
    console.log(await res.json());
  })();
}
