import { observer } from 'mobx-react-lite'
import { useMount } from 'react-use'
import Swal from 'sweetalert2'
import { ajaxClient } from '../../constants/ajax'
import { router } from '../../constants/router'

export const ActiveView = observer(() => {
  useMount(async () => {
    const q = new URLSearchParams(router.location.search)
    const activeCode = q.get('activeCode')
    if (!activeCode) {
      await Swal.fire({
        title: 'Error',
        text: 'active code is required',
        icon: 'error',
      })
      return
    }
    const resp = await ajaxClient.post('/api/active', { code: activeCode })
    if (!resp.ok) {
      await Swal.fire({
        title: 'Error',
        text: 'Active failed, please try again later',
        icon: 'error',
      })
      return
    }
    await Swal.fire({
      title: 'Success',
      text: 'Active success, please login',
      icon: 'success',
      timer: 3000,
    })
    router.push('/signin')
  })
  return <div className={'container'}></div>
})
