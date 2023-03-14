import classNames from 'classnames'
import { throttle, omit } from 'lodash-es'
import { autorun } from 'mobx'
import { observer, useLocalStore, useObserver } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { useEffectOnce, useMedia, useMount } from 'react-use'
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
  onEnter: () => void
  prompts: Prompt[]
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
      inputFlag: true,
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

    const textareaRef = useRef<HTMLTextAreaElement>(null)

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

    async function selectPrompt(i: number) {
      const detail = store.list[i].detail
      store.value = detail
      props.onChange(detail)
      await new Promise((resolve) => setTimeout(resolve, 0))
      const match = detail.match(/\[[^\]]+\]/)
      if (match) {
        const start = detail.indexOf(match[0])
        const end = start + match[0].length
        textareaRef.current!.setSelectionRange(start, end)
      } else {
        textareaRef.current!.setSelectionRange(detail.length, detail.length)
      }
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
        props.onEnter()
        ev.preventDefault()
        return
      }
      props.onKeyDown?.(ev)
    }
    return (
      <div>
        <ul
          className={classNames(css.prompts, {
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
          {...omit(props, 'value', 'onChange', 'prompts', 'onEnter', 'onInput')}
          value={store.value}
          onInput={onInput}
          onKeyDown={onKeyDown}
        ></textarea>
      </div>
    )
  },
)
