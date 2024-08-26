import styled from 'styled-components'
import {
  Copy,
  CopyCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'

const Button = styled.button`
  padding: 0;
  color: var(--color-black-8);
  border: none;
  background: none;
  display: flex;
  align-items: center;
  margin: 0 0 0 auto;

  &:hover {
    svg {
      stroke: var(--color-black-9);
    }
  }

  &[data-copied="true"] svg {
    stroke: var(--color-green);
  }

  svg {
    transition: stroke .2s;
  }
`

function CopyButton({
  content,
}: {
  content: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(content)
        setCopied(true)
      }}
      data-copied={copied}
    >
      {copied ? (
        <CopyCheck size={16} color="var(--color-green)" />
      ) : (
        <Copy size={16} color="var(--color-black-7)" />
      )}
    </Button>
  )
}

export default CopyButton