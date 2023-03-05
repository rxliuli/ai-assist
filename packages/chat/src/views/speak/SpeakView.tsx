import { observer, useLocalStore } from 'mobx-react-lite'

globalThis.SpeechRecognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition

function speechToText() {
  const recognition = new window.SpeechRecognition()
  const p = new Promise<string>((resolve, reject) => {
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = function (event) {
      const interimTranscripts = []
      const finalTranscripts = []

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscripts.push(transcript)
          resolve(finalTranscripts.join(', '))
        } else {
          interimTranscripts.push(transcript)
        }
      }
    }

    recognition.onerror = function (event) {
      reject(event.error)
    }

    recognition.onend = function () {
      console.log('Speech recognition ended.')
    }

    recognition.start()
  })

  Object.assign(p, {})

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

export const SpeakView = observer(() => {
  const store = useLocalStore(() => ({
    loading: false,
    recognition: null as {
      value: () => Promise<string>
      stop: () => void
    } | null,
    buttonText: '开始识别',
    timer: null as null | number,
  }))

  async function onSpeechToText() {
    store.loading = true
    console.log('onSpeechToText start')
    try {
      if (store.recognition) {
        store.recognition.stop()
        const input = await store.recognition.value()
        store.recognition = null
        console.log('user input', input)
        store.buttonText = '准备回答...'
        const r = await sendMessage(input)
        console.log('chatgpt result', r)
        store.buttonText = '正在回答...'
        await textToSpeech(r)
        store.buttonText = '正在回答...'
        return
      }
      store.recognition = speechToText()
    } finally {
      store.loading = false
      store.buttonText = '开始识别'
      console.log('onSpeechToText end')
    }
  }

  return (
    <div>
      <button onClick={onSpeechToText} aria-busy={store.loading}>
        {store.buttonText}
      </button>
    </div>
  )
})
