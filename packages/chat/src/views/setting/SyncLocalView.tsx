import { observer, useLocalStore } from 'mobx-react-lite'
import { LocalMessageService, LocalSessionService, initDatabase } from './constants/localDB'
import { useMount, useUnmount } from 'react-use'
import { ReactSwal } from '../../constants/swal'
import { ajaxClient } from '../../constants/ajax'
import { ServerError } from '../../utils/error'
import { LocalPromptService } from './constants/localDB'
import { settingStore } from './store/settingStore'
import { t } from '../../constants/i18n'

export const SyncLocalView = observer(() => {
  const store = useLocalStore(() => ({
    promptCount: 0,
    sessionCount: 0,
    get hasSync() {
      return this.promptCount > 0 || this.sessionCount > 0
    },
    loading: false,
    isStop: false,
  }))
  useMount(async () => {
    settingStore.title = t('setting.syncLocal.title')
    const db = await initDatabase()
    store.sessionCount = await db.count('session')
    store.promptCount = await db.count('prompt')
  })
  async function onSync() {
    if (store.loading) {
      return
    }
    store.loading = true
    try {
      const db = await initDatabase()
      const sessions = await db.getAll('session')
      const sessionService = new LocalSessionService(db)
      const messageService = new LocalMessageService(db)
      const promptService = new LocalPromptService(db)

      const prompts = await promptService.list()
      const resp = await ajaxClient.post(
        '/api/prompt/import',
        prompts.map((it) => ({
          name: it.title,
          content: it.detail,
        })),
      )
      if (!resp.ok) {
        const r = (await resp.json()) as ServerError
        ReactSwal.fire({
          title: t('setting.syncLocal.errors.prompt'),
          icon: 'error',
          toast: true,
          position: 'top',
          timer: 3000,
          showConfirmButton: false,
        })
        return
      }
      store.promptCount = 0
      await db.clear('prompt')

      for (const session of sessions) {
        if (store.isStop) {
          store.isStop = false
          return
        }
        const messages = await messageService.list(session.id)
        const resp = await ajaxClient.post('/api/session/import', {
          name: session.name,
          createdAt: session.date,
          messages: messages.map((it) => ({
            content: it.content,
            role: it.role,
            createdAt: it.date,
          })),
        })
        if (!resp.ok) {
          const r = (await resp.json()) as ServerError
          ReactSwal.fire({
            title: t('setting.syncLocal.errors.session'),
            icon: 'error',
            toast: true,
            position: 'top',
            timer: 3000,
            showConfirmButton: false,
          })
          continue
        }
        store.sessionCount -= 1
        await sessionService.remove(session.id)
      }

      ReactSwal.fire({
        title: t('setting.syncLocal.success'),
        icon: 'success',
        timer: 3000,
      })
    } finally {
      store.loading = false
    }
  }
  useUnmount(() => {
    store.isStop = true
  })

  return store.hasSync ? (
    <div>
      <article>
        <strong>
          {t('setting.syncLocal.desc', {
            sessionCount: store.sessionCount,
            promptCount: store.promptCount,
          })}
        </strong>
      </article>
      {store.hasSync && <button onClick={onSync}>{t('setting.syncLocal.syncNow')}</button>}
    </div>
  ) : (
    <div>
      <article>
        <strong>{t('setting.syncLocal.empty')}</strong>
      </article>
    </div>
  )
})
