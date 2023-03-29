import { observer, useLocalStore } from 'mobx-react-lite'
import { Link } from '@liuli-util/react-router'
import Swal from 'sweetalert2'
import { ajaxClient } from '../../constants/ajax'
import { router } from '../../constants/router'

export const SignInView = observer(() => {
  const store = useLocalStore(() => ({
    usernameOrEmail: '',
    password: '',
  }))
  async function onSignIn(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const resp = await ajaxClient.post('/api/signin', store)
    if (!resp.ok) {
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