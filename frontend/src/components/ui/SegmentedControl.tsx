import type { ReactNode } from 'react'
import './ui.css'

export interface SegmentedOption {
  value: string
  label: ReactNode
}

export interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  'aria-label'?: string
  name?: string
  className?: string
}

/** Exclusive choice group — replaces legacy `.seg` / `.seg-opt`. */
export function SegmentedControl({
  options,
  value,
  onChange,
  name = 'ui-seg',
  className = '',
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  return (
    <div className={`ui-seg ${className}`.trim()} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const id = `${name}-${opt.value}`
        const checked = value === opt.value
        return (
          <label key={opt.value} className="ui-seg__opt" htmlFor={id}>
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}
