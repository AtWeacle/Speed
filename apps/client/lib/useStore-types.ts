import type {
  DirectoryTree,
  DirectoryTreeConverted,
  ErrorsType,
  LllModel,
  Message,
  Project,
} from '@weacle/speed-lib/types'

export type ProjectStore = {
  answering: boolean
  setAnswering: (answering: boolean) => void

  directoryPanelOpened: boolean
  setDirectoryPanelOpened: (opened: boolean) => void

  directoryTree: DirectoryTree | null
  setDirectoryTree: (directoryTree: DirectoryTree) => void

  directoryTreeConverted: DirectoryTreeConverted | null
  setDirectoryTreeConverted: (directoryTreeConverted: DirectoryTreeConverted) => void

  errors: ErrorsType
  setErrors: (errors: ErrorsType) => void
  addError: (key: string, value: any) => void
  clearErrors: () => void
  removeError: (key: string) => void

  filesToExclude: string
  setFilesToExclude: (filesToExclude: string) => void

  filesToInclude: string
  setFilesToInclude: (filesToInclude: string) => void

  id: string

  messages: Message[]
  activeMessageId: string | null
  addMessage: (message: Omit<Message, 'id'> & { id?: string }) => void
  addSystemMessage: (text: string) => void
  clearMessages: () => void
  getMessage: (messageId: string) => Message | undefined
  getActiveMessage: () => Message | undefined
  setActiveMessageId: (messageId: string) => void
  updateMessage: (messageId: string, update: Partial<Message>) => void

  pathsToExclude: string[]
  setPathsToExclude: (pathsToExclude: string[]) => void

  name: string
  setName: (name: string) => void
  path: string
  setPath: (path: string) => void

  prompt: string
  setPrompt: (prompt: string) => void

  promptModel: LllModel
  setPromptModel: (model: LllModel) => void

  selectedItems: string[]
  addSelectedItem: (item: string) => void
  setSelectedItems: (items: string[]) => void
  clearSelectedItems: () => void
  selectAllItems: () => void

  systemPrompt: string
  setSystemPrompt: (systemPrompt: string) => void

  remove: () => void
  update: (update: Partial<Project>) => void
}

export type useStoreState = {
  projects: Map<string, ProjectStore>
  addProject: (name: string, path: string) => void
  getProjects: () => ProjectStore[]
  getProject: (projectId: string) => ProjectStore | undefined
  activeProjectId: string | null
  setActiveProjectId: (projectId: string) => void
  getActiveProject: () => ProjectStore | undefined
  
  reset: () => void
}
