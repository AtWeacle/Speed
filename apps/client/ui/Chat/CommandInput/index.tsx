import React, {
  useEffect,
  useState,
  useRef,
} from 'react'
import styled from 'styled-components'
import {
  Mic,
  SendHorizontal,
  Trash2,
} from 'lucide-react'
import useWebSocket from 'react-use-websocket'

import useStore from '@weacle/speed-client/lib/useStore'
import { nanoid } from '@weacle/speed-client/lib/utils/nanoid'

import { MEDIA } from '@weacle/speed-client/theme/constants'
import { WS_URL } from '@weacle/speed-client/lib/constants'
import type {
  MessageStatus,
} from '@weacle/speed-client/lib/types'

import Button from '@weacle/speed-client/ui/Button'
import Textarea from '@weacle/speed-client/ui/Textarea'
import CircleWithAnimatedBorder from '@weacle/speed-client/ui/Recording/CircleWithAnimatedBorder'

const AUDIO_DURATION = 60
const MAX_PROMPT_LENGTH = 20000

const Wrapper = styled.div`
  margin: 0 auto 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  top: 0;
  transition: top .15s ease-in-out;

  ${MEDIA.XS} {
    margin: 0 auto 0;
    max-width: 480px;
  }

  ${MEDIA.SM} {
    max-width: 700px;
  }

  &[data-context="editor"] {
    margin: 0 auto;
    
    ${MEDIA.XS} {
      max-width: 700px;
    }
  }

  .stop {
    border-radius: 2px;
    background: rgba(var(--c-colors-red-rgb), 1);
    width: 10px;
    height: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .circle-marker {
    border-radius: 50%;
    border: 1px solid rgba(var(--c-colors-red-rgb), .4);
    width: 28px;
    height: 28px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .command-input {
    background-color: rgba(var(--c-colors-white-rgb), .3);
  }
`
const InputWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border: 2px solid rgba(var(--c-colors-black-rgb), .6);
  border-radius: calc(var(--c-border-radius) * 1.4);
  transition: border .2s ease-in-out;
  background-color: rgba(var(--c-colors-white-rgb), .3);
  position: relative;
  padding: 6px 4px 6px 10px;

  &[data-focused="true"] {
    border-color: rgba(var(--c-colors-orange-rgb), 1);
    background-color: rgba(var(--c-colors-white-rgb), 1);
  }

  &[data-valid="false"] {
    border-color: rgba(var(--c-colors-red-rgb), 1);
  }

  &[data-has-content="true"] {
    svg.stop-icon path {
      fill: rgba(var(--c-colors-black-rgb), 1);
    }
  }

  &[data-has-content="true"][data-loading="true"] {
    svg.stop-icon path {
      fill: rgba(var(--c-colors-red-rgb), 1);
    }
  }

  svg.stop-icon {
    width: 28px;
  }

  ${MEDIA.XS} {
    svg.stop-icon {
      width: 32px;
    }
  }

  [data-context="editor"] & {
    border: 0 solid rgba(var(--c-colors-black-rgb), .2);
    /* background-color: rgba(var(--c-colors-black-rgb), .08); */
    background: hsl(var(--c-colors-black-hs), 12%);

    &[data-focused="true"] {
      border-color: rgba(var(--c-colors-black-rgb), .25);
    }
  }

  [data-theme="light"] [data-context="editor"] & {
    background: hsl(var(--c-colors-black-hs), 100%);
  }

  .command-input {
    padding: 5px;
    min-height: 24px;
    resize: none;
    font-size: .9rem;
    color: rgba(var(--c-colors-black-rgb), 1);
    font-weight: 500;
    background: transparent;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    position: relative;
    z-index: 2;
    padding: 8px 0;
    
    &::placeholder {
      color: rgba(var(--c-colors-black-rgb), 1);
    }

    ${MEDIA.XS} {
      font-size: 1rem;
    }

    ${MEDIA.SM} {
      font-size: 1.1rem;
    }

    [data-context="editor"] & {
      color: rgba(var(--c-colors-black-rgb), .9);
      font-size: 1rem;
      font-weight: 400;

      &::placeholder {
        color: rgba(var(--c-colors-black-rgb), .7);
      }

      ${MEDIA.XS} {
        font-size: 1rem;
      }

      ${MEDIA.SM} {
        font-size: 1rem;
      }
    }
  }
`
const Counter = styled.span`
  display: flex;
  margin: 5px 5px 0 auto;
  color: rgba(var(--c-colors-gray-rgb), 1);
  font-size: .65rem;
  width: max-content;
  height: fit-content;
  position: absolute;
  bottom: -20px;
  right: 0;

  &[data-valid="false"] {
    color: rgba(var(--c-colors-red-rgb), 1);
  }

  [data-context="editor"] & {
    top: -22px;
  }
