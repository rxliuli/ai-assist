import { observer, useLocalStore } from 'mobx-react-lite'
import Swal from 'sweetalert2'
import { ajaxClient } from '../../constants/ajax'
import { router } from '../../constants/router'

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
      Swal.fire({
        title: 'Sign up failed',
        text: 'Server error',
        icon: 'error',
      })
      return
    }
    await Swal.fire({
      title: 'Sign up success',
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
