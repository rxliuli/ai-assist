import { Dayjs } from 'dayjs'

export interface Message {
  aggregation_timestamp: number
  n_requests: number
  operation: string
  snapshot_id: string
  n_context: number
  n_context_tokens_total: number
  n_generated: number
  n_generated_tokens_total: number
}

export interface Usage {
  object: string
  data: Message[]
  ft_data: any[]
  dalle_api_data: any[]
  whisper_api_data: any[]
  current_usage_usd: number
}

export async function downloadByDate(
  date: string,
  options: {
    authorization: string
    organization: string
    baseUrl: string
    userPublicId?: string
  },
): Promise<Usage> {
  const s = new URLSearchParams()
  s.append('date', date)
  if (options.userPublicId) {
    s.append('user_public_id', options.userPublicId)
  }
  const url = `${options.baseUrl}/v1/usage?${s.toString()}`
  const resp = await fetch(url, {
    headers: {
      // "accept": "*/*",
      // "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,ja-JP;q=0.7,ja;q=0.6",
      'cache-control': 'no-cache',
      authorization: options.authorization,
      'openai-organization': options.organization,
      // "pragma": "no-cache",
      // "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
      // "sec-ch-ua-mobile": "?0",
      // "sec-ch-ua-platform": "\"Windows\"",
      // "sec-fetch-dest": "empty",
      // "sec-fetch-mode": "cors",
      // "sec-fetch-site": "same-site"
    },
    referrer: 'https://platform.openai.com/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
  })
  if (!resp.ok) {
    throw new Error(resp.statusText)
  }
  return await resp.json()
}

function retry<T extends (...args: any[]) => Promise<any>>(fn: T, count: number): T {
  return ((...args) =>
    new Promise((resolve, reject) => {
      function attempt() {
        fn(...args)
          .then(resolve)
          .catch((err) => {
            if (count > 0) {
              count--
              console.error(`Error occurred (${err.message}). Retrying (${count} attempts left)...`)
              attempt()
              return
            }
            reject(err)
          })
      }

      attempt()
    })) as T
}

export async function downloadUsage(options: {
  start: Dayjs
  end: Dayjs
  authorization: string
  organization: string
  callback: (date: string) => void
  baseUrl: string
  userPublicId?: string
}) {
  if (options.start.isAfter(options.end)) {
    throw new Error('start date should be before end date')
  }
  const usage: Usage[] = []
  for (let date = options.start; date.isBefore(options.end); date = date.add(1, 'day')) {
    const s = date.format('YYYY-MM-DD')
    options.callback(s)
    try {
      usage.push(await retry(downloadByDate, 3)(s, options))
    } catch (err) {
      if (err instanceof Error) {
        err.message = 'download failed, please check your authorization and organization id' + err.message
        throw err
      }
    }
  }
  return usage
}
