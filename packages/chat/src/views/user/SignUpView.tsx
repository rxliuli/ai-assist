import { observer, useLocalStore } from 'mobx-react-lite'
import Swal from 'sweetalert2'
import { ajaxClient } from '../../constants/ajax'
import { router } from '../../constants/router'
import { ServerError } from '../../utils/error'

export const SignUpView = observer(() => {
  const store = useLocalStore(() => ({
    email: '',
    username: '',
    password: '',
  }))
  async function onSignUp(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    console.log('user', store)
    const r = await ajaxClient.post('/api/signup', store)
    if (!r.ok) {
      const resp = (await r.json()) as ServerError
      if (resp.code === 'USER_ALREADY_EXISTS') {
        Swal.fire({
          title: 'Sign up failed',
          text: 'User already exists',
          icon: 'error',
        })
        return
      }
      if (resp.code === 'EMAIL_NOT_VERIFIED') {
        Swal.fire({
          title: 'Sign up failed',
          text: 'Email not verified',
          icon: 'error',
          footer: 'Please check your email and verify your email address.',
        })
        return
      }
      // handle other error, INVALID_EMAIL, INVALID_USERNAME, INVALID_PASSWORD
      if (resp.code === 'INVALID_EMAIL') {
        Swal.fire({
          title: 'Sign up failed',
          text: 'Invalid email',
          icon: 'error',
        })
        return
      }
      if (resp.code === 'INVALID_USERNAME') {
        Swal.fire({
          title: 'Sign up failed',
          text: 'Invalid username',
          icon: 'error',
        })
        return
      }
      if (resp.code === 'INVALID_PASSWORD') {
        Swal.fire({
          title: 'Sign up failed',
          text: 'Invalid password',
          icon: 'error',
        })
        return
      }

      Swal.fire({
        title: 'Sign up failed',
        text: 'Server error',
        icon: 'error',
      })
      return
    }
    await Swal.fire({
      title: 'Sign up success',
      text: 'Please check your email and verify your email address.',
      icon: 'success',
    })
    router.push('/signin')
  }
  return (
    <div className={'container'}>
      <h2>Sign up to Chat</h2>
      <form onSubmit={onSignUp}>
        <div>
          <label htmlFor={'email'}>Email:</label>
          <input
            type={'email'}
            id={'email'}
            required
            value={store.email}
            onInput={(ev) => (store.email = ev.currentTarget.value)}
          />
        </div>
        <div>
          <label htmlFor={'username'}>Username:</label>
          <input
            type={'username'}
            id={'username'}
            required
            value={store.username}
            onInput={(ev) => (store.username = ev.currentTarget.value)}
          />
        </div>
        <div>
          <label htmlFor={'password'}>Password:</label>
          <input
            type={'password'}
            id={'password'}
            required
            value={store.password}
            onInput={(ev) => (store.password = ev.currentTarget.value)}
          />
        </div>
        <div>
          <button type={'submit'}>Sign Up</button>
        </div>
      </form>
    </div>
  )
})
