import { observer, useLocalStore } from 'mobx-react-lite'
import { Link } from '@liuli-util/react-router'
import Swal from 'sweetalert2'
import { ajaxClient } from '../../constants/ajax'
import { router } from '../../constants/router'
import { ServerError } from '../../utils/error'

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
        Swal.fire({
          title: 'Sign in failed',
          text: 'User disabled',
          icon: 'error',
        })
        return
      }
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        Swal.fire({
          title: 'Sign in failed',
          text: 'Email not verified',
          icon: 'error',
          footer: 'Please check your email and verify your email address.',
        })
        return
      }
      if (err.code === 'USERNAME_OR_PASSWORD_INCORRECT') {
        Swal.fire({
          title: 'Sign in failed',
          text: 'Username or password is incorrect',
          icon: 'error',
        })
        return
      }

      Swal.fire({
        title: 'Sign in failed',
        text: 'Username or password is incorrect',
        icon: 'error',
      })
      return
    }
    const r = (await resp.json()) as {
      token: string
    }
    localStorage.setItem('token', r.token)
    await Swal.fire({
      title: 'Sign in success',
      text: 'Goto home view...',
      icon: 'success',
      timer: 3000,
    })
    router.push('/')
  }
  return (
    <div className={'container'}>
      <h2>Sign in to Chat</h2>
      <form onSubmit={onSignIn}>
        <div>
          <label htmlFor={'usernameOrEmail'}>Username or email address:</label>
          <input
            type={'text'}
            id={'usernameOrEmail'}
            required
            value={store.usernameOrEmail}
            onInput={(ev) => (store.usernameOrEmail = ev.currentTarget.value)}
          />
        </div>
        <div>
          <label htmlFor={'password'}>
            <span>Password:</span>
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
          <button type={'submit'}>Sign In</button>
        </div>
      </form>
      <article>
        New to Chat? <Link to={'/signup'}>Create an account.</Link>
      </article>
    </div>
  )
})
