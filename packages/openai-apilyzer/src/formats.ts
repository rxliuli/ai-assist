import dayjs from 'dayjs'
import { Usage } from './download'
import { stringify } from 'csv-stringify'

export function formatJson(usage: Usage[]): string {
  return JSON.stringify(usage, null, 2)
}

export async function formatCSV(usage: Usage[]): Promise<string> {
  const r = usage
    .flatMap((it) => it.data)
    .map((it) => [
      dayjs(it.aggregation_timestamp * 1000).toISOString(),
      it.n_requests,
      it.operation,
      it.snapshot_id,
      it.n_context,
      it.n_context_tokens_total,
      it.n_generated,
      it.n_generated_tokens_total,
    ])
  r.unshift([
    'aggregation_timestamp',
    'n_requests',
    'operation',
    'snapshot_id',
    'n_context',
    'n_context_tokens_total',
    'n_generated',
    'n_generated_tokens_total',
  ])
  return await new Promise((resolve, reject) => stringify(r, (err, output) => (err ? reject(err) : resolve(output))))
}

export const formats = {
  json: formatJson,
  csv: formatCSV,
}
