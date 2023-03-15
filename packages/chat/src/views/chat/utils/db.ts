import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { sortBy } from 'lodash-es'

export interface Session {
  id: string
  name: string
  date: string
  systemContent?: string
}

export interface ISessionService {
  list(): Promise<Session[]>
  remove(id: string): Promise<void>
  add(session: Session): Promise<void>
  put(session: Session): Promise<void>
}

export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  date: string
}

export interface IMessageService {
  list(sessionId: string): Promise<Message[]>
  remove(id: string): Promise<void>
  add(msg: Message): Promise<void>
  put(msg: Message): Promise<void>
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
}

export async function initDatabase(): Promise<IDBPDatabase<AllDBSchema>> {
  return await openDB<AllDBSchema>('chat', 1, {
    upgrade(db) {
      db.createObjectStore('session', { keyPath: 'id' })
      db.createObjectStore('message', { keyPath: 'id' }).createIndex('sessionId', 'sessionId')
    },
  })
}

export class SessionService implements ISessionService {
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

export class MessageService implements IMessageService {
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
