import classNames from 'classnames'
import { observer, useLocalStore } from 'mobx-react-lite'
import css from './SettingView.module.css'
import { Link, RouterView, useLocation, useParams } from '@liuli-util/react-router'
import { router, settingRoutes } from '../../constants/router'
import { FormEvent, useMemo, useState } from 'react'
import { useMount } from 'react-use'
import { initDatabase, Prompt, PromptService } from '../../constants/db'
import { v4 } from 'uuid'
import { getLanguage } from '../../constants/i18n'
import { toJS } from 'mobx'
import { Lang, langList } from '../../constants/langs'
import { keyBy } from 'lodash-es'

export const SettingOpenAPIKeyView = observer(() => {
  const apiKey = useLocalStore(() => ({ value: '' }))
  function onSave(ev: FormEvent) {
    ev.preventDefault()
    localStorage.setItem('OpenAPIKey', apiKey.value)
    alert('Save success')
    apiKey.value = ''
  }
  return (
    <form>
      <div>
        <label htmlFor={'OpenAPIKey'}>OpenAPIKey:</label>
        <input
          type={'password'}
          id={'OpenAPIKey'}
          value={apiKey.value}
          onChange={(ev) => (apiKey.value = ev.target.value)}
        ></input>
      </div>
      <div>
        <button onClick={onSave}>Save</button>
      </div>
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
    const promptService = new PromptService(db)
    store.list = await promptService.list()
    setPromptService(promptService)
  })
  function onNewPrompt() {
    router.push('/setting/prompt/new')
  }
  return (
    <div>
      <header>
        <button onClick={onNewPrompt}>New Prompt</button>
      </header>
      <ul>
        {store.list.map((it) => (
          <li key={it.id}>{it.id}</li>
        ))}
      </ul>
    </div>
  )
})

export const SettingPromptEditView = observer(() => {
  const params = useParams<{ promptId?: string }>()
  const store = useLocalStore(() => {
    const defaultLang = getLanguage()
    return {
      edit: false,
      prompt: {
        id: v4(),
        authorId: '',
        fallback: defaultLang,
        locale: {
          [defaultLang]: {
            title: '',
            detail: '',
          },
        },
      } as Prompt,
      newPromptLang: langList.find((it) => it.k !== defaultLang)!.k as Lang,
      get langMap() {
        return langList.reduce((acc, it) => ({ ...acc, [it.k]: it.v }), {} as Record<Lang, string>)
      },
      get otherLangs() {
        return langList.filter((it) => !store.prompt.locale[it.k as Lang])
      },
    }
  })
  useMount(async () => {
    store.edit = !!params.promptId
    const db = await initDatabase()
    const promptService = new PromptService(db)
    if (params.promptId) {
      store.prompt = (await promptService.get(params.promptId))!
    }
    console.log(params.promptId, toJS(store.prompt))
  })

  function onSave() {}

  return (
    <form>
      <div>
        <label htmlFor={'id'}>authorId:</label>
        <input
          id={'id'}
          value={store.prompt.authorId}
          onChange={(ev) => (store.prompt.authorId = ev.target.value)}
          required
        ></input>
      </div>
      <div>
        <label htmlFor={'fallback'}>fallback language:</label>
        <select
          value={store.prompt.fallback}
          onChange={(ev) => (store.prompt.fallback = ev.currentTarget.value as any)}
          required
        >
          {Object.keys(store.prompt.locale).map((it) => (
            <option key={it} value={it}>
              {it}
            </option>
          ))}
        </select>
      </div>
      <div>
        <ul>
          {Object.entries(store.prompt.locale).map(([k, it], i) => (
            <li key={k}>
              <header style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                <h4>{store.langMap[k as Lang]}</h4>
                {i > 0 && (
                  <button
                    type={'button'}
                    onClick={() => {
                      Reflect.deleteProperty(store.prompt.locale, k)
                    }}
                  >
                    Delete
                  </button>
                )}
              </header>
              <div>
                <label htmlFor={'title-' + k}>title:</label>
                <input
                  value={it.title}
                  onChange={(ev) => (store.prompt.locale[k as Lang]!.title = ev.target.value)}
                  required
                ></input>
              </div>
              <div>
                <label htmlFor={'detail-' + k}>detail:</label>
                <textarea
                  value={it.detail}
                  onChange={(ev) => (store.prompt.locale[k as Lang]!.detail = ev.target.value)}
                  required
                ></textarea>
              </div>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex' }}>
          <Select
            value={store.newPromptLang}
            onChange={(v) => (store.newPromptLang = v)}
            options={store.otherLangs.map((it) => ({ label: it.v, value: it.k }))}
          ></Select>
          <button
            type={'button'}
            onClick={() => {
              store.prompt.locale[store.newPromptLang] = {
                title: '',
                detail: '',
              }
              store.newPromptLang = store.otherLangs.find((it) => it.k !== store.newPromptLang)?.k as Lang
            }}
          >
            New Locale
          </button>
        </div>
      </div>
      <div>
        <button onClick={onSave}>Save</button>
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
  return (
    <div>
      <Link to={'/setting/open-api-key'}>OpenAPIKey</Link>
      <Link to={'/setting/prompt'}>Prompt</Link>
    </div>
  )
})

export const SettingLayoutView = observer(() => {
  const title = useMemo(
    () => settingRoutes.find((it) => it.path === router.location.pathname)?.title ?? 'Setting',
    [useLocation()],
  )
  return (
    <div className={classNames('container', css.settings)}>
      <header className={css.header}>
        <button onClick={() => router.back()}>Back</button>
        <h2>{title}</h2>
      </header>
      <main>
        <RouterView></RouterView>
      </main>
    </div>
  )
})
