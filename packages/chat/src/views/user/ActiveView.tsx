import { observer } from 'mobx-react-lite'
import { useMount } from 'react-use'
import { ajaxClient } from '../../constants/ajax'
import { t } from '../../constants/i18n'
import { router } from '../../constants/router'
import { ReactSwal } from '../../constants/swal'

export const ActiveView = observer(() => {
  useMount(async () => {
    const q = new URLSearchParams(router.location.search)
    const activeCode = q.get('activeCode')
    if (!activeCode) {
      await ReactSwal.fire({
        title: t('action.error.title'),
        text: t('user.active.error.ACTIVE_CODE_IS_REQUIRE'),
        icon: 'error',
        timer: 3000,
      })
      router.push('/signin')
      return
    }
    const resp = await ajaxClient.post('/api/active', { code: activeCode })
    if (!resp.ok) {
      await ReactSwal.fire({
        title: t('action.error.title'),
        text: t('user.active.error.ACTIVE_FAILED'),
        icon: 'error',
        timer: 3000,
      })
      router.push('/signin')
      return
    }
    await ReactSwal.fire({
      title: t('action.success.title'),
      text: t('user.active.success.text'),
      icon: 'success',
      timer: 3000,
    })
    router.push('/signin')
  })
  return <div className={'container'}></div>
})
