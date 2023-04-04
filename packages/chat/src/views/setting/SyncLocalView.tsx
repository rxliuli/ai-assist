import { observer, useLocalStore } from 'mobx-react-lite'
import { LocalMessage, LocalPrompt, LocalSession, LocalSessionService, initDatabase } from './constants/localDB'
import { useMount } from 'react-use'

export const SyncLocalView = observer(() => {
  const store = useLocalStore(() => ({
    promptCount: 0,
    sessionCount: 0,
  }))
  useMount(async () => {
    const db = await initDatabase()
    store.sessionCount = await db.count('session')
    store.promptCount = await db.count('prompt')
  })
  return (
    <div>
      <button>Sync Local Data</button>
      <article>
        你有 {store.sessionCount} 个会话，{store.promptCount} 个提示未同步
      </article>
    </div>
  )
})
