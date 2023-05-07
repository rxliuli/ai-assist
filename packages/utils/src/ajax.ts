import { omit } from 'lodash-es'

interface RequestOptions {
  url: string
  method: 'get' | 'post' | 'put' | 'delete'
  body?: any
  query?: any
}

export interface AjaxOptions {
  onNoLoginError?: () => void
  getHeaders?: () => Record<string, string>
}

export class AjaxClient {
  constructor(private readonly options: AjaxOptions) {}
  private getHeaders(options: RequestOptions) {
    const headers: Record<string, string> = {}
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    if (this.options.getHeaders) {
      Object.assign(headers, this.options.getHeaders())
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
    if (!options.query) {
      return options.url
    }
    const r = new URLSearchParams()
    Object.entries(options.query).forEach(([k, v]) => {
      Array.isArray(v) ? v.forEach((v) => r.append(k, v)) : r.append(k, String(v))
    })
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
      this.options.onNoLoginError?.()
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
