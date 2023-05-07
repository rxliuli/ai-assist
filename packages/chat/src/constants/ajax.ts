import { router } from './router'
import { AjaxClient } from '@ai-assist/utils'

export const ajaxClient = new AjaxClient({
  onNoLoginError() {
    router.push('/signin')
  },
  getHeaders() {
    return {
      OPENAI_API_KEY: localStorage.getItem('OPENAI_API_KEY')!,
      Authorization: localStorage.getItem('token')!,
    }
  },
})
