import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { sortBy } from 'lodash-es'
import { once } from '@liuli-util/async'
import { Lang } from './langs'

export interface Session {
  id: string
  name: string
  date: string
  systemContent?: string
}

export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  date: string
}

export interface AllDBSchema extends DBSchema {
  session: {
    key: string
    value: Session
  }
  message: {
    key: string
    value: Message
    indexes: {
      sessionId: string
    }
  }
  prompt: {
    key: string
    value: Prompt
  }
}

export const initDatabase = once(async () => {
  return await openDB<AllDBSchema>('chat', 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('message')) {
        db.createObjectStore('message', { keyPath: 'id' }).createIndex('sessionId', 'sessionId')
      }
      if (!db.objectStoreNames.contains('prompt')) {
        db.createObjectStore('prompt', { keyPath: 'id' })
      }
    },
  })
})

export class SessionService {
  constructor(private readonly db: IDBPDatabase<AllDBSchema>) {}
  async put(session: Session): Promise<void> {
    await this.db.put('session', session)
  }
  async add(session: Session): Promise<void> {
    await this.db.add('session', session)
  }
  async list(): Promise<Session[]> {
    const list = await this.db.getAll('session')
    return sortBy(list, (it) => -new Date(it.date).valueOf())
  }
  async remove(id: string): Promise<void> {
    const list = await this.db.getAllKeysFromIndex('message', 'sessionId', id)
    await Promise.all(list.map((it) => this.db.delete('message', it)))
    await this.db.delete('session', id)
  }
}

export class MessageService {
  constructor(private readonly db: IDBPDatabase<AllDBSchema>) {}
  async list(sessionId: string): Promise<Message[]> {
    return sortBy(await this.db.getAllFromIndex('message', 'sessionId', sessionId), (it) => new Date(it.date).valueOf())
  }
  async remove(id: string): Promise<void> {
    await this.db.delete('message', id)
  }
  async add(msg: Message): Promise<void> {
    await this.db.add('message', msg)
  }
  async batchAdd(msgs: Message[]): Promise<void> {
    const tx = this.db.transaction('message', 'readwrite')
    for (const msg of msgs) {
      await tx.objectStore('message').add(msg)
    }
    await tx.done
  }
  async put(msg: Message): Promise<void> {
    await this.db.put('message', msg)
  }
}

export interface Prompt {
  id: string
  title: string
  detail: string
}

export class PromptService {
  constructor(private readonly db: IDBPDatabase<AllDBSchema>) {}
  async list() {
    return await this.db.getAll('prompt')
  }
  async add(prompt: Prompt) {
    await this.db.add('prompt', prompt)
  }
  async get(id: string) {
    return await this.db.get('prompt', id)
  }
  async update(prompt: Prompt) {
    await this.db.put('prompt', prompt)
  }
  async delete(id: string) {
    await this.db.delete('prompt', id)
  }
}
