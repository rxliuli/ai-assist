import { observer, useLocalObservable, useLocalStore, useObserver } from 'mobx-react-lite'
import { toJS } from 'mobx'
import css from './ChatView.module.css'
import classNames from 'classnames'
import ReactMarkdown from 'react-markdown'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { pick } from 'lodash-es'
import { ReactElement, useRef, useState } from 'react'
import { useMedia, useMediaDevices, useMount } from 'react-use'
import clipboardy from 'clipboardy'
import { initDatabase, Message, MessageService, Session, SessionService } from './utils/db'
import { v4 } from 'uuid'
import { router } from '../../constants/router'
import { useParams } from '@liuli-util/react-router'
import { ReactSVG } from 'react-svg'
import deleteSvg from './assets/delete.svg'
import addSvg from './assets/add.svg'
import closeSvg from './assets/close.svg'
import menuSvg from './assets/menu.svg'

function sliceMessages(messages: Pick<Message, 'role' | 'content'>[], max: number) {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  let sum = 0
  const r: Pick<Message, 'role' | 'content'>[] = []
  for (let i = messages.length - 1; i >= 0; i--) {
    const it = messages[i]
    const count = tokenizer.encode(it.content).text.length
    if (sum + count > max) {
      return r
    }
    sum += count
    r.unshift(it)
  }
  return r
}

const ChatMessage = observer((props: { message: Message }) => {
  return (
    <li className={css.messageBox}>
      <div className={classNames('container', css.message)}>
        <span>{props.message.role === 'user' ? '你' : 'AI'}:</span>
        <div className={css.messageContent}>
          {props.message.role === 'user' ? (
            <div className={css.user}>{props.message.content}</div>
          ) : (
            // <div className={css.user}>{props.message.content}</div>
            <ReactMarkdown>{props.message.content}</ReactMarkdown>
          )}
        </div>
      </div>
    </li>
  )
})

