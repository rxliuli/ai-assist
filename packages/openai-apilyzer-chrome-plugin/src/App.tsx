import './App.css'
import { DatePicker, message, Button, Form, Input, ConfigProvider, theme, Progress } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import 'antd/dist/reset.css'
import Browser from 'webextension-polyfill'
import useSystemTheme from 'use-system-theme'
import { downloadUsage, formats } from '@ai-assist/openai-apilyzer'
import saveAs from 'file-saver'
import { useAsync } from 'react-use'

interface DownloadForm {
  timeRange: [Dayjs, Dayjs]
  baseUrl: string
  userPublicId?: string
}

function DownloadUsage() {
  const config = useAsync(async () => (await Browser.storage.local.get('config'))?.config)
  const [form] = Form.useForm<DownloadForm>()
  const [messageApi, contextHolder] = message.useMessage()
  async function onSubmit() {
    const values = await form.validateFields()
    if (!values) {
      return
    }
    const config = (await Browser.storage.local.get('config'))?.config
    console.log('values', values, config)
    messageApi.loading({
      key: 'download',
      content: 'Download start',
    })
    const start = values.timeRange[0]
    const end = values.timeRange[1]
    const usages = await downloadUsage({
      start: start,
      end: end,
      authorization: config!.authorization,
      organization: config!.organization,
      baseUrl: values.baseUrl,
      userPublicId: values.userPublicId,
      callback(date) {
        messageApi.loading({
          key: 'download',
          content: 'Downloading ' + date,
        })
      },
    })
    messageApi.destroy('download')
    const fileName = `openai-api-usage-${start.format('YYYY-MM-DD')}-${end.format('YYYY-MM-DD')}.csv`
    const data = await formats.csv(usages)
    saveAs(new File([data], fileName, { type: 'text/plain;charset=utf-8' }))
    messageApi.success('Download completed')
  }
  return (
    <div className={'App'}>
      {contextHolder}
      <h2>Download OpenAI API usage data</h2>
      <Form<DownloadForm>
        form={form}
        initialValues={
          {
            timeRange: [dayjs().subtract(30, 'day'), dayjs()],
            baseUrl: 'https://api.openai.com',
          } as DownloadForm
        }
        onFinish={onSubmit}
        layout={'vertical'}
      >
        <Form.Item name={'timeRange'} label={'Date range'} rules={[{ required: true }]}>
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item name={'baseUrl'} label={'OpenAI basePath'} rules={[{ required: true }]}>
          <Input type={'url'}></Input>
        </Form.Item>
        <Form.Item name={'userPublicId'} label={'User public id'}>
          <Input></Input>
        </Form.Item>
        <Form.Item>
          <Button type={'primary'} htmlType={'submit'} disabled={!config.value}>
            Download
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

function NotConfig() {
  function onOpen() {
    window.open('https://platform.openai.com/')
  }
  return (
    <div>
      <p>请在 OpenAI 网站先登录</p>
      <p>
        <a href={'https://platform.openai.com/'} onClick={onOpen}>
          https://platform.openai.com/
        </a>
      </p>
    </div>
  )
}

function App() {
  const config = useAsync(async () => (await Browser.storage.local.get('config'))?.config)
  const systemTheme = useSystemTheme()
  return (
    <ConfigProvider
      theme={{
        algorithm: systemTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {!config.value && <NotConfig></NotConfig>}
      <DownloadUsage></DownloadUsage>
    </ConfigProvider>
  )
}

export default App
