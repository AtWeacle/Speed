import {
  FC,
  useRef,
} from 'react'
import styled from 'styled-components'
import Markdown from 'react-markdown'

import { MEDIA } from '@weacle/speed-client/theme/constants'
import type {
  Message,
} from '@weacle/speed-client/lib/types'

import LoadingIndicator from '@weacle/speed-client/ui/LoadingIndicator'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(var(--color-coralpink-rgb), .4);
  
  line-height: 1.5;
  font-size: .9rem;
  max-width: 90%;
  margin: 0 0 5px;

  ${MEDIA.SM} {
    max-width: calc(90%);
  }

  [data-theme="dark"] & {
    background: rgba(var(--color-black-rgb), .2);
  }

  &[data-type="system"] {
    align-self: flex-start;
    background: transparent;
  }

  &[data-type="user"] {
    align-self: flex-end;
    padding: 15px;
    white-space: pre-wrap;
    border-radius: calc(var(--c-border-radius) * 1.5) calc(var(--c-border-radius) * 1.5) 0;
  }

  &[data-margin-top="true"] {
    margin-top: 20px;
  }

  .top {
    display: flex;
    gap: 5px;
  }

  .message-text {
    background: rgba(var(--color-blue-rgb), .7);
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: calc(var(--c-border-radius) * 1.5) calc(var(--c-border-radius) * 1.5) calc(var(--c-border-radius) * 1.5) 0;

    [data-theme="dark"] & {
      background: rgba(var(--color-blue-rgb), .15);
    }

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

  .file {
    cursor: pointer;
    transition: transform .2s;
    width: fit-content;
  }

  .file:hover {
    transform: scale(1.01);
  }

  img {
    border-radius: calc(var(--c-border-radius) * 1.5);
    max-width: 100%;

    ${MEDIA.SM} {
      max-width: 600px;
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
