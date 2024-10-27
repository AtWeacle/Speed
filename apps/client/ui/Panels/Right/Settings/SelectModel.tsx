import React from 'react'
import * as Select from '@radix-ui/react-select'
import {
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import useProjectStore from '@weacle/speed-client/lib/useProjectStore'
import { MODELS } from '@weacle/speed-lib/constants'

function SelectModel() {
  const promptModel = useProjectStore(state => state.promptModel)
  const setPromptModel = useProjectStore(state => state.setPromptModel)

  return (
    <Select.Root
      defaultValue={promptModel.name}
      onValueChange={modelId => {
        const model = Object.entries(MODELS)
          .find(([vendor, { list }]) => !!list[modelId])

        if (model) {
          const [vendor, { list }] = model
          setPromptModel({ vendor, id: modelId, name: list[modelId as keyof typeof list].label })
        }
      }}
    >
      <Select.Trigger className="SelectTrigger" aria-label="Models">
        <Select.Value placeholder="Select a model…">{promptModel.name}</Select.Value>
        <Select.Icon className="SelectIcon">
          <ChevronDown size={20} />
        </Select.Icon>
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content
          className="SelectContent"
          align="start"
        >
          <Select.ScrollUpButton className="SelectScrollButton">
            <ChevronUp size={20} />
          </Select.ScrollUpButton>

          <Select.Viewport className="SelectViewport">
            {Object.entries(MODELS).map(([vendor, model]) => (
              <Select.Group key={vendor}>
                <Select.Label className="SelectLabel">
                  {model.name}
                </Select.Label>

                {Object.keys(model.list).map((modelId: string) => (
                  <Select.Item key={`${vendor}_${modelId}`} value={modelId}>
                    <Select.ItemText>{model.list[modelId as keyof typeof model.list].label}</Select.ItemText>
                    <Select.ItemIndicator className="SelectItemIndicator">
                      <Check size={18} color="var(--color-green)" strokeWidth={2.5} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Group>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="SelectScrollButton">
            <ChevronDown size={20} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export default SelectModel
