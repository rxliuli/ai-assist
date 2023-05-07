import { Button, Form, Input, message } from 'antd'
import { observer } from 'mobx-react-lite'
import { ajaxClient } from '../../constants/ajax'
import { ServerError } from '../../constants/error'
import css from './SignInView.module.css'
import { useRouter } from '@liuli-util/react-router'

export const SignInView = observer(() => {
  const [form] = Form.useForm<{
    usernameOrEmail: string
    password: string
  }>()
  const router = useRouter()
  async function onLogin() {
    const store = await form.validateFields()
    console.log('store', store)
    const resp = await ajaxClient.post('/api/admin/signin', store)
    if (!resp.ok) {
      const err = (await resp.json()) as ServerError
      message.error(err.message)
      return
    }
    const r = (await resp.json()) as {
      token: string
    }
    localStorage.setItem('token', r.token)
    await message.success('登录成功', 3)
    router.push('/')
  }

  return (
    <div className={css.signin}>
      <div className={css.signinContent}>
        <h2>Chat 管理后台</h2>
        <Form form={form} onFinish={onLogin} layout={'vertical'}>
          <Form.Item label={'用户名或邮箱'} name={'usernameOrEmail'} rules={[{ required: true }]}>
            <Input type="text" />
          </Form.Item>
          <Form.Item label={'密码'} name={'password'} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type={'primary'} htmlType={'submit'}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
})

export default SignInView
