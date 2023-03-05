import { observer, useLocalObservable } from 'mobx-react-lite'
import css from './ChatView.module.css'
import classNames from 'classnames'
import ReactMarkdown from 'react-markdown'
import { useMount } from 'react-use'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  state: 'loading' | 'success' | 'error'
}

const ChatMessage = observer((props: { message: Message }) => {
  return (
    <li className={css.message}>
      <span>{props.message.role === 'user' ? 'You' : 'Bot'}:</span>
      <div>
        <ReactMarkdown>{props.message.content}</ReactMarkdown>
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
    state.messages.push({ id: Math.random().toString(), content: msg, role: 'user', state: 'success' })
    state.msg = ''
    const resp = await fetch('/chat-stream', {
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
    state.messages.push({ id: Math.random().toString(), content: '', role: 'assistant', state: 'success' })
    const m = state.messages[state.messages.length - 1]
    const reader = resp.body!.getReader()
    let chunk = await reader.read()
    const textDecoder = new TextDecoder()
    const r: string[] = []
    while (!chunk.done) {
      const s = textDecoder.decode(chunk.value)
      m.content += s
      chunk = await reader.read()
    }
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
