import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { useStoreState } from '@weacle/speed-client/lib/useStore-types'
import { nanoid } from '@weacle/speed-lib/utils/nanoid'


const zStore = create<useStoreState>()(persist((set, get) => ({
  answering: false,
  setAnswering: (answering) => set(() => ({ answering })),

  directoryPanelOpened: false,
  setDirectoryPanelOpened: (opened) => set(() => ({ directoryPanelOpened: opened })),

  errors: {},
  setErrors: (errors) => set(() => ({
    errors,
  })),
  addError: (key, value) => set((state) => ({
    errors: {
      ...state.errors,
      [key]: value,
    },
  })),
  clearErrors: () => set(() => ({ errors: {} })),
  removeError: (key) => set((state) => {
    const errors = { ...state.errors }
    delete errors[key]
    return { errors }
  }),

  messages: [],
  activeMessageId: null,
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { id: nanoid(), ...message }],
  })),
  addSystemMessage: (text) => set((state) => ({
    messages: [...state.messages, { id: nanoid(), status: 'done', role: 'system', text }],
  })),
  clearMessages: () => set(() => ({
    messages: [],
  })),
  setActiveMessageId: (messageId) => set((state) => ({
    activeMessageId: messageId,
  })),
  updateMessage: (messageId, update) => set((state) => ({
    messages: state.messages.map((message) => {
      if (message.id === messageId) {
        return { ...message, ...update }
      }
      return message
    }),
  })),

  prompt: '',
  setPrompt: (prompt) => set(() => ({ prompt })),

  promptModel: {
    vendor: 'anthropic',
    name: 'claude-3-5-sonnet-20240620',
  },
  setPromptModel: (model) => set(() => ({ promptModel: model })),

  systemPrompt: 'You are an experienced software engineer. You write code.',
  setSystemPrompt: (systemPrompt) => set(() => ({ systemPrompt })),

  reset: () => set(() => ({
    answering: false,
    errors: {},
    files: [],
    messages: [],
  })),
}), {
  name: 'main-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    directoryPanelOpened: state.directoryPanelOpened,
    promptModel: state.promptModel,
    systemPrompt: state.systemPrompt,
  }),
}))

export default zStore
