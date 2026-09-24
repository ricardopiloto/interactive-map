import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { IconDotsVertical } from '@tabler/icons-react'
import { IconButton } from './IconButton'
import './ui.css'

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [show, setShow] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  return (
    <span
      ref={wrapRef}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show ? (
        <span role="tooltip" className="ui-tooltip" style={{ top: '100%', left: 0, marginTop: 4 }}>
          {label}
        </span>
      ) : null}
    </span>
  )
}

export function DropdownMenu({
  label,
  items,
}: {
  label: string
  items: { id: string; label: string; onSelect: () => void; danger?: boolean }[]
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <IconButton
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <IconDotsVertical size={20} aria-hidden />
      </IconButton>
      {open ? (
        <div id={id} role="menu" className="ui-menu" style={{ right: 0, top: '100%', marginTop: 4 }}>
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              className="ui-menu__item ui-touch"
              onClick={() => {
                setOpen(false)
                it.onSelect()
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
