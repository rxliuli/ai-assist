import { observer, useLocalObservable } from 'mobx-react-lite'
import css from './ChatView.module.css'
import classNames from 'classnames'
import ReactMarkdown from 'react-markdown'
import { useMount } from 'react-use'
import { chatGPTAPI } from '../../constants/chatgpt'

interface Message {
  id: string
  source: 'person' | 'bot'
  text: string
  state: 'loading' | 'success' | 'error'
}

const ChatMessage = observer((props: { message: Message }) => {
  return (
    <li className={css.message}>
      <span>{props.message.source === 'person' ? 'You' : 'Bot'}:</span>
      <ReactMarkdown>{props.message.text}</ReactMarkdown>
    </li>
  )
})

export const ChatView = observer(function () {
  const state = useLocalObservable(() => ({
    msg: '',
    messages: [] as Message[],
  }))

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (state.msg.trim().length === 0) {
        event.preventDefault()
        return
      }
      state.messages.push({ id: Math.random().toString(), text: state.msg, source: 'person', state: 'success' })
      state.msg = ''
      event.preventDefault()
    }
  }
  function onInput(event: React.FormEvent<HTMLTextAreaElement>) {
    state.msg = event.currentTarget.value
  }
  useMount(async () => {
    const r = await chatGPTAPI.sendMessage('Hello world!')
    console.log('hello ', r)
  })
  return (
    <div className={classNames('container', css.chat)}>
      <ul className={css.messages}>
        {state.messages.map((it) => (
          <ChatMessage key={it.id} message={it}></ChatMessage>
        ))}
      </ul>
      <footer className={css.footer}>
        <textarea className={css.input} rows={1} value={state.msg} onInput={onInput} onKeyDown={onKeyDown}></textarea>
        <button>Send</button>
      </footer>
    </div>
  )
})
