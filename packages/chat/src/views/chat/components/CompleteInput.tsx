import classNames from 'classnames'
import { throttle, omit } from 'lodash-es'
import { observer, useLocalStore, useObserver } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { useMedia, useMount } from 'react-use'
import { Assign } from 'utility-types'
import css from './CompleteInput.module.css'
import 'react-virtualized/styles.css'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import { ga4 } from '../../../constants/ga'
import { toJS } from 'mobx'
import { Lang } from '../../../constants/langs'
import { t } from '../../../constants/i18n'

export interface Prompt {
  id: string
  authorId: string
  fallback: Lang
  // langs: https://www.techonthenet.com/js/language_tags.php
  locale: Record<
    Lang,
    {
      title: string
      detail: string
    }
  >
}

interface CompleteInputProps {
  value: string
  onChange: (value: string) => void
  onEnter: (value: string) => void
  onPrompt: (title: string, systemContent: string) => void
  prompts: Prompt[]
  loading?: boolean
}

interface LabelValue {
  id: string
  title: string
  detail: string
}

/**
 * 自动完成的输入框
 * @param props
 * @returns
 */
export const CompleteInput = observer(
  (props: Assign<React.TextareaHTMLAttributes<HTMLTextAreaElement>, CompleteInputProps>) => {
    const store = useLocalStore(() => ({
      value: props.value,
      get promptMode() {
        return store.value.startsWith('/') && !store.value.includes(' ')
      },
      list: [] as LabelValue[],
      acitve: 0,
      inputFlag: true,
    }))
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const listRef = useRef<List>(null)

    const clacPrompt = throttle(() => {
      const language = navigator.language as Lang
      const t = store.value.slice(1).toLowerCase()
      store.list = props.prompts
        .filter(
          (it) =>
            it.locale[language]?.title.toLowerCase().includes(t) ||
            it.locale[it.fallback].title.toLowerCase().includes(t),
        )
        .map((it) => {
          const locale = it.locale[language] ?? it.locale[it.fallback]
          return {
            id: it.id,
            ...locale,
          } as LabelValue
        })
      console.log('list', toJS(store.list))
      store.acitve = 0
      listRef.current?.scrollToItem(0, 'smart')
    }, 500)

    function setRows() {
      const textarea = textareaRef.current
      if (!textarea) {
        return
      }
      // 设置行高
      textarea.style.height = '24px'
      textarea.style.height = textarea.scrollHeight + 'px'

      const maxLines = 5
      // 控制最大高度为4行
      if (textarea.clientHeight >= textarea.scrollHeight) {
        textarea.style.overflowY = 'hidden'
        textarea.style.height = 'auto'
      } else if (
        textarea.clientHeight < textarea.scrollHeight &&
        textarea.clientHeight >= maxLines * parseFloat(window.getComputedStyle(textarea).lineHeight)
      ) {
        textarea.style.overflowY = 'scroll'
        textarea.style.height = maxLines * parseFloat(window.getComputedStyle(textarea).lineHeight) + 'px'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }

    useMount(setRows)
    useObserver(async () => {
      // 这里的声明依赖是必不可少的
      store.value
      await new Promise((resolve) => setTimeout(resolve, 0))
      setRows()
    })

    async function onInput(ev: React.FormEvent<HTMLTextAreaElement>) {
      store.value = ev.currentTarget.value
      if (store.promptMode) {
        clacPrompt()
      } else {
        store.list = []
      }
      props.onChange(store.value)
    }

    function gotoPrompt(i: number) {
      store.acitve = Math.min(Math.max(0, i), store.list.length - 1)
      listRef.current?.scrollToItem(store.acitve)
    }

    async function selectPrompt(i: number) {
      const item = store.list[i]
      props.onPrompt(item.title, item.detail)
      store.value = ''
      props.onChange('')
      ga4.track('chat_event', { eventType: 'chat.selectPrompt', text: item.id })
    }

    function onEnter() {
      props.onEnter(store.value)
      store.value = ''
      props.onChange(store.value)
    }

    const query = useMedia('(max-width: 768px)', false)
    function onKeyDown(ev: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (store.promptMode) {
        if (ev.code === 'ArrowUp') {
          gotoPrompt(store.acitve - 1)
          ev.preventDefault()
          return
        }
        if (ev.code === 'ArrowDown') {
          gotoPrompt(store.acitve + 1)
          ev.preventDefault()
          return
        }
        if (ev.code === 'Enter') {
          selectPrompt(store.acitve)
          ev.preventDefault()
          return
        }
      }
      if (ev.key === 'Enter' && !ev.shiftKey && store.inputFlag && !query) {
        if (!props.loading) {
          onEnter()
        }
        ev.preventDefault()
        return
      }
      props.onKeyDown?.(ev)
    }
    return (
      <div className={classNames(css.newMessage, props.className)}>
        <div
          className={classNames(css.prompts, {
            [css.hide]: !store.promptMode,
          })}
        >
          <List
            ref={listRef}
            itemData={store.list}
            itemCount={store.list.length}
            itemSize={35}
            height={Math.min(store.list.length, 10) * 35}
            width={'100%'}
          >
            {observer(({ index, style, data }: ListChildComponentProps<LabelValue[]>) => (
              <li
                style={style}
                className={classNames(css.prompt, {
                  [css.active]: store.acitve === index,
                })}
                key={data[index].id}
                onClick={() => {
                  selectPrompt(index)
                  textareaRef.current?.focus()
                }}
              >
                {data[index].title}
              </li>
            ))}
          </List>
        </div>
        <textarea
          className={css.textarea}
          ref={textareaRef}
          {...omit(props, 'value', 'onChange', 'prompts', 'onEnter', 'onInput', 'className', 'loading', 'onPrompt')}
          value={store.value}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onCompositionStart={() => (store.inputFlag = false)}
          onCompositionEnd={() => (store.inputFlag = true)}
        ></textarea>
        <button onClick={onEnter} aria-busy={props.loading}>
          {t('message.send')}
        </button>
      </div>
    )
  },
)
