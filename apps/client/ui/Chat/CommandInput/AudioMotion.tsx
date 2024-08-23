import { useEffect, useRef } from 'react'
import styled from 'styled-components'


const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  height: 90px;

  .bar {
    width: 30px;
    height: 30px;
    max-height: 90px;
    background: rgba(var(--c-colors-black-rgb), .4);
    border-radius: 15px;
    /* transition: height .4s ease; */
  }
`

const AudioMotion = () => {
  const bar1Ref = useRef<HTMLDivElement>(null)
  const bar2Ref = useRef<HTMLDivElement>(null)
  const bar3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleAudioData = (event) => {
      if (!bar1Ref.current || !bar2Ref.current || !bar3Ref.current) return

      const rawData = event.detail
      const newData = [
        rawData[2],
        rawData[1],
        rawData[0],
      ]

      const normalizeHeight = (value: number) => {
        // Normalize the value to a range between 30 and 90
        const minHeight = 30
        const maxHeight = 90
        const normalizedValue = ((value / 255) * (maxHeight - minHeight)) + minHeight
        return normalizedValue
      }

      if (newData.length === 3) {
        bar1Ref.current.style.height = `${normalizeHeight(newData[0])}px`
        bar2Ref.current.style.height = `${normalizeHeight(newData[1])}px`
        bar3Ref.current.style.height = `${normalizeHeight(newData[2])}px`
      } else {
        bar1Ref.current.style.height = '30px'
        bar2Ref.current.style.height = '30px'
        bar3Ref.current.style.height = '30px'
      }
    }

    document.addEventListener('audioData', handleAudioData)

    return () => {
      document.removeEventListener('audioData', handleAudioData)
    }
  }, [])

  useEffect(() => {
    const handleAudioDataEnd = () => {
      if (!bar1Ref.current || !bar2Ref.current || !bar3Ref.current) return
      bar1Ref.current.style.height = '30px'
      bar2Ref.current.style.height = '30px'
      bar3Ref.current.style.height = '30px'
    }

    document.addEventListener('audioDataEnd', handleAudioDataEnd)

    return () => {
      document.removeEventListener('audioDataEnd', handleAudioDataEnd)
    }
  }, [])

  return (
    <Wrapper>
      <div ref={bar1Ref} className="bar" />
      <div ref={bar2Ref} className="bar" />
      <div ref={bar3Ref} className="bar" />
    </Wrapper>
  )
}

export default AudioMotion
