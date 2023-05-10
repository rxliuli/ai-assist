import { Button, Checkbox, Col, Form, Input, Row, Space, Switch, Table, TablePaginationConfig } from 'antd'
import { useAsyncFn, useMount } from 'react-use'
import { ajaxClient } from '../../constants/ajax'
import { observer, useLocalStore } from 'mobx-react-lite'
import { useLocalComputed, useLocalReactive } from '../../utils/mobx'
import { omitBy, pick } from 'lodash-es'

export interface User {
  id: string
  username: string
  email: string
  createdAt: Date
  emailVerified: boolean
  disabled: boolean
}

interface PageList<T> {
  rows: T[]
  count: number
}

export const UserView = observer(() => {
  const store = useLocalReactive({
    offset: 0,
    limit: 10,
    total: 0,
    keyword: '',
    emailVerified: undefined,
    disabled: undefined,
    list: [] as User[],
    get config() {
      return {
        current: Math.floor(this.offset / this.limit) + 1,
        pageSize: this.limit,
        total: this.total,
      } as TablePaginationConfig
    },
  })
  const [refreshState, refresh] = useAsyncFn(async () => {
    const resp = await ajaxClient.get(
      '/api/admin/user',
      omitBy(pick(store, ['offset', 'limit', 'keyword', 'emailVerified', 'disabled']), (it) => it === undefined),
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
          <Form.Item label={'搜索用户名或邮箱'} name={'keyword'}>
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
              <Form.Item label={'邮箱是否验证'} name={'emailVerified'}>
                <Switch
                  onChange={async (value, ev) => {
                    ev?.preventDefault()
                    form.setFieldValue('emailVerified', value)
                    await onFilter()
                  }}
                ></Switch>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={'是否禁用'} name={'disabled'}>
                <Switch
                  onChange={async (value, ev) => {
                    ev?.preventDefault()
                    form.setFieldValue('disabled', value)
                    await onFilter()
                  }}
                ></Switch>
              </Form.Item>
            </Col>
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
            title: '用户名',
            dataIndex: 'username',
          },
          {
            title: '邮箱',
            dataIndex: 'email',
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
          },
          {
            title: '邮箱是否验证',
            dataIndex: 'emailVerified',
            render: (v, row) => (
              <Switch
                checked={v}
                onChange={async (value) => {
                  await ajaxClient.put(`/api/admin/user/${row.id}`, {
                    emailVerified: value,
                  })
                  await refresh()
                }}
              />
            ),
          },
          {
            title: '是否禁用',
            dataIndex: 'disabled',
            render: (v, row) => (
              <Switch
                checked={v}
                onChange={async (value) => {
                  await ajaxClient.put(`/api/admin/user/${row.id}`, {
                    disabled: value,
                  })
                  await refresh()
                }}
              />
            ),
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

export default UserView
