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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faStop } from '@fortawesome/free-solid-svg-icons'

export interface SystemPrompt {
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

export interface Prompt {
  id: string
  name: string
  content: string
}

interface CompleteInputProps {
  value: string
  onChange: (value: string) => void
  onEnter: (value: string) => void
  onPrompt: (title: string, systemContent: string) => void
  onStop: () => void
  prompts: Prompt[]
  loading?: boolean
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
      list: [] as Prompt[],
      acitve: 0,
      inputFlag: true,
    }))
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const listRef = useRef<List>(null)

    const clacPrompt = throttle(() => {
      const t = store.value.slice(1).toLowerCase()
      store.list = props.prompts.filter((it) => it.name.toLowerCase().includes(t))
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
    }

    useMount(setRows)
    async function onInput(ev: React.FormEvent<HTMLTextAreaElement>) {
      store.value = ev.currentTarget.value
      if (store.promptMode) {
        clacPrompt()
      } else {
        store.list = []
      }
      props.onChange(store.value)
      await new Promise((resolve) => setTimeout(resolve, 0))
      setRows()
    }

    function gotoPrompt(i: number) {
      store.acitve = Math.min(Math.max(0, i), store.list.length - 1)
      listRef.current?.scrollToItem(store.acitve)
    }

    async function selectPrompt(i: number) {
      const item = store.list[i]
      props.onPrompt(item.name, item.content)
      store.value = ''
      props.onChange('')
      ga4.track('chat_event', { eventType: 'chat.selectPrompt', text: item.id })
    }

    async function onEnter() {
      props.onEnter(store.value)
      store.value = ''
      props.onChange(store.value)
      await new Promise((resolve) => setTimeout(resolve, 0))
      setRows()
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
            {observer(({ index, style, data }: ListChildComponentProps<Prompt[]>) => (
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
                {data[index].name}
              </li>
            ))}
          </List>
        </div>
        <textarea
          className={css.textarea}
          ref={textareaRef}
          {...omit(
            props,
            'value',
            'onChange',
            'prompts',
            'onEnter',
            'onInput',
            'className',
            'loading',
            'onPrompt',
            'onStop',
          )}
          value={store.value}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onCompositionStart={() => (store.inputFlag = false)}
          onCompositionEnd={() => (store.inputFlag = true)}
        ></textarea>
        {props.loading ? (
          <FontAwesomeIcon onClick={props.onStop} icon={faStop} className={css.icon} title={t('setting.back')} />
        ) : (
          <FontAwesomeIcon onClick={onEnter} icon={faPaperPlane} className={css.icon} title={t('setting.back')} />
        )}
      </div>
    )
  },
)
