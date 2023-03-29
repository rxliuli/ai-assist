import { observer } from 'mobx-react-lite'

export const PasswordResetView = observer(() => {
  return (
    <div className={'container'}>
      <h2>Reset your password</h2>
      <form>
        <div>
          <label htmlFor={'email'}>
            Enter your user account's verified email address and we will send you a password reset link.
          </label>
          <input type={'email'} id={'email'} required />
        </div>
        <div>
          <button type={'submit'}>Send password reset email</button>
        </div>
      </form>
    </div>
  )
})
