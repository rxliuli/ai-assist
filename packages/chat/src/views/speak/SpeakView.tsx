import classNames from 'classnames'
import { last, takeRight } from 'lodash-es'
import { observer, useLocalStore, useObserver } from 'mobx-react-lite'
import ReactMarkdown from 'react-markdown'
import css from './SpeakView.module.css'

globalThis.SpeechRecognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition

function speechToText(callback: (interimTranscripts: string[]) => void) {
  const recognition = new window.SpeechRecognition()
  const p = new Promise<string>((resolve, reject) => {
    recognition.continuous = true
    recognition.interimResults = true

    const interimTranscripts: string[] = []
    const finalTranscripts: string[] = []
    recognition.onresult = function (event) {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscripts.push(transcript)
          resolve(finalTranscripts.join(', '))
        } else {
          interimTranscripts.push(transcript)
        }
      }

      callback(interimTranscripts)
      // console.log('Interim transcripts:', interimTranscripts.join(', '))
      // console.log('Final transcripts:', finalTranscripts.join(', '))
    }

    recognition.onerror = function (event) {
      reject(event.error)
    }

    recognition.onend = function () {
      resolve(finalTranscripts.join(', '))
    }

    recognition.start()
  })

  return {
    value: () => p,
    stop: () => recognition.stop(),
  }
}

function textToSpeech(msg: string) {
  let u = new SpeechSynthesisUtterance()
  u.lang = 'zh-CN'
  u.text = msg
  const voices = speechSynthesis.getVoices().filter((it) => it.lang === 'zh-CN')
  u.voice = voices[1]
  speechSynthesis.speak(u)
  return new Promise((resolve, reject) => {
    u.addEventListener('end', resolve)
    u.addEventListener('error', reject)
  })
}

async function sendMessage(input: string) {
  const resp = await fetch('/chat', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      {
        role: 'user',
        content: input,
      },
    ]),
  })
  return await resp.text()
}

function safeLocalStorageGet(key: string): any {
  const v = localStorage.getItem(key)
  if (!v) {
    return
  }
  try {
    return JSON.parse(v)
  } catch (e) {
    return
  }
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
    messages: (safeLocalStorageGet('ai-assist-chat-speak-cache') ?? []) as {
      role: 'user' | 'assistant'
      content: string
    }[],
  }))

  async function onSpeechToText() {
    store.loading = true
    console.log('onSpeechToText start', store.recognition)
    if (!store.recognition) {
      store.buttonText = '正在识别...'
      store.messages.push({ role: 'user', content: '' })
      store.recognition = speechToText(
        (interimTranscripts) => (last(store.messages)!.content = last(interimTranscripts)!),
      )
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
      store.messages.push({ role: 'assistant', content: r })
      await textToSpeech(r)
      store.buttonText = '正在回答...'
    } finally {
      store.loading = false
      store.buttonText = '开始识别'
      console.log('onSpeechToText end')
    }
  }

  useObserver(() => {
    const cache = takeRight(store.messages, 100)
    localStorage.setItem('ai-assist-chat-speak-cache', JSON.stringify(cache))
  })

  const current = useObserver(() => store.messages[store.messages.length - 1])

  return (
    <div className={classNames('container', css.speak)}>
      <header>
        <h2 className={css.title}>语音机器人</h2>
      </header>
      <div className={css.content}>
        {current && (
          <div className={css.message}>
            <span>{current.role === 'user' ? '你' : '机器人'}: </span>
            <div>
              <ReactMarkdown>{current.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <footer>
        <button onClick={onSpeechToText}>{store.buttonText}</button>
      </footer>
    </div>
  )
})
