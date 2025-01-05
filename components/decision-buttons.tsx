import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect
} from 'react'
import { Button } from './ui/button'

// Define a type for decision colors
type DecisionColor = {
  bg: string
  border: string
  text: string
  hover: string
  isSelected: string
}

const DECISION_COLORS: Record<string, DecisionColor> = {
  ok: {
    bg: 'bg-lime-400/10',
    border: 'border-lime-500',
    text: 'text-lime-500',
    hover: 'hover:bg-lime-500/30 hover:border-lime-500 hover:text-lime-500',
    isSelected: 'bg-lime-500/30 border-lime-500 text-lime-500'
  },
  na: {
    bg: 'bg-orange-400/10',
    border: 'border-orange-500',
    text: 'text-orange-500',
    hover:
      'hover:bg-orange-500/30 hover:border-orange-500 hover:text-orange-500',
    isSelected: 'bg-orange-500/30 border-orange-500 text-orange-500'
  },
  sk: {
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-500',
    text: 'text-yellow-500',
    hover:
      'hover:bg-yellow-500/30 hover:border-yellow-500 hover:text-yellow-500',
    isSelected: 'bg-yellow-500/30 border-yellow-500 text-yellow-500'
  },
  nok: {
    bg: 'bg-red-400/10',
    border: 'border-red-500',
    text: 'text-red-500',
    hover: 'hover:bg-red-500/30 hover:border-red-500 hover:text-red-500',
    isSelected: 'bg-red-500/30 border-red-500 text-red-500'
  }
} as const

export const CardDecisions = [
  { id: 'ok', name: 'OK', style: DECISION_COLORS.ok },
  { id: 'na', name: 'N/A', style: DECISION_COLORS.na },
  { id: 'sk', name: 'SK', style: DECISION_COLORS.sk },
  { id: 'nok', name: 'NG', style: DECISION_COLORS.nok }
]

interface DecisionButtonsProps {
  onSelect: (value: string) => void
  initialValue?: string | null
}

const DecisionButtons = forwardRef<{ reset: () => void }, DecisionButtonsProps>(
  ({ onSelect, initialValue }, ref) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(
      initialValue || null
    )

    useEffect(() => {
      setSelectedValue(initialValue || null)
    }, [initialValue])

    useImperativeHandle(ref, () => ({
      reset: () => setSelectedValue(null)
    }))

    const handleSelect = (value: string) => {
      setSelectedValue(value)
      onSelect(value)
    }

    const getButtonClassName = (decision: (typeof CardDecisions)[number]) => {
      const { style } = decision
      const isSelected = selectedValue === decision.id
      return `w-full h-14 border-2 rounded-lg px-4 py-2 text-light
      ${style.bg} ${style.border} ${style.text} ${style.hover}
      ${isSelected ? style.isSelected : ''}`
    }

    return (
      <div className="grid grid-cols-4 gap-2">
        {CardDecisions.map((decision) => (
          <Button
            type="button"
            key={decision.id}
            className={getButtonClassName(decision)}
            onClick={() => handleSelect(decision.id)}
          >
            {decision.name}
          </Button>
        ))}
      </div>
    )
  }
)

DecisionButtons.displayName = 'DecisionButtons'

export default DecisionButtons
