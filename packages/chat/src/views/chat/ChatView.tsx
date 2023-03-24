import { observer, useLocalObservable, useLocalStore, useObserver } from 'mobx-react-lite'
import { toJS } from 'mobx'
import css from './ChatView.module.css'
import classNames from 'classnames'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { findLast, last, pick } from 'lodash-es'
import { ReactElement, useEffect, useRef } from 'react'
import { useMount } from 'react-use'
import clipboardy from 'clipboardy'
import { initDatabase, Message, MessageService, PromptService, Session, SessionService } from '../../constants/db'
import { v4 } from 'uuid'
import { router } from '../../constants/router'
import { useParams } from '@liuli-util/react-router'
import { MarkdownContent } from './components/MarkdownContent'
import { getLanguage, t } from '../../constants/i18n'
import { CompleteInput, Prompt, SystemPrompt } from './components/CompleteInput'
import promptData from '../chat/constants/prompts.json'
import { LanguageSelect } from './components/LanguageSelect'
import saveAs from 'file-saver'
import filenamify from 'filenamify'
import { ga4 } from '../../constants/ga'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faClose, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

function sliceMessages(
  messages: Pick<Message, 'role' | 'content'>[],
  max: number,
): [Pick<Message, 'role' | 'content'>[], number] {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  let sum = 0
  const r: Pick<Message, 'role' | 'content'>[] = []
  for (let i = messages.length - 1; i >= 0; i--) {
    const it = messages[i]
    const count = tokenizer.encode(it.content).text.length
    if (sum + count > max) {
      return [r, sum]
    }
    sum += count
    r.unshift(it)
  }
  return [r, sum]
}

const ChatMessage = observer((props: { message: Message }) => {
  return (
    <li className={css.messageBox}>
      <div className={classNames('container', css.message)}>
        <span>{props.message.role === 'user' ? t('message.you') : 'AI'}:</span>
        <div className={css.messageContent}>
          {props.message.role === 'user' ? (
            <div className={css.user}>{props.message.content}</div>
          ) : (
            // <div className={css.user}>{props.message.content}</div>
            <MarkdownContent>{props.message.content}</MarkdownContent>
          )}
        </div>
      </div>
    </li>
  )
})

