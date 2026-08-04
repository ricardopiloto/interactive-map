import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { labelMatchesQuery } from '../../utils/textMatch'

export interface WaypointComboboxOption {
  id: number
  label: string
}

interface Props {
  label: string
  options: WaypointComboboxOption[]
  query: string
  selectedId: number | ''
  onQueryChange: (query: string) => void
  onSelect: (id: number, label: string) => void
  placeholder?: string
}

export function WaypointCombobox({
  label,
  options,
  query,
  selectedId,
  onQueryChange,
  onSelect,
  placeholder = 'Pesquisar…',
}: Props) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  const filtered = useMemo(
    () => options.filter((o) => labelMatchesQuery(o.label, query)),
    [options, query],
  )

  function openList() {
    setOpen(true)
    setHighlight(0)
  }

  function pick(opt: WaypointComboboxOption) {
    onSelect(opt.id, opt.label)
    setOpen(false)
    inputRef.current?.blur()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) openList()
      else setHighlight((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) openList()
      else setHighlight((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      if (open && filtered[highlight]) {
        e.preventDefault()
        pick(filtered[highlight])
      }
    }
  }

  const activeDesc =
    open && filtered[highlight] ? `${listId}-opt-${filtered[highlight].id}` : undefined

  return (
    <div className="route-planner__field waypoint-combobox">
      <span id={`${listId}-label`}>{label}</span>
      <div className="waypoint-combobox__wrap">
        <input
          ref={inputRef}
          className="input"
          type="text"
          role="combobox"
          aria-labelledby={`${listId}-label`}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeDesc}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value)
            setOpen(true)
            setHighlight(0)
          }}
          onFocus={openList}
          onBlur={() => {
            // Allow option mousedown to fire before close
            window.setTimeout(() => setOpen(false), 120)
          }}
          onKeyDown={onKeyDown}
        />
        {open && (
          <ul
            id={listId}
            className="waypoint-combobox__list"
            role="listbox"
            aria-labelledby={`${listId}-label`}
          >
            {filtered.length === 0 ? (
              <li className="waypoint-combobox__empty" role="presentation">
                Nenhuma correspondência
              </li>
            ) : (
              filtered.map((opt, i) => (
                <li key={opt.id} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-opt-${opt.id}`}
                    role="option"
                    aria-selected={selectedId === opt.id || i === highlight}
                    className={`waypoint-combobox__option${i === highlight ? ' is-active' : ''}${selectedId === opt.id ? ' is-selected' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => pick(opt)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
