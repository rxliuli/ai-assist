import { omit } from 'lodash-es'
import Swal from 'sweetalert2'
import { router } from './router'

interface RequestOptions {
  url: string
  method: 'get' | 'post' | 'put' | 'delete'
  body?: any
  query?: any
}
class AjaxClient {
  private getHeaders(options: RequestOptions) {
    const headers: Record<string, string> = {}
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    if (localStorage.getItem('OPENAI_API_KEY')) {
      headers.OPENAI_API_KEY = localStorage.getItem('OPENAI_API_KEY')!
    }
    if (localStorage.getItem('token')) {
      headers.Authorization = localStorage.getItem('token')!
    }
    return headers
  }
  private getBody(options: RequestOptions) {
    if (options.body && !(options.body instanceof FormData)) {
      return JSON.stringify(options.body)
    }
    return options.body
  }
  private getUrl(options: RequestOptions) {
    const r = new URLSearchParams()
    if (options.query) {
      Object.entries(options.query).forEach(([k, v]) => {
        Array.isArray(v) ? v.forEach((v) => r.append(k, v)) : r.append(k, String(v))
      })
    }
    return options.url + '?' + r.toString()
  }
  async request(options: RequestOptions & Partial<Omit<RequestInit, 'body'>>) {
    const r = await fetch(this.getUrl(options), {
      ...omit(options, ['url', 'method', 'body', 'query']),
      method: options.method,
      headers: this.getHeaders(options),
      body: this.getBody(options),
    })
    if (r.status === 401) {
      // await Swal.fire('Unauthorized', 'Please sign in again', 'error')
      router.push('/signin')
      throw new Error('Unauthorized')
    }
    return r
  }
  async get(url: string, query?: any) {
    return await this.request({ url, method: 'get', query })
  }
  async post(url: string, body?: any) {
    return await this.request({ url, method: 'post', body })
  }
  async put(url: string, body?: any) {
    return await this.request({ url, method: 'put', body })
  }
  async delete(url: string, body?: any) {
    return await this.request({ url, method: 'delete', body })
  }
}

export const ajaxClient = new AjaxClient()
