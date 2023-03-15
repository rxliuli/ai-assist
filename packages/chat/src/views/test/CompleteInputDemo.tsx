import { observer, useLocalStore } from 'mobx-react-lite'
import { CompleteInput, Prompt } from '../chat/components/CompleteInput'
import promptData from '../chat/constants/prompts.json'
import css from './CompleteInputDemo.module.css'

export const CompleteInputDemo = observer(() => {
  const store = useLocalStore(() => ({
    value: '',
  }))
  return (
    <div className={css.root}>
      <div></div>
      <div className={css.box}>
        <CompleteInput
          autoFocus={true}
          value={store.value}
          onChange={(v) => (store.value = v)}
          onPrompt={(title, content) => console.log('prmopt', title, content)}
          prompts={promptData.prompts as any}
          onEnter={(value) => console.log('enter', value)}
        ></CompleteInput>
      </div>
    </div>
  )
})
