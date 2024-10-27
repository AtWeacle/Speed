import useStore from '@weacle/speed-client/lib/useStore'
import type { ProjectStore } from '@weacle/speed-client/lib/useStore-types'

export default function useProjectStore(getter: (state: ProjectStore) => any) {
  const activeProjectId = useStore(state => state.activeProjectId) as string
  const project = useStore(state => state.projects.get(activeProjectId))
  return getter(project as ProjectStore)
}

useProjectStore.getState = () => {
  const { getActiveProject } = useStore.getState()
  const project = getActiveProject()
  return project as ProjectStore
}
