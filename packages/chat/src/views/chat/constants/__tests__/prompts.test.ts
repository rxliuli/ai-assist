import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { it } from 'vitest'
import { Prompt } from '../../components/CompleteInput'
import { initTempPath } from '../../../../utils/test'
import { Users } from './assets/data'
import Papa from 'papaparse'

const tempPath = initTempPath(__filename)

// ref: https://github.com/rockbenben/ChatGPT-Shortcut
it('convert', async () => {
  const format = (s: string) => {
    return s.replaceAll('］', ']')
  }
  const r = Users.map(
    (it) =>
      ({
        id: it.title,
        title: format(it.title),
        detail: format(it.descn),
      } as Prompt),
  )
  await writeFile(path.resolve(tempPath, 'prompts.json'), JSON.stringify(r, null, 2))
})

// ref: https://github.com/f/awesome-chatgpt-prompts
it('parse', async () => {
  const s = await readFile(path.resolve(__dirname, './assets/prompts.csv'), 'utf-8')
  const r = (
    Papa.parse(s, {
      header: true,
    }).data as { act: string; prompt: string }[]
  )
    .slice(1)
    .map(
      (it) =>
        ({
          id: it.act,
          title: it.act,
          detail: it.prompt,
        } as Prompt),
    )
  await writeFile(path.resolve(tempPath, 'prompts.json'), JSON.stringify(r, null, 2))
})
