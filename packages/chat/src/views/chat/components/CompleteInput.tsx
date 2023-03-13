import classNames from 'classnames'
import { throttle, omit } from 'lodash-es'
import { observer, useLocalStore } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Assign } from 'utility-types'
import css from './CompleteInput.module.css'

export interface Prompt {
  id: string
  authorId: string
  fallbackLanguage: string
  locale: Record<
    string,
    {
      title: string
      detail: string
    }
  >
}

interface CompleteInputProps {
  value: string
  onChange: (value: string) => void
  prompts: Prompt[]
  onPrompt: (prompt: Prompt) => void
}

interface LabelValue {
  label: string
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
    }))

    const clacPrompt = throttle(() => {
      const language = navigator.language
      store.list = props.prompts
        .map((it) => {
          const locale = it.locale[language] ?? it.locale[it.fallbackLanguage]
          return {
            title: it.id,
            label: locale.title,
            detail: locale.detail,
          } as LabelValue
        })
        .filter((it) => it.label.includes(store.value.slice(1)))
        .slice(0, 10)
      store.acitve = 0
    }, 500)

    function onChange(ev: React.FormEvent<HTMLTextAreaElement>) {
      store.value = ev.currentTarget.value
      if (store.promptMode) {
        clacPrompt()
      } else {
        store.list = []
      }
      props.onChange(store.value)
    }

    function gotoPrompt(i: number) {
      if (i < 0) {
        store.acitve = store.list.length - 1
        return
      }
      if (i >= store.list.length) {
        store.acitve = 0
        return
      }
      store.acitve = i
    }

    function selectPrompt(i: number) {
      const detail = store.list[i].detail
      store.value = detail
      props.onChange(detail)
    }

    function onKeyDown(ev: React.KeyboardEvent<HTMLTextAreaElement>) {
      console.log('onKeyDown: ', ev.code)
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
    }
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    return (
      <div>
        <ul
          className={classNames({
            [css.hide]: !store.promptMode,
          })}
        >
          {store.list.map((it, i) => (
            <li
              className={classNames(css.prompt, {
                [css.active]: store.acitve === i,
              })}
              key={it.title}
              onClick={() => {
                selectPrompt(i)
                textareaRef.current?.focus()
              }}
            >
              {it.label}
            </li>
          ))}
        </ul>
        <textarea
          ref={textareaRef}
          {...omit(props, 'value', 'onChange', 'prompts', 'onPrompt')}
          value={store.value}
          onInput={onChange}
          onKeyDown={onKeyDown}
        ></textarea>
      </div>
    )
  },
)
