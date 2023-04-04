import { observer, useLocalStore } from 'mobx-react-lite'
import { Link } from '@liuli-util/react-router'
import { ajaxClient } from '../../constants/ajax'
import { router } from '../../constants/router'
import { ServerError } from '../../utils/error'
import { t } from '../../constants/i18n'
import { ReactSwal } from '../../constants/swal'
import css from './SignInView.module.css'

export const SignInView = observer(() => {
  const store = useLocalStore(() => ({
    usernameOrEmail: '',
    password: '',
  }))
  async function onSignIn(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const resp = await ajaxClient.post('/api/signin', store)
    if (!resp.ok) {
      // handle error, USER_DISABLED, EMAIL_NOT_VERIFIED, USERNAME_OR_PASSWORD_INCORRECT
      const err = (await resp.json()) as ServerError
      if (err.code === 'USER_DISABLED') {
        ReactSwal.fire({
          title: t('user.signin.error.title'),
          text: t('user.signin.error.USER_DISABLED'),
          icon: 'error',
        })
        return
      }
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        ReactSwal.fire({
          title: t('user.signin.error.title'),
          text: t('user.signin.error.EMAIL_NOT_VERIFIED'),
          icon: 'error',
          footer: t('user.success.checkEmail'),
        })
        return
      }
      if (err.code === 'USERNAME_OR_PASSWORD_INCORRECT') {
        ReactSwal.fire({
          title: t('user.signin.error.title'),
          text: t('user.signin.error.USERNAME_OR_PASSWORD_INCORRECT'),
          icon: 'error',
        })
        return
      }

      ReactSwal.fire({
        title: t('user.signin.error.title'),
        text: t('user.signin.error.USERNAME_OR_PASSWORD_INCORRECT'),
        icon: 'error',
      })
      return
    }
    const r = (await resp.json()) as {
      token: string
    }
    localStorage.setItem('token', r.token)
    await ReactSwal.fire({
      title: t('user.signin.success.title'),
      text: t('user.signin.success.gotoHome'),
      icon: 'success',
      timer: 3000,
    })
    router.push('/')
  }
  return (
    <div className={'container'}>
      <h2>{t('user.signin.title')}</h2>
      <form onSubmit={onSignIn}>
        <div>
          <label htmlFor={'usernameOrEmail'}>{t('user.signin.form.emailOrUsername')}:</label>
          <input
            type={'text'}
            id={'usernameOrEmail'}
            required
            value={store.usernameOrEmail}
            onInput={(ev) => (store.usernameOrEmail = ev.currentTarget.value)}
          />
        </div>
        <div>
          <label htmlFor={'password'} className={css.passwordLabel}>
            <span>{t('user.form.password')}:</span>
            <Link to={'/reset-password-sent'}>Forgot Password</Link>
          </label>
          <input
            type={'password'}
            id={'password'}
            required
            value={store.password}
            onChange={(ev) => (store.password = ev.currentTarget.value)}
          />
        </div>
        <div>
          <button type={'submit'}>{t('user.signin.form.submit')}</button>
        </div>
      </form>
      <article>
        {t('user.signin.firstUsing')}
        <Link to={'/signup'}>{t('user.signin.create')}</Link>
      </article>
    </div>
  )
})