export const ChatMessages = observer(function (props: {
  messages: Message[]
  activeSession?: Session
  onChangeActiveSessionId(id: string, refresh: boolean): void
  onCreateSession(session: Session): Promise<void>
  onNotifiCreateMessage(message: Message): void
  onNotifiDeleteMessage(id: string): void
  onCopy(): void
  onExport(): void
  onImport(): void
}) {
  const store = useLocalObservable(() => ({
    value: '',
    loading: false,
    abort: null as AbortController | null,
  }))

  const messagesRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    messagesRef.current?.lastElementChild?.scrollIntoView({ behavior: 'auto', block: 'end' })
  }, [props.messages])

  // 保存消息与生成会话
  function onSave(msg: string) {
    const activeSessionId = props.activeSession?.id
    const sessionId = activeSessionId ?? v4()

    const userMsg: Message = {
      id: v4(),
      sessionId: sessionId,
      content: msg.trim(),
      role: 'user',
      date: new Date().toISOString(),
    }
    props.messages.push(userMsg)
    props.onNotifiCreateMessage(userMsg)

    return sessionId
  }
  // 根据前文生成答案，不负责保存用户输入的消息
  async function onGenerate(sessionId: string) {
    try {
      store.loading = true
      store.abort = new AbortController()
      const [list, sum] = sliceMessages(
        props.messages.map((it) => pick(it, 'role', 'content')),
        3000,
      )
      const finalList = [
        {
          role: 'system',
          content:
            "Please return the message in markdown format, don't use h1,h2 etc headings, please do not wrap pictures and links in code blocks",
        },
        ...(props.activeSession?.systemContent
          ? [{ role: 'system', content: props.activeSession!.systemContent }]
          : []),
        ...list,
      ] as Message[]
      console.log('sendMessages ', finalList)
      const start = Date.now()
      const resp = await fetch('/api/chat-stream', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalList),
        signal: store.abort?.signal,
      })
      if (resp.status !== 200) {
        const end = Date.now()
        ga4.track('chat_event', {
          eventType: 'chat.send',
          sessionId,
          requestMessageCount: list.length,
          requestTokens: sum,
          responseTokens: null,
          begin: start,
          end: end,
          time: end - start,
          error: {
            code: resp.status,
            msg: resp.statusText,
          },
        })
        alert(t('message.error.network'))
        return
      }
      props.messages.push({ id: v4(), sessionId, content: '', role: 'assistant', date: new Date().toISOString() })
      const m = props.messages[props.messages.length - 1]
      const reader = resp.body!.getReader()
      let chunk = await reader.read()
      const textDecoder = new TextDecoder()

      async function onGenerated() {
        const activeSessionId = props.activeSession?.id
        const userMsg = findLast(props.messages, (it) => it.role === 'user')!
        if (!activeSessionId) {
          const generateTitle = await fetch('/api/chat', {
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
          const session: Session = { id: sessionId, name: generateTitle, date: new Date().toISOString() }
          props.onCreateSession(session)
          props.onChangeActiveSessionId(sessionId, false)
        }
        props.onNotifiCreateMessage(m)
        const end = Date.now()

        const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
        ga4.track('chat_event', {
          eventType: 'chat.send',
          sessionId,
          requestMessageCount: list.length,
          requestTokens: sum,
          responseTokens: tokenizer.encode(m.content).text.length,
          begin: start,
          end: end,
          time: end - start,
        })
      }

      store.abort?.signal.addEventListener('abort', onGenerated)

      while (!chunk.done) {
        const s = textDecoder.decode(chunk.value)
        m.content += s
        messagesRef.current!.lastElementChild?.scrollIntoView({ behavior: 'auto', block: 'end' })
        chunk = await reader.read()
      }
      new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
        messagesRef.current!.lastElementChild?.scrollIntoView({ behavior: 'auto', block: 'end' })
      })
      await onGenerated()
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.log('abort')
        return
      }
      throw err
    } finally {
      store.loading = false
      store.abort = null
    }
  }

  async function onSend(msg: string) {
    if (store.loading) {
      return
    }
    if (msg.trim().length === 0) {
      return
    }
    const sessionId = onSave(msg)
    messagesRef.current!.lastElementChild!.scrollIntoView({ behavior: 'smooth', block: 'end' })
    await onGenerate(sessionId)
  }

  async function onPrompt(title: string, systemContent: string) {
    const session: Session = {
      id: v4(),
      name: title,
      date: new Date().toISOString(),
      systemContent,
    }
    await props.onCreateSession(session)
    props.onChangeActiveSessionId(session.id, true)
  }

  const promptStore = useLocalStore(() => ({
    prompts: [] as Prompt[],
  }))
  useMount(async () => {
    const db = await initDatabase()
    const service = new PromptService(db)
    const language = getLanguage()
    promptStore.prompts = [
      ...(promptData.prompts as unknown as SystemPrompt[]).map((it) => {
        const locale = it.locale[language] ?? it.locale[it.fallback]
        return {
          id: it.id,
          title: locale.title,
          detail: locale.detail,
        } as Prompt
      }),
      ...(await service.list()),
    ]
  })

  function onStop() {
    store.abort?.abort()
    ga4.track('chat_event', {
      eventType: 'chat.stop',
      sessionId: props.activeSession!.id,
    })
  }
  async function onRegenerate() {
    if (store.loading) {
      return
    }
    const lastMsg = last(props.messages)
    if (!lastMsg || lastMsg.role !== 'assistant') {
      return
    }
    const sessionId = props.activeSession?.id
    if (!sessionId) {
      return
    }
    props.messages.splice(props.messages.length - 1, 1)
    props.onNotifiDeleteMessage(lastMsg.id)
    await onGenerate(sessionId)
    ga4.track('chat_event', {
      eventType: 'chat.regenerate',
      sessionId: props.activeSession!.id,
    })
  }

  return (
    <div className={css.chat}>
      <ul className={css.messages} ref={messagesRef}>
        {props.messages.map((it) => (
          <ChatMessage key={it.id} message={it}></ChatMessage>
        ))}
        <li className={css.messageButtom}></li>
      </ul>
      <footer className={classNames('container', css.messageEditor)}>
        <div className={css.operations}>
          <button onClick={onRegenerate}>{t('message.regenerate')}</button>
          <button onClick={props.onCopy}>{t('session.copy')}</button>
          <button onClick={props.onExport}>{t('session.export')}</button>
          <button onClick={props.onImport}>{t('session.import')}</button>
        </div>
        <CompleteInput
          value={store.value}
          onChange={(value) => (store.value = value)}
          onEnter={onSend}
          onPrompt={onPrompt}
          onStop={onStop}
          prompts={promptStore.prompts}
          className={css.input}
          autoFocus={true}
          loading={store.loading}
        ></CompleteInput>
      </footer>
    </div>
  )
})

