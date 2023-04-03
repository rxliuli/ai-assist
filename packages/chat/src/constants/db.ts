import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { pick, sortBy } from 'lodash-es'
import { once } from '@liuli-util/async'
import { ajaxClient } from './ajax'

export interface Session {
  id: string
  name: string
}

export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export class SessionService {
  async put(session: Session): Promise<void> {
    await ajaxClient.put(`/api/session/${session.id}`, pick(session, 'name'))
  }
  async add(session: Omit<Session, 'id'>): Promise<Session> {
    const r = await ajaxClient.post(`/api/session`, pick(session, 'name'))
    return (await r.json()) as Session
  }
  async list(): Promise<Session[]> {
    const r = await ajaxClient.get('/api/session')
    return await r.json()
  }
  async remove(id: string): Promise<void> {
    await ajaxClient.delete(`/api/session/${id}`)
  }
}

export class MessageService {
  async list(sessionId: string): Promise<Message[]> {
    const r = await ajaxClient.get(`/api/message`, { sessionId })
    return sortBy(
      (await r.json()) as (Message & {
        createdAt?: string
      })[],
      (it) => it.createdAt,
    )
  }
  async remove(id: string): Promise<void> {
    await ajaxClient.delete(`/api/message/${id}`)
  }
  async add(msg: Omit<Message, 'id'>): Promise<Message> {
    const r = await ajaxClient.post(`/api/message`, msg)
    return (await r.json()) as Message
  }
  async batchAdd(msgs: Omit<Message, 'id' | 'sessionId'>[]): Promise<void> {
    await ajaxClient.post(`/api/message/batch`, msgs)
  }
  async put(msg: Message): Promise<void> {
    await ajaxClient.put('/api/message', msg)
  }
}

export interface Prompt {
  id: string
  name: string
  content: string
}

export class PromptService {
  async list() {
    const r = await ajaxClient.get('/api/prompt')
    return (await r.json()) as Prompt[]
  }
  async add(prompt: Pick<Prompt, 'id' | 'name' | 'content'>) {
    return await ajaxClient.post('/api/prompt', prompt)
  }
  async get(id: string): Promise<Prompt> {
    const r = await ajaxClient.get(`/api/prompt/${id}`)
    return await r.json()
  }
  async update(prompt: Prompt) {
    return await ajaxClient.put('/api/prompt', prompt)
  }
  async delete(id: string) {
    await ajaxClient.delete(`/api/prompt/${id}`)
  }
}
