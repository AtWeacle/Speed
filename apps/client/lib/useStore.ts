import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { useStoreState } from '@weacle/speed-client/lib/useStore-types'
import { nanoid } from '@weacle/speed-lib/utils/nanoid'


const zStore = create<useStoreState>()(persist((set, get) => ({
  answering: false,
  setAnswering: (answering) => set(() => ({ answering })),

  directoryPanelOpened: false,
  setDirectoryPanelOpened: (opened) => set(() => ({ directoryPanelOpened: opened })),

  directoryTree: null,
  setDirectoryTree: (directoryTree) => set(() => ({ directoryTree })),
  directoryTreeConverted: null,
  setDirectoryTreeConverted: (directoryTreeConverted) => set(() => ({ directoryTreeConverted })),

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

  filesToInclude: '.rs,.js,.ts,.tsx,.css,.json,.html',
  setFilesToInclude: (filesToInclude) => set(() => ({ filesToInclude })),

  filesToExclude: 'package.json,tsconfig.json,*.d.ts,*.config.js',
  setFilesToExclude: (filesToExclude) => set(() => ({ filesToExclude })),

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
  getMessage: (messageId) => get().messages.find((message) => message.id === messageId),
  getActiveMessage: () => get().messages.find((message) => message.id === get().activeMessageId),
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

  pathsToExclude: [],
  setPathsToExclude: (pathsToExclude) => set(() => ({ pathsToExclude })),

  projectDirectory: '',
  setProjectDirectory: (projectDirectory) => set(() => ({ projectDirectory })),

  prompt: '',
  setPrompt: (prompt) => set(() => ({ prompt })),

  promptModel: {
    vendor: 'anthropic',
    name: 'claude-3-5-sonnet-20240620',
  },
  setPromptModel: (model) => set(() => ({ promptModel: model })),

  selectedItems: [],
  addSelectedItem: (item) => set((state) => ({
    selectedItems: [...state.selectedItems, item],
  })),
  setSelectedItems: (items) => set(() => ({ selectedItems: items })),
  clearSelectedItems: () => set(() => ({ selectedItems: [] })),
  selectAllItems: () => set((state) => ({
    selectedItems: state.directoryTreeConverted ? Object.keys(state.directoryTreeConverted) : [],
  })),

  systemPrompt: 'You are an experienced software engineer. You write code.',
  setSystemPrompt: (systemPrompt) => set(() => ({ systemPrompt })),

  reset: () => set(() => ({
    answering: false,
    errors: {},
    messages: [],
  })),
}), {
  name: 'main-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    directoryPanelOpened: state.directoryPanelOpened,
    directoryTree: state.directoryTree,
    directoryTreeConverted: state.directoryTreeConverted,
    excludedFiles: state.excludedFiles,
    filesToInclude: state.filesToInclude,
    filesToExclude: state.filesToExclude,
    pathsToExclude: state.pathsToExclude,
    projectDirectory: state.projectDirectory,
    promptModel: state.promptModel,
    selectedItems: state.selectedItems,
    systemPrompt: state.systemPrompt,
  }),
}))

export default zStore
