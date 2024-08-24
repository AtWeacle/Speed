import styled from 'styled-components'

// import useStore from '@weacle/speed-client/lib/useStore'
import CommandInput from '@weacle/speed-client/ui/Chat/CommandInput'
import Messages from '@weacle/speed-client/ui/Chat/Messages'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 0;
  width: calc(100% - 20px);

  .cmd-shortcuts {
    display: flex;
    gap: 10px;

    button {
      background: transparent;
      padding: 10px 15px;
      color: var(--color-black-4);
      border-radius: calc(var(--c-border-radius) * 1.2);
      border: 1px solid var(--color-black-4);
      max-width: 140px;
      font-size: .9rem;
      text-align: left;
    }

    button:hover {
      background: var(--color-black-4);
    }
  }

  .command-nav {
    position: fixed;
    bottom: 5px;
    left: 50%;
    width: calc(100% - 10px);
    transform: translate(-50%, 0px);
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
