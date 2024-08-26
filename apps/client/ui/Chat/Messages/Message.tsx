import {
  FC,
  useRef,
} from 'react'
import styled from 'styled-components'
import Markdown from 'react-markdown'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'

import type {
  Message,
} from '@weacle/speed-lib/types'

import CopyButton from '@weacle/speed-client/ui/Chat/Messages/CopyButton'
// import LoadingIndicator from '@weacle/speed-client/ui/LoadingIndicator'
import customStyle from '@weacle/speed-client/ui/Chat/Messages/syntaxHighlighterStyles/hljs/custom'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  font-size: .9rem;
  width:  calc(100% - 30px);
  margin: 0 0 5px;
  word-wrap: break-word;

  [data-theme="dark"] & {
    background: oklch(from var(--color-black) calc(l + 0.25) c h);
    outline: 1px solid var(--color-black-4);
    outline-offset: -1px;
  }

  &[data-role="system"] {
    align-self: flex-start;
    background: transparent;
    outline: none;
  }

  &[data-role="user"] {
    align-self: flex-end;
    padding: 15px;
    white-space: pre-wrap;
    border-radius: var(--border-radius);
  }

  &[data-margin-top="true"] {
    margin-top: 20px;
  }

  .top {
    display: flex;
    gap: 5px;
  }

  .message-text {
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .c-link {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    a {
      color: var(--color-deepblue);
      text-decoration: underline;
    }

    code.c-code {
      font-weight: 600;

      &::before, &::after {
        content: '\`';
      }
    }

    .code-block {
      .code-top {
        background: var(--color-black-3);
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        color: var(--color-black-8);
        font-size: .8rem;
        padding: 5px 10px;
        display: flex;
        align-items: center;
      }
    }

    p {
      margin: 0;
      margin-block-start: 0;
      margin-block-end: 0;
    }

    ul, ol {
      margin: 0;
      padding-left: 1.625em;

      li {
        margin: 0;
        padding-left: .375em;

        &:first-child {
          margin: 0;
        }

        ul, ol {
          gap: 2px;
        }
      }
    }
  }
`
const Message: FC<{
  message: Message
  separateFromPrior?: boolean
}> = ({
  message,
  separateFromPrior,
}) => {
  const systemMessageRef = useRef<HTMLDivElement>(null)
  // const pending = message.status === 'pending'

  if (message.role === 'system') {
    return (
      <Wrapper
        data-margin-top={String(!!separateFromPrior)}
        data-role={message.role}
        ref={systemMessageRef}
      >
      
        {message.text ?
          <div className="message-text">
            <Markdown
              components={{
                a(props: any) {
                  const { node, ...rest } = props
                  return (
                    <div className="c-link">
                      <a {...rest} target="_blank" />
                    </div>
                  )
                },
                code(props) {
                  const {children, className, node, ...rest} = props
                  const match = /language-(\w+)/.exec(className || '')
                  
                  return match ? (
                    <div className="code-block">
                      <div className="code-top">
                        <span className="code-lang">{match[1]}</span>
                        <CopyButton content={String(children).replace(/\n$/, '')} />
                      </div>

                      <SyntaxHighlighter
                        {...rest}
                        ref={null}
                        PreTag="div"
                        children={String(children).replace(/\n$/, '')}
                        language={match[1]}
                        style={customStyle}
                      />
                    </div>
                  ) : (
                    <code {...rest} className={`${className ? className : ''} c-code`}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.text}
            </Markdown>
          </div>
        : null}

        {/* {pending ?
          <LoadingIndicator
            size={24}
            // noWrapper
            strokeWidth={5}
          />
        : null} */}
      </Wrapper>
    )
  }

  return (
    <Wrapper
      data-role={message.role}
      data-margin-top={String(!!separateFromPrior)}
    >
      {message.audio ?
        <audio controls>
          <source src={message.audio} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      : null}

      {message.text}
    </Wrapper>
  )
}

export default Message