`
export default function CommandInput({
  showCounter = false,
}: {
  showCounter?: boolean
}) {
  const setActiveMessageId = useStore(state => state.setActiveMessageId)
  const addMessage = useStore(state => state.addMessage)
  const clearActions = useStore(state => state.clearActions)
  const prompt = useStore(state => state.prompt)
  const setPrompt = useStore(state => state.setPrompt)
  const answering = useStore(state => state.answering)
  const setAnswering = useStore(state => state.setAnswering)
  const setErrors = useStore(state => state.setErrors)

  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const drawRef = useRef<number | null>(null)
  const sendRecording = useRef<boolean>(false)

  const inputWrapperRef = useRef<HTMLDivElement>(null)

  const [focused, setFocused] = useState(false)
  const valid = prompt.length <= MAX_PROMPT_LENGTH

  const { sendJsonMessage, lastMessage, getWebSocket } = useWebSocket(WS_URL, {
    share: true,
    onMessage: (event) => {
      const { data: rawData } = event

      if (!rawData) {
        setAnswering(false)
        return
      }

      try {
        const data = JSON.parse(rawData)
        const { activeMessageId, updateMessage } = useStore.getState()

        if (data.text) {
          const { text } = data
          streamResponse(text, data.status)
        }

        if (data.status === 'done') {
          setAnswering(false)

          if (activeMessageId) {
            updateMessage(activeMessageId, { status: 'done' })
          }
        }

        if (data.transcription && data.messageId) {
          const { transcription, messageId } = data
          updateMessage(messageId, { text: transcription })
        }

        if (data.files) {
          if (activeMessageId) {
            const { files } = data
            updateMessage(activeMessageId, { files })
            // document.dispatchEvent(new CustomEvent('we.chat.message.scrollBottom'))
          }
        }

      } catch (error) {
        console.error('Error parsing JSON data: ', error)
      }
    },
  })

  useEffect(() => {
    if (!recording) return

    setTimeout(() => {
      if (recording) endRecording()
    }, AUDIO_DURATION * 1000)

    // return () => {
    //   if (recording) endRecording()
    // }
  }, [recording])

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setPrompt(value)
  }

  function getValue(value: string) {
    if (value === '') return ''
    if (value?.length > MAX_PROMPT_LENGTH) return value.slice(0, MAX_PROMPT_LENGTH)
    return value
  }

  function onMouseDown(event: React.MouseEvent<HTMLInputElement>) {
    event.stopPropagation()
  }

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const validatedValue = getValue(event.target.value)
    setPrompt(validatedValue)
    setFocused(false)
  }

  function onFocus() {
    setFocused(true)
    setPrompt(prompt ?? '')
  }

  function onClickSend(event: React.SyntheticEvent<HTMLButtonElement | HTMLAnchorElement>) {
    sendCommand(prompt)
    setPrompt('')

    const inputElement = document.querySelector('.command-input') as HTMLTextAreaElement
    inputElement.style.height = 'auto'
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const inputElement = event.target as HTMLTextAreaElement

    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      const value = inputElement.value
      const start = inputElement.selectionStart ?? 0
      const end = inputElement.selectionEnd ?? 0
      const newValue = `${value.slice(0, start)}\n${value.slice(end)}`
      inputElement.value = newValue
      inputElement.setSelectionRange(start + 1, start + 1)

    } else if (event.key === 'Enter') {
      event.preventDefault()
      const validatedValue = getValue(inputElement.value)
      setPrompt(validatedValue)
      if (validatedValue) sendCommand(validatedValue)
      
    } else if (event.key === 'Escape') {
      setFocused(false)
      setPrompt(prompt ?? '')
      inputElement.blur()
    }

    setTimeout(() => {
      inputElement.style.height = 'auto'
      inputElement.style.height = `${Math.max(24, Math.min(inputElement.scrollHeight, 150))}px`
    }, 0)
  }

  function updateHeight(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const inputElement = event.target as HTMLTextAreaElement
    setTimeout(() => {
      inputElement.style.height = 'auto'
      inputElement.style.height = `${Math.max(24, Math.min(inputElement.scrollHeight, 150))}px`
    }, 0)
  }

  function streamResponse(text: string, status: MessageStatus = 'pending') {
    console.log('\n => streamResponse')
    const { activeMessageId, messages, updateMessage } = useStore.getState()
    const activeMessage = messages.find(message => message.id === activeMessageId)

    console.log('\t activeMessage', activeMessage)

    if (!activeMessage) return

    const newText = (activeMessage.text || '') + text
    const update = { text: newText, status }
    updateMessage(activeMessage.id, update)
  }

  async function sendCommand(prompt: string) {
    if (!prompt) return
    await sendCommandMutation({ prompt })
  }

  async function sendCommandMutation({
    audio,
    prompt,
  }: {
    audio?: Blob
    prompt?: string
  }) {
    if (answering) return

    const audioUrl = audio ? URL.createObjectURL(audio) : undefined

    const userMessageId = nanoid()
    addMessage({ id: userMessageId, audio: audioUrl, text: prompt?.trim(), type: 'user' })
    setPrompt('')

    const systemMessageId = nanoid()
    addMessage({ id: systemMessageId, status: 'pending', type: 'system' })
    setActiveMessageId(systemMessageId)

    const thread = document.querySelector('#t38hArd')
    if (thread) {
      setTimeout(() => thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' }), 500)
    }

    // const audioBase64 = audio ? await convertBlobToBase64(audio) : null
    // const messageIdToTranscribe = audio ? userMessageId : undefined

    setAnswering(true)
    clearActions()

    sendJsonMessage({
      // audio: audioBase64,
      // messageIdToTranscribe,
      text: prompt?.trim(),
    })
  }

  function handleCancel() {
    setAnswering(false)
    endRecording(true)
    setErrors({})
  }

  function endRecording(cancel: boolean = false) {
    sendRecording.current = !cancel
    mediaRecorderRef.current?.stop()
    document.dispatchEvent(new CustomEvent('audioDataEnd'))

    if (drawRef.current) {
      cancelAnimationFrame(drawRef.current)
      drawRef.current = null
    }

    setRecording(false)
  }

  async function handleMic() {
    if (recording) return endRecording()
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new window.AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 32
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const draw = () => {
        analyser.getByteFrequencyData(dataArray)
        document.dispatchEvent(new CustomEvent('audioData', { detail: [...dataArray] }))
        drawRef.current = requestAnimationFrame(draw)
      }

      draw()

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        if (sendRecording.current) {
          sendRecording.current = false
          
          const audioBlob = new Blob(audioChunksRef.current, { 'type': 'audio/mpeg' })
          sendCommandMutation({ audio: audioBlob })
        }

        stream.getTracks().forEach(track => track.stop())

        if (drawRef.current) {
          cancelAnimationFrame(drawRef.current)
        }
      }

      mediaRecorderRef.current.start()
      setRecording(true)
      
    } catch (error) {
      console.error('Error accessing the microphone: ', error)
    }
  }


  return (
    <Wrapper>
      <InputWrapper
        data-focused={focused ? 'true' : 'false'}
        data-valid={valid ? 'true' : 'false'}
        data-loading={answering ? 'true' : 'false'}
        data-has-content={prompt.length ? 'true' : 'false'}
        ref={inputWrapperRef}
      >
        <Textarea
          className="command-input"
          autoComplete="off"
          rows="1"
          dir="auto"
          spellCheck={false}
          placeholder={"Type a prompt..."}
          value={prompt ?? ''}
          onMouseDown={onMouseDown}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onCut={updateHeight} 
          onCopy={updateHeight} 
          onPaste={updateHeight} 
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={answering}
        />
        
        {recording
          ? prompt.length > 0 ? <Button
            onClick={onClickSend}
            appearance="text"
            title="Send"
            style={{ paddingRight: '7px', paddingLeft: '5px', width: 'fit-content' }}
          >
            <SendHorizontal />
          </Button> : <Button
            onClick={handleMic}
            appearance="text"
            disabled={!valid}
            style={{ paddingRight: '7px', paddingLeft: '5px', width: 'fit-content' }}
          >
            <Mic />
          </Button>
          : <>
            <Button
              onClick={handleCancel}
              appearance="text"
              title="Cancel"
              style={{ paddingRight: '5px', paddingLeft: '5px', position: 'relative' }}
            >
              <Trash2 />
            </Button>
            <Button
              onClick={handleMic}
              appearance="text"
              title="Stop"
              style={{ paddingRight: '5px', paddingLeft: '5px', position: 'relative' }}
            >
              <CircleWithAnimatedBorder duration={AUDIO_DURATION} />
              <span className="stop"></span>
              <span className="circle-marker"></span>
            </Button>
          </>
        }

        {MAX_PROMPT_LENGTH && showCounter ?
          <Counter
            data-valid={valid ? 'true' : 'false'}
          >
            {prompt.length} / {MAX_PROMPT_LENGTH}
          </Counter>
        : null}
      </InputWrapper>
    </Wrapper>
  )
}