export const ChatMessages = observer(function (props: {
  messages: Message[]
  activeSessionId?: string
  onChangeActiveSessionId(id: string): void
  onCreateSession(session: Session): void
  onNotifiCreateMessage(session: Message): void
}) {
  const state = useLocalObservable(() => ({
    msg: '',
    inputFlag: true,
    get lineCount() {
      return Math.min(Math.max(this.msg.split('\n').length, 1), 4)
    },
  }))

  const messagesRef = useRef<HTMLUListElement>(null)
  useMount(async () => {
    messagesRef.current?.lastElementChild?.scrollIntoView({ behavior: 'auto' })
  })

  async function onSend() {
    if (state.msg.trim().length === 0) {
      return
    }
    const msg = state.msg
    const sessionId = props.activeSessionId ?? v4()

    const userMsg: Message = {
      id: v4(),
      sessionId: sessionId,
      content: msg,
      role: 'user',
      date: new Date().toISOString(),
    }
    props.messages.push(userMsg)
    state.msg = ''
    await new Promise((resolve) => setTimeout(resolve, 0))
    messagesRef.current!.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    const list = sliceMessages(
      props.messages.map((it) => pick(it, 'role', 'content')),
      3000,
    )
    console.log('sendMessages ', list)
    const resp = await fetch('/api/chat-stream', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          role: 'system',
          content:
            "Please return the message in markdown format, don't use h1,h2 etc headings, please do not wrap pictures and links in code blocks",
        },
        ...list,
      ]),
    })
    if (resp.status !== 200) {
      return
    }
    let titleRes: Promise<string> = Promise.resolve('新会话')
    if (!props.activeSessionId) {
      titleRes = fetch('/api/chat', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            role: 'system',
            content:
              'Please summarize the following content into a topic, no more than 10 words, do not add punctuation at the end, please use the original language of the following content',
          },
          {
            role: 'user',
            content: userMsg.content,
          },
        ] as Message[]),
      }).then((res) => res.text())
    }
    props.messages.push({ id: v4(), sessionId, content: '', role: 'assistant', date: new Date().toISOString() })
    const m = props.messages[props.messages.length - 1]
    const reader = resp.body!.getReader()
    let chunk = await reader.read()
    const textDecoder = new TextDecoder()
    while (!chunk.done) {
      const s = textDecoder.decode(chunk.value)
      m.content += s
      if (s.includes('\n')) {
        messagesRef.current!.lastElementChild?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
      chunk = await reader.read()
    }
    new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      messagesRef.current!.lastElementChild?.scrollIntoView({ behavior: 'auto', block: 'end' })
    })
    if (!props.activeSessionId) {
      const session: Session = { id: sessionId, name: await titleRes, date: new Date().toISOString() }
      props.onCreateSession(session)
      props.onChangeActiveSessionId(sessionId)
    }
    props.onNotifiCreateMessage(userMsg)
    props.onNotifiCreateMessage(m)
  }

  const query = useMedia('(max-width: 768px)', false)
  async function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // console.log('event.target', event.key, event.shiftKey, (event.target as any).tagName, state.inputFlag)
    if (event.key === 'Enter' && !event.shiftKey && state.inputFlag && !query) {
      event.preventDefault()
      await onSend()
    }
  }
  function onInput(event: React.FormEvent<HTMLTextAreaElement>) {
    state.msg = event.currentTarget.value
  }

  async function onCopy() {
    if (props.messages.length === 0) {
      window.alert('没有消息')
      return
    }
    const r = props.messages.map((it) => it.content).join('\n\n---\n\n')
    await clipboardy.write(r)
    window.alert('复制成功')
  }

  return (
    <div className={css.chat}>
      <ul className={css.messages} ref={messagesRef}>
        {props.messages.map((it) => (
          <ChatMessage key={it.id} message={it}></ChatMessage>
        ))}
      </ul>
      <footer className={classNames('container', css.footer)}>
        <div className={css.operations}>
          <button onClick={onCopy}>复制会话</button>
        </div>
        <div className={css.newMessage}>
          <textarea
            className={css.input}
            rows={state.lineCount}
            value={state.msg}
            onInput={onInput}
            onCompositionStart={() => (state.inputFlag = false)}
            onCompositionEnd={() => (state.inputFlag = true)}
            onKeyDown={onKeyDown}
          ></textarea>
          <button onClick={onSend}>发送</button>
        </div>
      </footer>
    </div>
  )
})

const LinkListItem = (props: {
  className?: string
  onClick(ev: React.MouseEvent): void
  left?: ReactElement<ReactSVG>
  right?: ReactElement<ReactSVG>
  children: string
}) => {
  return (
    <a className={classNames(css.session, props.className)} onClick={props.onClick}>
      {props.left}
      <span className={classNames(css.ellipsis, css.name)}>{props.children}</span>
      {props.right}
    </a>
  )
}

const links: {
  value: string
  label: string
  link: string
}[] = [{ value: 'github', label: 'GitHub', link: 'https://github.com/rxliuli/ai-assist' }]

const ChatSidebar = observer(
  (props: {
    sessions: Session[]
    activeSessionId?: string
    onChangeActiveSessionId(id?: string): void
    onDeleteSession(id: string): void
    showSidebar: boolean
    onCloseShowSidebar(): void
  }) => {
    return (
      <div
        className={classNames(css.sidebarBox, {
          [css.show]: props.showSidebar,
        })}
        onClick={() => props.showSidebar && props.onCloseShowSidebar()}
      >
        <div
          className={classNames('container', css.sidebar)}
          onClick={(ev) => props.showSidebar && ev.stopPropagation()}
        >
          <LinkListItem
            className={classNames(css.create)}
            onClick={() => {
              props.onChangeActiveSessionId()
              props.onCloseShowSidebar()
            }}
          >
            新会话
          </LinkListItem>
          <ul className={css.sessions}>
            {props.sessions.map((it) => (
              <li key={it.id}>
                <LinkListItem
                  onClick={() => {
                    props.onChangeActiveSessionId(it.id)
                    props.onCloseShowSidebar()
                  }}
                  className={classNames({
                    [css.active]: it.id === props.activeSessionId,
                  })}
                  right={
                    <ReactSVG
                      src={deleteSvg}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        props.onDeleteSession(it.id)
                      }}
                    ></ReactSVG>
                  }
                >
                  {it.name}
                </LinkListItem>
              </li>
            ))}
          </ul>
          <footer>
            {links.map((it) => (
              <LinkListItem key={it.value} onClick={() => window.open(it.link, '_blank')}>
                {it.label}
              </LinkListItem>
            ))}
          </footer>
          <button className={css.close} onClick={props.onCloseShowSidebar}>
            <ReactSVG src={closeSvg}></ReactSVG>
          </button>
        </div>
      </div>
    )
  },
)

