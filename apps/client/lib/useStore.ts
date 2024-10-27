import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { useStoreState, ProjectStore } from '@weacle/speed-client/lib/useStore-types'
import { nanoid } from '@weacle/speed-lib/utils/nanoid'
import {
  defaultModel,
} from '@weacle/speed-lib/constants'

const createProject = (
  props: { remove: () => void },
  { set, get }: { set: (fn: (state: ProjectStore) => void) => void, get: () => ProjectStore | undefined },
  { id, name, path }: { id: string, name: string, path: string },
): ProjectStore => ({
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

  id,

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
  getMessage: (messageId) => get()?.messages.find((message) => message.id === messageId),
  getActiveMessage: () => get()?.messages.find((message) => message.id === get()?.activeMessageId),
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

  name,
  setName: (name) => set((state) => { state.name = name }),
  path,
  setPath: (path) => set((state) => { state.path = path }),

  pathsToExclude: [],
  setPathsToExclude: (pathsToExclude) => set(() => ({ pathsToExclude })),

  prompt: '',
  setPrompt: (prompt) => set(() => ({ prompt })),

  promptModel: { ...defaultModel },
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

  update: (data) => set((state) => { state = { ...state, ...data } }),
  ...props,
})

const zStore = create<useStoreState>()(persist((set, get) => ({
  projects: new Map(),
  addProject: (name, path) => {
    const id = nanoid()

    const childSet = (fn: Function) => { set((state) => {
      fn(state.projects.get(id))
      return state
    }) }

    const childGet = () => get().projects.get(id)

    const remove = () => { set((state) => {
      state.projects.delete(id)
      return state
    }) }

    const newProject = createProject({ remove }, { set: childSet, get: childGet }, { id, name, path })

    const isFirstProject = get().projects.size === 0

    set((state) => { return {
      ...state,
      projects: state.projects.set(id, newProject),
      ...(isFirstProject ? { activeProjectId: id } : {}),
    } })
  },
  getProjects: () => Array.from(get().projects.values()),
  getProject: (id) => get().projects.get(id),
  activeProjectId: null,
  setActiveProjectId: (activeProjectId) => set(() => ({ activeProjectId })),
  getActiveProject: () => {
    const { activeProjectId, projects } = get()
    if (!activeProjectId) return undefined
    return projects.get(activeProjectId)
  },
  reset: () => set(() => ({
    projects: new Map(),
  })),
}), {
  name: 'main-store',
  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name)
      if (!str) return null
      const existingValue = JSON.parse(str)
      return {
        ...existingValue,
        state: {
          ...existingValue.state,
          projects: new Map(existingValue.state.projects),
        }
      }
    },
    setItem: (name, value) => {
      const str = JSON.stringify({
        ...value,
        state: {
          ...value.state,
          projects: Array.from(value.state.projects.entries()),
        },
      })
      localStorage.setItem(name, str)
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
}))

export default zStore
