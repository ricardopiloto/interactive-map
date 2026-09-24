import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import './ui.css'

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Element to restore focus to; defaults to previously focused element */
  returnFocusRef?: React.RefObject<HTMLElement | null>
}

export function Dialog({ open, onClose, title, children, returnFocusRef }: DialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const returnFocusRefStable = useRef(returnFocusRef)
  returnFocusRefStable.current = returnFocusRef

  // Only when `open` flips — parent onClose identity must not steal focus while typing.
  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const explicitFocusTarget = returnFocusRefStable.current?.current
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusables?.[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
      )
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (explicitFocusTarget?.isConnected) {
        explicitFocusTarget.focus()
        return
      }

      const previousTarget = previouslyFocused.current
      if (
        previousTarget?.isConnected &&
        panel &&
        !panel.contains(previousTarget) &&
        previousTarget.matches(FOCUSABLE)
      ) {
        previousTarget.focus()
        return
      }

      const fallback = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
        (element) => !panel?.contains(element) && element.getClientRects().length > 0,
      )
      fallback?.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="ui-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current()
      }}
    >
      <div
        ref={panelRef}
        className="ui-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="ui-dialog__title">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
