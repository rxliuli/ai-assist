import { Link } from '@liuli-util/react-router'
import { observer, useLocalStore } from 'mobx-react-lite'
import { ajaxClient } from '../../constants/ajax'
import { t } from '../../constants/i18n'
import { router } from '../../constants/router'
import { ReactSwal } from '../../constants/swal'
import { ServerError } from '../../utils/error'
import validator from 'validator'

export const SignUpView = observer(() => {
  const store = useLocalStore(() => ({
    email: '',
    username: '',
    password: '',
  }))
  async function onSignUp(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    console.log('user', store)
    if (!validator.isEmail(store.email)) {
      ReactSwal.fire({
        title: t('user.signup.error.title'),
        text: t('user.signup.error.INVALID_EMAIL'),
        icon: 'error',
      })
      return
    }
    if (!validator.isLength(store.username, { min: 6, max: 20 })) {
      ReactSwal.fire({
        title: t('user.signup.error.title'),
        text: t('user.signup.error.INVALID_USERNAME'),
        icon: 'error',
      })
      return
    }
    if (!validator.isLength(store.password, { min: 8, max: 20 }) || !validator.isStrongPassword(store.password)) {
      ReactSwal.fire({
        title: t('user.signup.error.title'),
        text: t('user.signup.error.INVALID_PASSWORD'),
        icon: 'error',
      })
      return
    }
    const r = await ajaxClient.post('/api/signup', store)
    if (!r.ok) {
      const resp = (await r.json()) as ServerError
      if (resp.code === 'USER_ALREADY_EXISTS') {
        ReactSwal.fire({
          title: t('user.signup.error.title'),
          text: t('user.signup.error.USER_ALREADY_EXISTS'),
          icon: 'error',
        })
        return
      }
      if (resp.code === 'EMAIL_NOT_VERIFIED') {
        ReactSwal.fire({
          title: t('user.signup.error.title'),
          text: t('user.signup.error.EMAIL_NOT_VERIFIED'),
          icon: 'error',
          footer: t('user.success.checkEmail'),
        })
        return
      }
      if (resp.code === 'INVALID_EMAIL') {
        ReactSwal.fire({
          title: t('user.signup.error.title'),
          text: t('user.signup.error.INVALID_EMAIL'),
          icon: 'error',
        })
        return
      }
      if (resp.code === 'INVALID_USERNAME') {
        ReactSwal.fire({
          title: t('user.signup.error.title'),
          text: t('user.signup.error.INVALID_USERNAME'),
          icon: 'error',
        })
        return
      }
      if (resp.code === 'INVALID_PASSWORD') {
        ReactSwal.fire({
          title: t('user.signup.error.title'),
          text: t('user.signup.error.INVALID_PASSWORD'),
          icon: 'error',
        })
        return
      }

      ReactSwal.fire({
        title: t('user.signup.error.title'),
        text: t('user.signup.error.SERVER_ERROR'),
        icon: 'error',
      })
      return
    }
    await ReactSwal.fire({
      title: t('user.signup.success.title'),
      text: t('user.success.checkEmail'),
      icon: 'success',
    })
    router.push('/signin')
  }
  return (
    <div className={'container'}>
      <h2>{t('user.signup.title')}</h2>
      <form onSubmit={onSignUp}>
        <div>
          <label htmlFor={'email'}>{t('user.form.email')}:</label>
          <input
            type={'email'}
            id={'email'}
            required
            value={store.email}
            onInput={(ev) => (store.email = ev.currentTarget.value)}
            placeholder={t('user.form.email.placeholder')}
          />
        </div>
        <div>
          <label htmlFor={'username'}>{t('user.form.username')}:</label>
          <input
            type={'username'}
            id={'username'}
            required
            value={store.username}
            onInput={(ev) => (store.username = ev.currentTarget.value)}
            placeholder={t('user.form.username.placeholder')}
          />
        </div>
        <div>
          <label htmlFor={'password'}>{t('user.form.password')}:</label>
          <input
            type={'password'}
            id={'password'}
            required
            value={store.password}
            onInput={(ev) => (store.password = ev.currentTarget.value)}
            placeholder={t('user.form.password.placeholder')}
          />
        </div>
        <div>
          <button type={'submit'}>{t('user.signup.submit')}</button>
        </div>
        <article>
          {t('user.signin.alreadyHaveAccount')}
          <Link to={'/signin'}>{t('user.signin.title')}</Link>
        </article>
      </form>
    </div>
  )
})
