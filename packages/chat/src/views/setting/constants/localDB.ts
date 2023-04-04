import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { sortBy } from 'lodash-es'
import { once } from '@liuli-util/async'

export interface LocalSession {
  id: string
  name: string
  date: string
}

export interface LocalMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  date: string
}

export interface LocalAllDBSchema extends DBSchema {
  session: {
    key: string
    value: LocalSession
  }
  message: {
    key: string
    value: LocalMessage
    indexes: {
      sessionId: string
    }
  }
  prompt: {
    key: string
    value: LocalPrompt
  }
}

export const initDatabase = once(async () => {
  return await openDB<LocalAllDBSchema>('chat', 2, {
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

export class LocalSessionService {
  constructor(private readonly db: IDBPDatabase<LocalAllDBSchema>) {}
  async put(session: LocalSession): Promise<void> {
    await this.db.put('session', session)
  }
  async add(session: LocalSession): Promise<void> {
    await this.db.add('session', session)
  }
  async list(): Promise<LocalSession[]> {
    const list = await this.db.getAll('session')
    return sortBy(list, (it) => -new Date(it.date).valueOf())
  }
  async remove(id: string): Promise<void> {
    const list = await this.db.getAllKeysFromIndex('message', 'sessionId', id)
    await Promise.all(list.map((it) => this.db.delete('message', it)))
    await this.db.delete('session', id)
  }
}

export class LocalMessageService {
  constructor(private readonly db: IDBPDatabase<LocalAllDBSchema>) {}
  async list(sessionId: string): Promise<LocalMessage[]> {
    return sortBy(await this.db.getAllFromIndex('message', 'sessionId', sessionId), (it) => new Date(it.date).valueOf())
  }
  async remove(id: string): Promise<void> {
    await this.db.delete('message', id)
  }
  async add(msg: LocalMessage): Promise<void> {
    await this.db.add('message', msg)
  }
  async batchAdd(msgs: LocalMessage[]): Promise<void> {
    const tx = this.db.transaction('message', 'readwrite')
    for (const msg of msgs) {
      await tx.objectStore('message').add(msg)
    }
    await tx.done
  }
  async put(msg: LocalMessage): Promise<void> {
    await this.db.put('message', msg)
  }
}

export interface LocalPrompt {
  id: string
  title: string
  detail: string
}

export class LocalPromptService {
  constructor(private readonly db: IDBPDatabase<LocalAllDBSchema>) {}
  async list() {
    return await this.db.getAll('prompt')
  }
  async add(prompt: LocalPrompt) {
    await this.db.add('prompt', prompt)
  }
  async get(id: string) {
    return await this.db.get('prompt', id)
  }
  async update(prompt: LocalPrompt) {
    await this.db.put('prompt', prompt)
  }
  async delete(id: string) {
    await this.db.delete('prompt', id)
  }
}
