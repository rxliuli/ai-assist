import { Button, Col, DatePicker, Form, Input, Row, Select, Space, Switch, Table, TablePaginationConfig } from 'antd'
import { observer } from 'mobx-react-lite'
import { useLocalReactive } from '../../utils/mobx'
import { debounce, omitBy, pick } from 'lodash-es'
import { useAsyncFn, useMount } from 'react-use'
import { ajaxClient } from '../../constants/ajax'
import dayjs from 'dayjs'
import { useSearchParams } from '@liuli-util/react-router'

export interface User {
  id: string
  sessionId: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
  session: {
    name: string
  }
  user: {
    username: string
  }
}

export const MessageView = observer(() => {
  const [params] = useSearchParams()
  const store = useLocalReactive({
    offset: 0,
    limit: 10,
    total: 0,
    keyword: params.get('keyword') ?? '',
    start: undefined as string | undefined,
    end: undefined as string | undefined,
    userIdList: [] as string[],
    sessionIdList: [] as string[],
    list: [] as User[],
    get config() {
      return {
        current: Math.floor(this.offset / this.limit) + 1,
        pageSize: this.limit,
        total: this.total,
        showTotal: (total) => `共 ${total} 条`,
      } as TablePaginationConfig
    },
  })
  const [refreshState, refresh] = useAsyncFn(async () => {
    const resp = await ajaxClient.get(
      '/api/admin/message',
      omitBy(pick(store, ['offset', 'limit', 'keyword', 'start', 'end']), (it) => it === undefined),
    )
    const r = await resp.json()
    store.list = r.rows
    store.total = r.count
  })
  useMount(refresh)
  const [form] = Form.useForm<{
    keyword: string
  }>()
  async function onFilter() {
    const value = form.getFieldsValue()
    // console.log('value', value)
    Object.assign(store, value)
    await refresh()
  }
  const onSearchUser = debounce(() => {
    console.log('onSearch')
  }, 500)
  return (
    <div>
      <header>
        <Form
          form={form}
          onFinish={onFilter}
          initialValues={{
            keyword: '',
          }}
        >
          <Form.Item label={'搜索用户名、会话或消息'} name={'keyword'}>
            <Input.Search
              allowClear={true}
              onSearch={async (value, ev) => {
                ev?.preventDefault()
                // console.log('onSearch')
                form.setFieldValue('keyword', value)
                await onFilter()
              }}
            ></Input.Search>
          </Form.Item>
          <Row justify={'space-between'}>
            <Col>
              <Form.Item label={'邮箱是否验证'} name={'dateRange'}>
                <DatePicker.RangePicker
                  onChange={async (value) => {
                    console.log('value', value)
                    if (value) {
                      store.start = value[0]!.toJSON()
                      store.end = value[1]!.toJSON()
                    } else {
                      store.start = undefined
                      store.end = undefined
                    }
                    await onFilter()
                  }}
                  disabledDate={(date) => date.isAfter(dayjs())}
                />
              </Form.Item>
            </Col>
            {/* <Col>
              <Form.Item label={'按用户筛选'} name={'userIdList'}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    minWidth: '4rem',
                  }}
                  onSearch={onSearchUser}
                />
              </Form.Item>
            </Col> */}
            <Col>
              <Form.Item>
                <Space>
                  <Button
                    htmlType={'reset'}
                    onClick={async () => {
                      form.resetFields()
                      await onFilter()
                    }}
                  >
                    重置
                  </Button>
                  <Button type={'primary'} htmlType={'submit'}>
                    过滤
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </header>
      <Table
        loading={refreshState.loading}
        dataSource={store.list}
        columns={[
          {
            title: '会话',
            dataIndex: ['session', 'name'],
          },
          {
            title: '用户',
            dataIndex: ['user', 'username'],
          },
          {
            title: '角色',
            dataIndex: 'role',
          },
          {
            title: '内容',
            dataIndex: 'content',
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
          },
        ]}
        pagination={store.config}
        rowKey={'id'}
        onChange={async (pagination) => {
          console.log('pagination', pagination)
          store.offset = (pagination.current! - 1) * pagination.pageSize!
          store.limit = pagination.pageSize!
          await refresh()
        }}
        scroll={{
          y: 'calc(100vh - 200px)',
        }}
      ></Table>
    </div>
  )
})

export default MessageView
