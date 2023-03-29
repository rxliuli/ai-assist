import classNames from 'classnames'
import { observer, useLocalStore } from 'mobx-react-lite'
import css from './SettingView.module.css'
import { Link, RouterView, useParams } from '@liuli-util/react-router'
import { router } from '../../constants/router'
import { FormEvent, useState } from 'react'
import { useMount } from 'react-use'
import { initDatabase, Prompt, PromptService } from '../../constants/db'
import { v4 } from 'uuid'
import { observable, toJS } from 'mobx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faHouse, faShare, faTrash } from '@fortawesome/free-solid-svg-icons'
import clipboardy from 'clipboardy'
import { t } from '../../constants/i18n'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { ajaxClient } from '../../constants/ajax'

const settingStore = observable({
  title: t('setting.title'),
})

export const SettingOpenAPIKeyView = observer(() => {
  const apiKey = useLocalStore(() => ({ value: localStorage.getItem('OPENAI_API_KEY') ?? '' }))

  useMount(() => {
    settingStore.title = t('setting.openApiKey.title')
  })

  function onSave(ev: FormEvent) {
    ev.preventDefault()
    localStorage.setItem('OPENAI_API_KEY', apiKey.value)
    apiKey.value = ''
    alert(t('setting.save.success'))
    router.back()
  }
  return (
    <form onSubmit={onSave}>
      <div>
        <label htmlFor={'OpenAPIKey'}>{t('setting.openApiKey.form.key')}:</label>
        <input
          type={'password'}
          id={'OpenAPIKey'}
          value={apiKey.value}
          onChange={(ev) => (apiKey.value = ev.target.value)}
          required
        ></input>
      </div>
      <div>
        <button type={'submit'}>{t('setting.save')}</button>
      </div>
      <article>
        <ReactMarkdown children={t('setting.openApiKey.desc').trim()}></ReactMarkdown>
      </article>
    </form>
  )
})

export const SettingPromptView = observer(() => {
  const [promptService, setPromptService] = useState<PromptService>()
  const store = useLocalStore(() => ({
    list: [] as Prompt[],
  }))
  useMount(async () => {
    const db = await initDatabase()
    const service = new PromptService(db)
    store.list = await service.list()
    setPromptService(service)
    settingStore.title = t('setting.prompt.title')
  })
  async function onDelete(it: Prompt) {
    await promptService!.delete(it.id)
    store.list = store.list.filter((item) => item.id !== it.id)
  }
  async function onShare(it: Prompt) {
    const s = new URLSearchParams(router.location.search)
    s.forEach((it) => s.delete(it))
    s.append('action', 'newPrompt')
    s.append('prompt', JSON.stringify(it))
    const href =
      location.origin +
      router.createHref({
        pathname: '/',
        search: s.toString(),
      })
    console.log('href', href)
    await clipboardy.write(href)
    alert(t('setting.prompt.share.success'))
  }

  return (
    <aside>
      <nav>
        <ul>
          <li>
            <Link role="button" to={'/setting/prompt/new'} className={css.newPrompt}>
              {t('setting.prompt.new.title')}
            </Link>
          </li>
          {store.list.map((it) => (
            <li key={it.id} className={css.prompt}>
              <Link to={`/setting/prompt/${it.id}`}>
                <span>{it.title}</span>
              </Link>
              <FontAwesomeIcon
                icon={faTrash}
                className={css.icon}
                onClick={() => onDelete(it)}
                title={t('setting.prompt.share')}
              />
              <FontAwesomeIcon
                icon={faShare}
                className={css.icon}
                onClick={() => onShare(it)}
                title={t('setting.prompt.delete')}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
})

export const SettingPromptEditView = observer(() => {
  const params = useParams<{ promptId?: string }>()
  const store = useLocalStore(() => ({
    get edit() {
      return !!params.promptId
    },
    prompt: {
      id: v4(),
      title: '',
      detail: '',
    } as Prompt,
  }))
  const [promptService, setPromptService] = useState<PromptService>()
  useMount(async () => {
    const db = await initDatabase()
    const service = new PromptService(db)
    setPromptService(service)
    if (store.edit) {
      store.prompt = (await service.get(params.promptId!))!
      settingStore.title = t('setting.prompt.edit.title')
    } else {
      settingStore.title = t('setting.prompt.new.title')
    }
    console.log(params.promptId, toJS(store.prompt))
  })

  async function onSave(ev: FormEvent) {
    ev.preventDefault()
    if (store.edit) {
      await promptService!.update(toJS(store.prompt))
    } else {
      await promptService!.add(toJS(store.prompt))
    }
    router.back()
  }

  return (
    <form onSubmit={onSave}>
      <div>
        <label htmlFor={'title'}>{t('setting.prompt.new.form.title')}:</label>
        <input value={store.prompt.title} onChange={(ev) => (store.prompt.title = ev.target.value)} required></input>
      </div>
      <div>
        <label htmlFor={'detail'}>{t('setting.prompt.new.form.detail')}:</label>
        <textarea
          value={store.prompt.detail}
          onChange={(ev) => (store.prompt.detail = ev.target.value)}
          required
        ></textarea>
      </div>
      <div>
        <button type={'submit'}>{t('setting.save')}</button>
      </div>
    </form>
  )
})

function Select<T extends string>(props: {
  value: T
  onChange: (value: T) => void
  options: { label: string; value: string }[]
}) {
  return (
    <select value={props.value} onChange={(ev) => props.onChange(ev.currentTarget.value as T)} required>
      {props.options.map((it) => (
        <option key={it.value} value={it.value}>
          {it.label}
        </option>
      ))}
    </select>
  )
}

export const SettingHomeView = observer(() => {
  useMount(() => {
    settingStore.title = t('setting.title')
  })
  async function onLogout() {
    await ajaxClient.post('/api/logout')
    router.push('/signin')
  }
  return (
    <aside>
      <nav>
        <ul>
          <li>
            <Link to={'/setting/open-api-key'}>{t('setting.openApiKey.title')}</Link>
          </li>
          <li>
            <Link to={'/setting/prompt'}>{t('setting.prompt.title')}</Link>
          </li>
          <li>
            <button onClick={onLogout}>logout</button>
          </li>
        </ul>
      </nav>
    </aside>
  )
})

export const SettingLayoutView = observer(() => {
  return (
    <div className={classNames('container')}>
      <nav>
        <ul>
          <li>
            <FontAwesomeIcon
              onClick={() => router.back()}
              icon={faAngleLeft}
              className={css.icon}
              title={t('setting.back')}
            />
          </li>
        </ul>
        <ul>
          <li>
            <strong>{settingStore.title}</strong>
          </li>
        </ul>
        <ul>
          <li>
            <FontAwesomeIcon
              onClick={() => router.push('/')}
              icon={faHouse}
              className={css.icon}
              title={t('setting.home')}
            />
          </li>
        </ul>
      </nav>
      <main>
        <RouterView></RouterView>
      </main>
    </div>
  )
})
