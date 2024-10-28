import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { X, Loader2 } from 'lucide-react'

import { MEDIA } from '@weacle/speed-client/theme/constants'
import { SERVER_URL } from '@weacle/speed-client/lib/constants'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: calc(100% - 28px);
  border: 0px solid var(--color-black-3);
  border-radius: calc(var(--border-radius) * .8);
  transition: border .2s ease-in-out;
  background-color: var(--color-black-0);
  position: relative;
  padding: 0px 4px 0px 10px;
  margin: 4px auto 0;

  &[data-valid="false"] {
    border-color: var(--color-red);
  }

  button {
    width: 42px;
    height: 30px;
  }
`
const Input = styled.input`
  min-height: 20px;
  resize: none;
  font-size: .8rem;
  color: var(--color-black-8);
  background: transparent;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  position: relative;
  z-index: 2;
  padding: 8px 0;
  width: 100%;
  
  &::placeholder {
    color: var(--color-black-7);
  }
`
const LoaderIcon = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: var(--color-black-8);

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
const SuggestionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-black-3);
  border: 1px solid var(--color-black-4);
  border-radius: var(--border-radius);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
`

const SuggestionItem = styled.li`
  padding: 3px 12px;
  cursor: pointer;
  font-size: .85rem;
  color: var(--color-black-8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  transition: background-color .2s;

  &:hover {
    background-color: var(--color-black-1);
  }
`
const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-black-8);
  width: 24px !important;
  height: 24px !important;
  border-radius: 50%;
  transition: background-color .2s;

  &:hover {
    background-color: var(--color-black-2);
  }
`
function FileSearch() {
  const projectPath = useProjectStore(state => state.path)
  const setSearch = useProjectStore(state => state.setSearch)
  const search = useProjectStore(state => state.search)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
  }, [])

  async function fetchSuggestions() {
    try {
      setLoading(true)

      const response = await axios.get(`${SERVER_URL}/api/file-index/search`, {
        params: { search }
      })
      const simplePaths = response.data.paths.map((p: string) => p.replace(projectPath+'/', ''))
      setSuggestions(simplePaths)

    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSuggestionClick(path: string) {
    setSearch(path)
    setSuggestions([])
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      fetchSuggestions()

    } else if (event.key === 'Escape') {
      setSearch('')
      setSuggestions([])
    }
  }

  function handleClose() {
    setSearch('')
    setSuggestions([])
  }

  return (
    <Wrapper>
      <InputWrapper>
        <Input
          className="Input"
          type="text"
          id="search"
          autoComplete="off"
          placeholder="Search file"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {loading ? <LoaderIcon size={16} /> : null}

        {suggestions.length > 0 ? (
          <CloseButton onClick={handleClose}>
            <X size={16} />
          </CloseButton>
        ) : null}

        {suggestions.length > 0 ? (
          <SuggestionList>
            {suggestions.map((path, index) => (
              <SuggestionItem
                key={index}
                onClick={() => handleSuggestionClick(path)}
                title={path}
              >
                {path}
              </SuggestionItem>
            ))}
          </SuggestionList>
        ) : null}
      </InputWrapper>
    </Wrapper>
  )
}

export default FileSearch