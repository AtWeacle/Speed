import {
  FC,
  useEffect,
  useRef,
} from 'react'
import styled from 'styled-components'

import useStore from '@weacle/speed-client/lib/useStore'
import { MEDIA } from '@weacle/speed-client/theme/constants'

import Message from '@weacle/speed-client/ui/Chat/Messages/Message'
import InternetConnectionDetector from '@weacle/speed-client/ui/InternetConnectionDetector'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: calc(100svh - var(--nav-height) - 100px);
  margin: 5px auto;
  width: calc(100% - 10px);
`
const Messages: FC = () => {
  const messages = useStore((state) => state.messages)
  const messageCount = useRef(0)

  useEffect(() => {
    const thread = document.querySelector('#t38hArd')
    if (messageCount.current < messages.length && thread) {
      setTimeout(() => thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' }), 500)
    }

    messageCount.current = messages.length
  }, [messages])

  return (
    <Wrapper>
      <InternetConnectionDetector />

      {messages?.filter((m) => m.text || (!m.text && m.status !== 'done')).map((message, index) => {
        const previousMessage = messages.filter((m) => m.text || (!m.text && m.status !== 'done'))[index - 1]
        const separateFromPrior: boolean = !!(previousMessage && previousMessage.type !== message.type)

        return (
          <Message
            key={message.id}
            message={message}
            separateFromPrior={separateFromPrior}
          />
        )
      })}
    </Wrapper>
  )
}

export default Messages
