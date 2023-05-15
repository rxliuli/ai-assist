import classNames from 'classnames'
import { observer, useLocalStore } from 'mobx-react-lite'
import css from './SettingView.module.css'
import { Link, RouterView, useParams } from '@liuli-util/react-router'
import { router } from '../../constants/router'
import { FormEvent, useState } from 'react'
import { useMount } from 'react-use'
import { Prompt, PromptService } from '../../constants/db'
import { v4 } from 'uuid'
import { toJS } from 'mobx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faHouse, faShare, faTrash } from '@fortawesome/free-solid-svg-icons'
import clipboardy from 'clipboardy'
import { t } from '../../constants/i18n'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { ajaxClient } from '../../constants/ajax'
import { ReactSwal } from '../../constants/swal'
import { settingStore } from './store/settingStore'
import { isEmpty } from 'lodash-es'
import changelog from '../../../changelog.md?raw'

export const SettingOpenAPIKeyView = observer(() => {
  const settings = useLocalStore(() => ({
    apiKey: localStorage.getItem('OPENAI_API_KEY') ?? '',
    model: localStorage.getItem('OPENAI_MODEL') ?? 'gpt-3.5-turbo',
  }))

  useMount(() => {
    settingStore.title = t('setting.openai.title')
  })

  function onSave(ev: FormEvent) {
    ev.preventDefault()
    if (isEmpty(settings.apiKey)) {
      localStorage.removeItem('OPENAI_API_KEY')
    } else {
      localStorage.setItem('OPENAI_API_KEY', settings.apiKey)
    }
    localStorage.setItem('OPENAI_MODEL', settings.model)
    settings.apiKey = ''
    alert(t('setting.save.success'))
    router.back()
  }
  return (
    <form onSubmit={onSave}>
      <div>
        <label htmlFor={'OpenAPIKey'}>{t('setting.openai.form.key')}:</label>
        <input
          type={'password'}
          id={'OpenAPIKey'}
          value={settings.apiKey}
          onChange={(ev) => (settings.apiKey = ev.target.value)}
        ></input>
      </div>
      <div>
        <label htmlFor={'model'}>{t('setting.openai.form.model')}:</label>
        <select
          id={'model'}
          value={settings.model}
          onChange={(ev) => {
            settings.model = ev.target.value
          }}
        >
          {[
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5' },
            { value: 'gpt-4', label: 'GPT-4' },
          ].map((it) => (
            <option key={it.value} value={it.value}>
              {it.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button type={'submit'}>{t('setting.save')}</button>
      </div>
      <article>
        <ReactMarkdown children={t('setting.openai.desc').trim()}></ReactMarkdown>
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
    const service = new PromptService()
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
                <span>{it.name}</span>
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
      name: '',
      content: '',
    } as Prompt,
  }))
  const [promptService, setPromptService] = useState<PromptService>()
  useMount(async () => {
    const service = new PromptService()
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
    const r = await (store.edit ? promptService!.update(toJS(store.prompt)) : promptService!.add(toJS(store.prompt)))
    if (!r.ok) {
      ReactSwal.fire({
        title: 'Save prompt failed',
        icon: 'error',
      })
      return
    }
    await ReactSwal.fire({ title: 'Save prompt success', icon: 'success', timer: 1000 })
    router.back()
  }

  return (
    <form onSubmit={onSave}>
      <div>
        <label htmlFor={'title'}>{t('setting.prompt.new.form.title')}:</label>
        <input value={store.prompt.name} onChange={(ev) => (store.prompt.name = ev.target.value)} required></input>
      </div>
      <div>
        <label htmlFor={'detail'}>{t('setting.prompt.new.form.detail')}:</label>
        <textarea
          value={store.prompt.content}
          onChange={(ev) => (store.prompt.content = ev.target.value)}
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
            <Link to={'/setting/open-api-key'}>{t('setting.openai.title')}</Link>
          </li>
          <li>
            <Link to={'/setting/prompt'}>{t('setting.prompt.title')}</Link>
          </li>
          <li>
            <Link to={'/setting/changelog'}>{t('setting.changelog.title')}</Link>
          </li>
          <li>
            <Link to={'/setting/sync'}>{t('setting.syncLocal.title')}</Link>
          </li>
          <li>
            <button onClick={onLogout}>{t('user.logout')}</button>
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

export const ChangeLogView = () => {
  useMount(() => {
    settingStore.title = t('setting.changelog.title')
  })
  return <ReactMarkdown>{changelog}</ReactMarkdown>
}
