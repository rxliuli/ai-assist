import classNames from 'classnames'
import { observer, useLocalStore } from 'mobx-react-lite'
import css from './SettingView.module.css'
import { Link, RouterView, useLocation } from '@liuli-util/react-router'
import { router, settingRoutes } from '../../constants/router'
import { FormEvent, useMemo } from 'react'

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
  return <div>SettingPromptView</div>
})

export const SettingPromptEditView = observer(() => {
  return (
    <form>
      <div>
        <button>SettingPromptEditView</button>
      </div>
    </form>
  )
})

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
