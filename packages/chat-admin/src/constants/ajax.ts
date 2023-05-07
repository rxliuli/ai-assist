import { router } from './router'
import { AjaxClient } from '@ai-assist/utils'

export const ajaxClient = new AjaxClient({
  onNoLoginError() {
    router.push('/signin')
  },
  getHeaders() {
    return {
      Authorization: localStorage.getItem('token')!,
    }
  },
})
