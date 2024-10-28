import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import type {
  DirectoryTree,
  FileSystemItem,
} from '@weacle/speed-lib/types'
import { MEDIA } from '@weacle/speed-client/theme/constants'
import { SERVER_URL } from '@weacle/speed-client/lib/constants'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  /* width: 100%; */
  /* background-color: var(--color-black-2); */
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
function FileSearch() {
  const setSearch = useProjectStore(state => state.setSearch)
  const search = useProjectStore(state => state.search)

  // const [loading, setLoading] = useState(false)

  useEffect(() => {
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // if (event.key === 'Enter') {
    //   setSelectedItems([])
    //   fetchDirectoryTree()
    // }
  }

  return (
    <Wrapper>
      <InputWrapper>
        <Input
          className="Input"
          type="text"
          id="search"
          placeholder="Search file"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </InputWrapper>
    </Wrapper>
  )
}

export default FileSearch