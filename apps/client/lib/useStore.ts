import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { useStoreState, ProjectStore } from '@weacle/speed-client/lib/useStore-types'
import { nanoid } from '@weacle/speed-lib/utils/nanoid'
import type {
  Project,
} from '@weacle/speed-lib/types'
import {
  defaultModel,
} from '@weacle/speed-lib/constants'

const createProject = (
  props: { remove: () => void },
  { set, get }: { set: (fn: (state: ProjectStore) => void) => void, get: () => ProjectStore | undefined },
  { data, id }: { id: string, data?: Partial<Project> },
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
  setActiveMessageId: (messageId) => set(() => ({
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

  name: '',
  setName: (name) => set(() => ({ name })),
  path: '',
  setPath: (path) => set(() => ({ path })),

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
  ...data,
})

const useStore = create<useStoreState>()(persist((set, get) => ({
  projects: new Map(),
  setProject: (id, data) => {
    const childSet = (fn: Function) => {
      set((state) => {
        const update = fn(state.projects.get(id))
        const updatedProject = { ...state.projects.get(id), ...update }
        return {
          ...state,
          projects: new Map(state.projects).set(id, updatedProject),
        }
      })
    }

    const childGet = () => get().projects.get(id)

    const remove = () => { set((state) => {
      state.projects.delete(id)
      return state
    }) }

    const newProject = createProject({ remove }, { set: childSet, get: childGet }, { id, data })

    set((state) => {
      return {
      ...state,
      projects: state.projects.set(id, newProject),
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
  onRehydrateStorage: (state) => {
    function hydrateProjects(state: useStoreState) {
      for (const [id, project] of state.projects) {
        state.setProject(id, project)
      }
    }

    return (state, error) => {
      if (error) {
        console.log('an error happened during hydration', error)
      } else if (state) {
        hydrateProjects(state)
      }
    }
  },
}))

export default useStore
