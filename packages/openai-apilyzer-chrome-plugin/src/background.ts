import { keyBy } from 'lodash-es'
import Browser from 'webextension-polyfill'

Browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    // console.log('details', details.type, details.requestHeaders)
    if (details.type !== 'xmlhttprequest' || !details.requestHeaders) {
      return
    }
    const headers = keyBy(details.requestHeaders, 'name')
    // console.log('headers', headers)
    if (!headers['Authorization']?.value || !headers['OpenAI-Organization']?.value) {
      return
    }
    console.log('config', headers['Authorization'].value, headers['OpenAI-Organization'].value)
    Browser.storage.local.set({
      config: {
        authorization: headers['Authorization'].value!,
        organization: headers['OpenAI-Organization'].value!,
      },
    })
  },
  {
    urls: ['https://*.openai.com/*'],
  },
  ['requestHeaders'],
)
