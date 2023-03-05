import { observer, useLocalStore } from 'mobx-react-lite'
import ReactMarkdown from 'react-markdown'
import { azureSpeech } from '../speak/speech/azure'

export const AzureSpeechToText = observer(() => {
  const state = useLocalStore(() => ({
    text: '',
    recognition: null as {
      value: () => Promise<string>
      stop: () => void
    } | null,
  }))

  async function onStart() {
    if (!state.recognition) {
      console.log('开始识别')
      state.recognition = await azureSpeech.speechToText((msg) => {
        state.text = msg
      })
      return
    }
    state.recognition.stop()
    const r = await state.recognition.value()
    console.log('result', r)
  }

  return (
    <div
      className={'container'}
      style={{
        display: 'grid',
        gridTemplateRows: '1fr auto',
        height: '100%',
      }}
    >
      <div style={{ overflowY: 'auto' }}>
        <ReactMarkdown>{state.text}</ReactMarkdown>
      </div>
      <button onClick={onStart}>识别</button>
    </div>
  )
})
