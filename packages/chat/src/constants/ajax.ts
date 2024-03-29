import { router } from './router'
import { AjaxClient } from '@ai-assist/utils'

export const ajaxClient = new AjaxClient({
  onNoLoginError() {
    router.push('/signin')
  },
  getHeaders() {
    const r: Record<string, string> = {
      Authorization: localStorage.getItem('token')!,
    }
    const key = localStorage.getItem('OPENAI_API_KEY')
    if (key) {
      r.OPENAI_API_KEY = key
    }
    const model = localStorage.getItem('OPENAI_MODEL')
    if (model) {
      r.OPENAI_MODEL = model
    }
    return r
  },
})