export const ChatHomeView = observer(() => {
  const store = useLocalStore(() => ({
    activeSessionId: undefined as string | undefined,
    sessions: [] as Session[],
    messages: [] as Message[],
    showSidebar: false,
    get sessionName() {
      const session = this.sessions.find((it) => it.id === this.activeSessionId)
      return session?.name ?? '新会话'
    },
  }))
  const [sessionService, setSessionService] = useState<SessionService>()
  const [messageService, setMessageService] = useState<MessageService>()
  const params = useParams<{ sessionId: string }>()
  useMount(async () => {
    Reflect.set(globalThis, 'store', store)
    Reflect.set(globalThis, 'router', router)
    const db = await initDatabase()
    const sessionService = new SessionService(db)
    const messageService = new MessageService(db)
    setSessionService(sessionService)
    setMessageService(messageService)
    store.sessions = await sessionService.list()
    if (params.sessionId && store.sessions.some((it) => it.id === params.sessionId)) {
      store.messages = await messageService.list(params.sessionId)
      store.activeSessionId = params.sessionId
    }
  })
  async function onChangeActiveSessionId(id?: string, refresh?: boolean) {
    store.activeSessionId = id
    router.replace(`/${store.activeSessionId ?? ''}`)
    if (!refresh) {
      return
    }
    if (!id) {
      store.messages = []
      return
    }
    store.messages = await messageService!.list(id)
  }
  async function onCreateSession(session: Session) {
    store.sessions.unshift(session)
    await sessionService!.add(toJS(session))
    router.push(`/${session.id}`)
  }
  async function onNotifiCreateMessage(message: Message) {
    await messageService!.add(toJS(message))
  }
  async function onDeleteSession(sessionId: string) {
    if (!store.sessions.some((it) => it.id === sessionId)) {
      console.log('session not found')
      return
    }
    store.sessions = store.sessions.filter((it) => it.id !== sessionId)
    await sessionService!.remove(sessionId)
    if (sessionId === store.activeSessionId) {
      store.activeSessionId = undefined
      store.messages = []
    }
  }
  return (
    <div className={css.chatHome}>
      <ChatSidebar
        sessions={store.sessions}
        activeSessionId={store.activeSessionId}
        onChangeActiveSessionId={(id) => onChangeActiveSessionId(id, true)}
        onDeleteSession={onDeleteSession}
        showSidebar={store.showSidebar}
        onCloseShowSidebar={() => (store.showSidebar = false)}
      ></ChatSidebar>
      <header className={css.header}>
        <button onClick={() => (store.showSidebar = true)}>
          <ReactSVG src={menuSvg}></ReactSVG>
        </button>
        <span className={css.ellipsis}>{store.sessionName}</span>
        <button onClick={() => onChangeActiveSessionId(undefined, true)}>
          <ReactSVG src={addSvg}></ReactSVG>
        </button>
      </header>
      <ChatMessages
        activeSessionId={store.activeSessionId}
        messages={store.messages}
        onCreateSession={onCreateSession}
        onChangeActiveSessionId={(id) => onChangeActiveSessionId(id, false)}
        onNotifiCreateMessage={onNotifiCreateMessage}
      ></ChatMessages>
    </div>
  )
})
