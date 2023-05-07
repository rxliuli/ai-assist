import { Table } from 'antd'
import { useAsyncFn } from 'react-use'
import { ajaxClient } from '../../constants/ajax'

export const UserView = () => {
  useAsyncFn(async () => {
    ajaxClient.get('/api/admin/user')
  })
  return (
    <div>
      <Table></Table>
    </div>
  )
}

export default UserView
