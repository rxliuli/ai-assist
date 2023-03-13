import { writeFile } from 'fs/promises'
import path from 'path'
import { it } from 'vitest'
import { Prompt } from '../../components/CompleteInput'
import { initTempPath } from '../../../../utils/test'
import { Users } from './assets/data'

const tempPath = initTempPath(__filename)

it('parse', async () => {
  const r = Users.map(
    (it) =>
      ({
        id: it.title,
        authorId: 'rockbenben',
        fallbackLanguage: 'en-US',
        locale: {
          'en-US': {
            title: it.title,
            detail: it.description,
          },
          'zh-CN': {
            title: it.title,
            detail: it.descn,
          },
        },
      } as Prompt),
  )
  await writeFile(path.resolve(tempPath, 'prompts.json'), JSON.stringify(r, null, 2))
})