const LinkListItem = (props: {
  className?: string
  onClick(ev: React.MouseEvent): void
  left?: ReactElement
  right?: ReactElement
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

const SessionItem = observer(
  (props: {
    active: boolean
    className?: string
    value: string
    onClick(ev: React.MouseEvent): void
    onChange(value: string): void
    onDeleteSession(): void
  }) => {
    const store = useLocalStore(() => ({ value: props.value, edit: false, inputFlag: true }))
    const inputRef = useRef<HTMLInputElement>(null)
    async function onEdit(ev: React.MouseEvent) {
      ev.stopPropagation()
      store.edit = true
      await new Promise((resolve) => setTimeout(resolve, 0))
      inputRef.current!.focus()
    }
    function onCancel() {
      store.edit = false
      store.value = props.value
    }
    const showEdit = useObserver(() => props.active && store.edit)

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === 'Enter' && !event.shiftKey && store.inputFlag) {
        props.onChange(store.value)
        onCancel()
      }
    }
    return (
      <>
        <div
          className={classNames(css.session, {
            [css.active]: props.active,
            [css.hide]: !showEdit,
          })}
        >
          <input
            ref={inputRef}
            value={store.value}
            onInput={(ev) => (store.value = ev.currentTarget.value)}
            className={css.input}
            onBlur={onCancel}
            onKeyDown={onKeyDown}
            onCompositionStart={() => (store.inputFlag = false)}
            onCompositionEnd={() => (store.inputFlag = true)}
          ></input>
          <FontAwesomeIcon className={css.sessionOperator} icon={faClose} onClick={onCancel} />
        </div>
        <LinkListItem
          onClick={props.onClick}
          className={classNames({
            [css.active]: props.active,
            [css.hide]: showEdit,
          })}
          right={
            <>
              {props.active && <FontAwesomeIcon className={css.sessionOperator} icon={faPen} onClick={onEdit} />}
              <FontAwesomeIcon
                className={css.sessionOperator}
                icon={faTrash}
                onClick={(ev) => {
                  ev.stopPropagation()
                  props.onDeleteSession()
                }}
              />
            </>
          }
        >
          {props.value}
        </LinkListItem>
      </>
    )
  },
)

