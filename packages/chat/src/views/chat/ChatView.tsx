import { observer, useLocalObservable } from 'mobx-react-lite'
import css from './ChatView.module.css'
import classNames from 'classnames'
import ReactMarkdown from 'react-markdown'

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
      <div>
        <ReactMarkdown>{props.message.text}</ReactMarkdown>
      </div>
    </li>
  )
})

export const ChatView = observer(function () {
  const state = useLocalObservable(() => ({
    msg: '',
    messages: [] as Message[],
  }))

  async function onSend() {
    const msg = state.msg
    state.messages.push({ id: Math.random().toString(), text: msg, source: 'person', state: 'success' })
    state.msg = ''
    const resp = await fetch('/chat', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          role: 'user',
          content: msg,
        },
      ]),
    })
    const res = await resp.text()
    state.messages.push({ id: Math.random().toString(), text: res, source: 'bot', state: 'success' })
  }

  async function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (state.msg.trim().length === 0) {
        event.preventDefault()
        return
      }
      event.preventDefault()
      await onSend()
    }
  }
  function onInput(event: React.FormEvent<HTMLTextAreaElement>) {
    state.msg = event.currentTarget.value
  }
  return (
    <div className={classNames('container', css.chat)}>
      <ul className={css.messages}>
        {state.messages.map((it) => (
          <ChatMessage key={it.id} message={it}></ChatMessage>
        ))}
      </ul>
      <footer className={css.footer}>
        <textarea className={css.input} rows={1} value={state.msg} onInput={onInput} onKeyDown={onKeyDown}></textarea>
        <button onClick={onSend}>Send</button>
      </footer>
    </div>
  )
})
