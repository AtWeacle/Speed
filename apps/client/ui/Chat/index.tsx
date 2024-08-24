import styled from 'styled-components'

// import useStore from '@weacle/speed-client/lib/useStore'
import CommandInput from '@weacle/speed-client/ui/Chat/CommandInput'
import Messages from '@weacle/speed-client/ui/Chat/Messages'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 0;
  width: 100%;
  background-color: var(--color-black-2);
  border-radius: calc(var(--c-border-radius) * 1.2) 0 0 calc(var(--c-border-radius) * 1.2);

  .command-nav{
    margin: auto auto 5px auto;
    width: calc(100% - 10px);
  }

  .command-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 25px;
    height: 100%;
  }
`
export default function Chat() {
  // const messages = useStore(state => state.messages)

  return (
    <Wrapper id="t38hArd">
      <Messages />

      {/* {messages?.length === 0 ? <div className="command-wrapper">
        <AudioMotion />
      </div> : null} */}

      <div className="command-nav">
        <CommandInput />
      </div>
    </Wrapper>
  )

}
