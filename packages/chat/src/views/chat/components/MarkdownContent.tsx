import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import css from './MarkdownContent.module.css'
import clipboardy from 'clipboardy'
import { observer } from 'mobx-react-lite'
import React, { ReactNode, useState } from 'react'
import classNames from 'classnames'
import { useUnmount } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { t } from '../../../constants/i18n'

function attrs(o: Record<string, [pre: boolean, val: string]>) {
  return Object.entries(o).reduce((r, [k, v]) => {
    if (v[0]) {
      return r
    }
    return { ...r, [k]: v[1] }
  }, {})
}

const ClickTooltip = (props: { className?: string; children: ReactNode }) => {
  const [tip, setTip] = useState(t('message.code.copy'))
  return (
    <span
      onClick={() => setTip(t('message.code.copied'))}
      className={props.className}
      data-placement={'left'}
      data-tooltip={tip}
      onMouseLeave={() => setTip(t('message.code.copy'))}
    >
      {props.children}
    </span>
  )
}

const CopyButton = (props: { children: ReactNode }) => {
  return (
    <ClickTooltip className={css.copy}>
      <FontAwesomeIcon icon={faCopy} onClick={() => clipboardy.write(String(props.children))} />
    </ClickTooltip>
  )
}

export const MarkdownContent = (props: { children: string }) => {
  return (
    <ReactMarkdown
      className={css.MarkdownContent}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          if (inline) {
            return (
              <code className={classNames(className)} {...props}>
                {children}
              </code>
            )
          }
          return inline ? (
            <code className={classNames(className)} {...props}>
              {children}
            </code>
          ) : match ? (
            <>
              <CopyButton>{children}</CopyButton>
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
                {...props}
              />
            </>
          ) : (
            <>
              <CopyButton>{children}</CopyButton>
              <code className={classNames(className)} {...props}>
                {children}
              </code>
            </>
          )
        },
      }}
    >
      {props.children}
    </ReactMarkdown>
  )
}
