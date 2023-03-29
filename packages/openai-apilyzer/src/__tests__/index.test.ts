import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { it, expect } from 'vitest'
import { formatCSV } from '../download'

it.skip('formatCSV', async () => {
  const s = JSON.parse(await readFile(path.resolve(__dirname, '.temp/usage.json'), 'utf-8'))
  const r = await formatCSV(s)
  await writeFile(path.resolve(__dirname, '.temp/usage.csv'), r)
})
