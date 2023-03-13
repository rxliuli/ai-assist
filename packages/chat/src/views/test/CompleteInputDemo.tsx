import { observer, useLocalStore } from 'mobx-react-lite'
import { CompleteInput, Prompt } from '../chat/components/CompleteInput'
import prompts from '../chat/constants/prompts.json'
import css from './CompleteInputDemo.module.css'

export const CompleteInputDemo = observer(() => {
  const store = useLocalStore(() => ({
    value: '/',
  }))
  function onPrompt(prompt: Prompt) {
    console.log(prompt)
  }
  return (
    <div className={css.root}>
      <div></div>
      <CompleteInput
        autoFocus={true}
        value={store.value}
        onChange={(v) => (store.value = v)}
        prompts={prompts}
        onPrompt={onPrompt}
        rows={1}
      ></CompleteInput>
    </div>
  )
})
