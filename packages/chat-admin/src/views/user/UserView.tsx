import { Table } from 'antd'
import { useAsyncFn, useMount } from 'react-use'
import { ajaxClient } from '../../constants/ajax'
import { observer } from 'mobx-react-lite'

export const UserView = observer(() => {
  const [data, refresh] = useAsyncFn(async () => {
    const resp = await ajaxClient.get('/api/admin/user', {
      offset: 0,
      limit: 10,
    })
    const r = await resp.json()
    return r
  })
  useMount(refresh)
  return (
    <div>
      <Table></Table>
    </div>
  )
})

export default UserView
