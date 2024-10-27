import React, { useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'

import useStore from '@weacle/speed-client/lib/useStore'
import { nanoid } from '@weacle/speed-lib/utils/nanoid'

import {
  InputWrapper,
  Input,
} from '@weacle/speed-client/ui/Form'
import Button from '@weacle/speed-client/ui/Button'
import ErrorComp from '@weacle/speed-client/ui/Form/ErrorComp'

const projectSchema = z.object({
  name: z.string().min(3, 'Name must have at least 3 characters'),
  path: z.string().min(1, 'Path must have at least 1 character'),
})

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 400px;
  margin: 0 auto;
`
const Title = styled.h2`
  font-size: 1.2rem;
  color: var(--color-black-8);
`
export default function Create({ onClose }: { onClose?: () => void }) {
  const setProject = useStore(state => state.setProject)
  const [name, setName] = useState<string>('')
  const [path, setPath] = useState<string>('')
  const [errors, setErrors] = useState<{ name?: string, path?: string }>({})

  function handleChange(setter: (value: string) => void, value: string) {
    setter(value)
  }

  function handleSubmit() {
    const result = projectSchema.safeParse({ name, path })

    if (!result.success) {
      const fieldErrors = result.error.format()
      setErrors({
        name: fieldErrors.name?._errors[0],
        path: fieldErrors.path?._errors[0],
      })
      return
    }

    setErrors({})
    setProject(nanoid(), { name, path})
    if (onClose) onClose()
  }

  return (
    <Wrapper>
      <Title>
        Create a new project
      </Title>

      <InputWrapper>
        <label>Project name</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => handleChange(setName, e.target.value)}
        />
        {errors.name && <ErrorComp>{errors.name}</ErrorComp>}
      </InputWrapper>
      <InputWrapper>
        <label>Project path</label>
        <Input
          type="text"
          value={path}
          onChange={(e) => handleChange(setPath, e.target.value)}
          placeholder="Absolute path to the project"
        />
        {errors.path && <ErrorComp>{errors.path}</ErrorComp>}
      </InputWrapper>

      <Button onClick={handleSubmit} aria-label="Create project">
        Create
      </Button>
    </Wrapper>
  )
}