import { observer, useLocalStore } from 'mobx-react-lite'
import { ajaxClient } from '../../constants/ajax'
import { ReactSwal } from '../../constants/swal'
import { ServerError } from '../../utils/error'
import { router } from '../../constants/router'
import { t } from '../../constants/i18n'

export const PasswordResetSendView = observer(() => {
  const store = useLocalStore(() => ({
    email: '',
  }))
  async function onSendPasswordResetEmail(
    ev: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>,
  ) {
    ev.preventDefault()
    console.log(store.email)
    const resp = await ajaxClient.post('/api/reset-password-sent', {
      email: store.email,
    })
    if (resp.status !== 200) {
      const r = (await resp.json()) as ServerError
      ReactSwal.fire({
        icon: 'error',
        title: t(('user.reset.errors.' + r.code) as any),
      })
      return
    }
    ReactSwal.fire({
      icon: 'success',
      title: t('user.reset.success.title'),
      text: t('user.reset.success.text'),
    })
    store.email = ''
  }
  function onKeydown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      onSendPasswordResetEmail(ev)
    }
  }
  return (
    <div className={'container'}>
      <h2>{t('user.reset.title')}</h2>
      <form onSubmit={onSendPasswordResetEmail}>
        <div>
          <label htmlFor={'email'}>{t('user.reset.sent.form.email')}</label>
          <input
            type={'email'}
            id={'email'}
            required
            value={store.email}
            onInput={(ev) => (store.email = ev.currentTarget.value)}
            onKeyDown={onKeydown}
          />
        </div>
        <div>
          <button type={'submit'}>{t('user.reset.sent.form.submit')}</button>
        </div>
      </form>
    </div>
  )
})

export const PasswordResetView = observer(() => {
  const store = useLocalStore(() => ({
    code: new URLSearchParams(router.location.search).get('code'),
    password: '',
  }))
  async function onResetPassword(ev: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>) {
    ev.preventDefault()
    const resp = await ajaxClient.post('/api/reset-password', {
      code: store.code,
      password: store.password,
    })
    if (resp.status !== 200) {
      const r = (await resp.json()) as ServerError
      ReactSwal.fire({
        icon: 'error',
        title: t(('user.reset.errors.' + r.code) as any),
      })
      return
    }
    await ReactSwal.fire({
      icon: 'success',
      title: t('user.reset.new.success.title'),
      timer: 3000,
    })
    router.push('/login')
  }
  function onKeydown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      onResetPassword(ev)
    }
  }
  return (
    <div className={'container'}>
      <h2>{t('user.reset.title')}</h2>
      <form onSubmit={onResetPassword}>
        <div>
          <label htmlFor={'password'}>{t('user.reset.new.form.newPassword')}:</label>
          <input
            type={'password'}
            id={'password'}
            required
            value={store.password}
            onInput={(ev) => (store.password = ev.currentTarget.value)}
            onKeyDown={onKeydown}
          />
        </div>
        <div>
          <button type={'submit'}>{t('user.reset.new.form.submit')}</button>
        </div>
      </form>
    </div>
  )
})
