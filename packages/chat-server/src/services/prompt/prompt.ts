import { pick } from 'lodash-es'
import { v4 } from 'uuid'
import { Prompt, PromptModel } from '../../constants/db'

export async function addPrompt(prompt: Pick<Prompt, 'name' | 'content' | 'prefix' | 'userId'>) {
  const r = await PromptModel.create({
    ...prompt,
    id: v4(),
  })
  return r.get()
}

export async function listPromptByUserId(userId: string) {
  return (
    await PromptModel.findAll({
      where: {
        userId,
      },
      attributes: ['id', 'name', 'content', 'prefix'],
    })
  ).map((it) => it.get())
}

export async function deletePrompt(prompt: Pick<Prompt, 'id' | 'userId'>) {
  await PromptModel.destroy({
    where: {
      id: prompt.id,
      userId: prompt.userId,
    },
  })
}

export async function updatePrompt(prompt: Pick<Prompt, 'id' | 'name' | 'content' | 'prefix' | 'userId'>) {
  await PromptModel.update(pick(prompt, 'name', 'content', 'prefix'), {
    where: {
      id: prompt.id,
      userId: prompt.userId,
    },
  })
}

export async function getPromptById(prompt: Pick<Prompt, 'id' | 'userId'>) {
  const r = await PromptModel.findOne({
    where: {
      id: prompt.id,
      userId: prompt.userId,
    },
  })
  return r?.get()
}

export type BatchImportPromptReq = Pick<Prompt, 'content' | 'name' | 'createdAt'>
export async function batchImportPrompt(prompts: BatchImportPromptReq[], userId: string) {
  await PromptModel.bulkCreate(
    prompts.map((it) => ({
      ...it,
      id: v4(),
      userId,
    })),
  )
}
