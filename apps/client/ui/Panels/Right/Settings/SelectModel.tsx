import React from 'react'
import * as Select from '@radix-ui/react-select'
import {
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import useStore from '@weacle/speed-client/lib/useStore'
import { MODELS } from '@weacle/speed-lib/constants'

function SelectModel() {
  const promptModel = useStore(state => state.promptModel)
  const setPromptModel = useStore(state => state.setPromptModel)
  
  return (
    <Select.Root
      defaultValue={promptModel.name}
      onValueChange={value => {
        const vendor = Object.keys(MODELS).find((vendor) => MODELS[vendor as keyof typeof MODELS].list.includes(value))
        if (vendor) setPromptModel({ vendor, name: value })
      }}
    >
      <Select.Trigger className="SelectTrigger" aria-label="Models">
        <Select.Value placeholder="Select a model…" />
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

                {model.list.map(modelName => (
                  <Select.Item key={`${vendor}_${modelName}`} value={modelName}>
                    <Select.ItemText>{modelName}</Select.ItemText>
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
