import classNames from 'classnames'
import { last } from 'lodash-es'
import { observer, useLocalStore } from 'mobx-react-lite'
import ReactMarkdown from 'react-markdown'
import { useMount } from 'react-use'
import { ajaxClient } from '../../constants/ajax'
import css from './SpeakView.module.css'
import { azureSpeech } from './speech/azure'

const speech = azureSpeech

async function sendMessage(input: string) {
  const resp = await ajaxClient.post('/api/chat', [
    {
      role: 'user',
      content: input,
    },
  ])
  return await resp.text()
}

export const SpeakView = observer(() => {
  const store = useLocalStore(() => ({
    loading: false,
    recognition: null as {
      value: () => Promise<string>
      stop: () => void
    } | null,
    buttonText: '点击开始识别',
    timer: null as null | number,
    messages: [] as {
      id: string
      role: 'user' | 'assistant'
      content: string
    }[],
  }))

  async function onSpeechToText() {
    store.loading = true
    console.log('onSpeechToText start', store.recognition)
    if (!store.recognition) {
      store.buttonText = '正在识别...'
      store.messages.push({ id: Date.now().toString(), role: 'user', content: '' })
      store.recognition = await speech.speechToText((msg) => (last(store.messages)!.content = msg))
      return
    }
    try {
      console.log('stop recognition')
      store.recognition.stop()
      const input = await store.recognition.value()
      store.recognition = null
      console.log('user input', input)
      if (input.trim().length === 0) {
        console.log('empty input')
        return
      }
      last(store.messages)!.content = input
      store.buttonText = '准备回答...'
      const r = await sendMessage(input)
      console.log('chatgpt result', r)
      store.buttonText = '正在回答...'
      store.messages.push({ id: Date.now().toString(), role: 'assistant', content: r })
      await speech.textToSpeech(r)
      store.buttonText = '正在回答...'
    } finally {
      store.loading = false
      store.buttonText = '开始识别'
      console.log('onSpeechToText end')
    }
  }

  useMount(async () => {
    await azureSpeech.initConfig()
  })

  return (
    <div className={classNames('container', css.speak)}>
      <header>
        <h2 className={css.title}>语音机器人</h2>
      </header>
      <ul className={css.content}>
        {store.messages.map((it) => (
          <li className={css.message} key={it.id}>
            <span>{it.role === 'user' ? '你' : 'AI'}: </span>
            <div>
              <ReactMarkdown>{it.content}</ReactMarkdown>
            </div>
          </li>
        ))}
      </ul>
      <footer>
        <button onClick={onSpeechToText}>{store.buttonText}</button>
      </footer>
    </div>
  )
})