const ChatSidebar = observer(
  (props: {
    sessions: Session[]
    activeSessionId?: string
    onChangeActiveSessionId(id?: string): void
    onDeleteSession(id: string): void
    showSidebar: boolean
    onCloseShowSidebar(): void
    onEditSession(id: string, name: string): void
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
            {t('session.new')}
          </LinkListItem>
          <ul className={css.sessions}>
            {props.sessions.map((it) => (
              <li key={it.id}>
                <SessionItem
                  value={it.name}
                  onChange={(name) => props.onEditSession(it.id, name)}
                  onClick={() => {
                    props.onChangeActiveSessionId(it.id)
                    props.onCloseShowSidebar()
                  }}
                  active={it.id === props.activeSessionId}
                  onDeleteSession={() => props.onDeleteSession(it.id)}
                ></SessionItem>
              </li>
            ))}
          </ul>
          <footer className={css.footer}>
            <LanguageSelect></LanguageSelect>
            <LinkListItem onClick={() => router.push('/setting')}>{t('setting.title')}</LinkListItem>
            <LinkListItem onClick={() => window.open('https://github.com/rxliuli/ai-assist', '_blank')}>
              GitHub
            </LinkListItem>
          </footer>
          <FontAwesomeIcon className={css.close} icon={faClose} onClick={props.onCloseShowSidebar} />
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
      return session?.name ?? t('session.new')
    },
    get activeSession() {
      return this.sessions.find((it) => it.id === this.activeSessionId)
    },
    sessionService: null as SessionService | null,
    messageService: null as MessageService | null,
  }))
  const params = useParams<{ sessionId: string }>()
  useMount(async () => {
    Reflect.set(globalThis, 'store', store)
    Reflect.set(globalThis, 'router', router)
    Reflect.set(globalThis, 'ga4', ga4)
    const db = await initDatabase()
    const sessionService = new SessionService(db)
    const messageService = new MessageService(db)
    store.sessionService = sessionService
    store.messageService = messageService
    store.sessions = await sessionService.list()
    if (params.sessionId && store.sessions.some((it) => it.id === params.sessionId)) {
      store.messages = await messageService.list(params.sessionId)
      store.activeSessionId = params.sessionId
    }
    const s = new URLSearchParams(router.location.search)
    if (s.get('action') === 'newPrompt' && s.has('prompt')) {
      const prompt = { ...JSON.parse(s.get('prompt')!), id: v4() } as Prompt
      const service = new PromptService(db)
      await service.add(prompt)
      const session: Session = {
        id: v4(),
        name: prompt.title,
        date: new Date().toISOString(),
        systemContent: prompt.detail,
      }
      await onCreateSession(session)
      await onChangeActiveSessionId(session.id, true)
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
    store.messages = await store.messageService!.list(id)
  }
  async function onCreateSession(session: Session) {
    store.sessions.unshift(session)
    await store.sessionService!.add(toJS(session))
    router.push(`/${session.id}`)
  }
  async function onNotifiCreateMessage(message: Message) {
    await store.messageService!.add(toJS(message))
  }
  async function onNotifiDeleteMessage(id: string) {
    await store.messageService!.remove(id)
  }
  async function onDeleteSession(sessionId: string) {
    if (!store.sessions.some((it) => it.id === sessionId)) {
      console.log('session not found')
      return
    }
    store.sessions = store.sessions.filter((it) => it.id !== sessionId)
    await store.sessionService!.remove(sessionId)
    if (sessionId === store.activeSessionId) {
      store.activeSessionId = undefined
      store.messages = []
    }
  }
  async function onEditSession(id: string, name: string) {
    const session = store.sessions.find((it) => it.id === id)
    if (!session) {
      throw new Error('找不到 session ' + id)
    }
    session.name = name
    await store.sessionService!.put(toJS(session))
  }

  async function onCopy() {
    if (store.messages.length === 0) {
      window.alert(t('session.copy.empty'))
      return
    }
    const r = store.messages.map((it) => it.content).join('\n\n---\n\n')
    await clipboardy.write(r)
    window.alert(t('session.copy.success'))
    ga4.track('chat_event', { eventType: 'chat.copy', sessionId: store.activeSessionId })
  }

  function onExport() {
    if (store.messages.length === 0) {
      window.alert(t('session.export.empty'))
      return
    }
    const r = {
      session: {
        id: store.activeSessionId,
        name: store.sessionName,
      } as Session,
      messages: store.messages,
    }
    saveAs(
      new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }),
      filenamify(store.sessionName) + '.json',
    )
    ga4.track('chat_event', { eventType: 'chat.export', sessionId: store.activeSessionId })
  }

  function onImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        return
      }
      const r = await file.text()
      try {
        const data = JSON.parse(r) as { session: Session; messages: Message[] }
        if (!data.session || !data.messages) {
          alert(t('session.import.error'))
          return
        }
        const sessionId = v4()
        const session: Session = { id: sessionId, name: data.session.name, date: new Date().toISOString() }
        await store.sessionService!.add(session)
        store.sessions.unshift(session)
        const messages = data.messages.map((it) => ({ ...it, id: v4(), sessionId } as Message))
        await store.messageService!.batchAdd(messages)
        await onChangeActiveSessionId(sessionId, true)
      } catch (e) {
        alert(t('session.import.error'))
        throw e
      }
    }
    input.click()
    ga4.track('chat_event', { eventType: 'chat.import', sessionId: store.activeSessionId })
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
        onEditSession={onEditSession}
      ></ChatSidebar>
      <header className={css.header}>
        <FontAwesomeIcon icon={faBars} onClick={() => (store.showSidebar = true)} />
        <span className={css.ellipsis}>{store.sessionName}</span>
        <FontAwesomeIcon icon={faPlus} onClick={() => onChangeActiveSessionId(undefined, true)} />
      </header>
      <ChatMessages
        activeSession={store.activeSession}
        messages={store.messages}
        onCreateSession={onCreateSession}
        onChangeActiveSessionId={onChangeActiveSessionId}
        onNotifiCreateMessage={onNotifiCreateMessage}
        onNotifiDeleteMessage={onNotifiDeleteMessage}
        onCopy={onCopy}
        onExport={onExport}
        onImport={onImport}
      ></ChatMessages>
    </div>
  )
})
