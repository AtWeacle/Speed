import {
  FC,
  useRef,
} from 'react'
import styled from 'styled-components'
import Markdown from 'react-markdown'

import type {
  Message,
} from '@weacle/speed-client/lib/types'

import LoadingIndicator from '@weacle/speed-client/ui/LoadingIndicator'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  font-size: .9rem;
  width:  calc(100% - 30px);
  margin: 0 0 5px;

  [data-theme="dark"] & {
    background: var(--color-black-1);
  }

  &[data-type="system"] {
    align-self: flex-start;
    background: transparent;
  }

  &[data-type="user"] {
    align-self: flex-end;
    padding: 15px;
    white-space: pre-wrap;
    border-radius: var(--c-border-radius);
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
    gap: 20px;

    .c-link {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    a {
      color: var(--color-deepblue);
      text-decoration: underline;
    }

    p {
      margin: 0;
      margin-block-start: 0;
      margin-block-end: 0;
    }

    ul, ol {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 0;
      margin-block-start: 0;
      margin-block-end: 0;
      padding-inline-start: 15px;

      li {
        margin: 0;

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
  const pending = message.status === 'pending'

  if (message.type === 'system') {
    return (
      <Wrapper
        data-margin-top={String(!!separateFromPrior)}
        data-type={message.type}
        ref={systemMessageRef}
      >
        {pending ?
          <LoadingIndicator
            color="var(--color-black)"
            size={24}
            noWrapper
            strokeWidth={8}
          />
        : null}
      
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
                }
              }}
            >
              {message.text}
            </Markdown>
          </div>
        : null}
      </Wrapper>
    )
  }

  return (
    <Wrapper
      data-type={message.type}
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
