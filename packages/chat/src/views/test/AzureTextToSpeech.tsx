import { observer, useLocalStore } from 'mobx-react-lite'
import { azureSpeech } from '../speak/speech/azure'

export const AzureTextToSpeech = observer(() => {
  const state = useLocalStore(() => ({
    text: '你好，世界',
  }))

  async function onStart() {
    await azureSpeech.textToSpeech(state.text)
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
      <textarea
        style={{ overflowY: 'auto' }}
        value={state.text}
        onInput={(ev) => (state.text = ev.currentTarget.value)}
      ></textarea>
      <button onClick={onStart}>识别</button>
    </div>
  )
})
