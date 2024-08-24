import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: clip;
  flex-shrink: 0;
  background: hsl(var(--color-black-hs), 8%);
  border-radius: calc(var(--border-radius) * 1.5);
  padding: 10px;

  [data-theme="light"] & {
    background: hsl(var(--color-black-hs), 100%);
  }
`
export const Controls = styled.div`
  display: flex;
  width: 100%;
  gap: 5px;
  margin: 0;

  button {
    gap: 4px;
    font-size: .85rem;
  }

  .rotateit {
    opacity: 1;
    animation: rotateIcon 3s linear infinite;
    transform: scale(-1, 1) rotate(0deg);
    margin: 0;
  }

  @keyframes rotateIcon {
    0% {
      transform: scale(-1, 1) rotate(0deg);
    }
    100% {
      transform: scale(-1, 1) rotate(-360deg);
    }
  }
`
export const Info = styled.div`
  display: flex;
  font-size: .75rem;
  color: rgba(var(--color-black-rgb), .5);
`