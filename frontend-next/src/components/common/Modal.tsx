import { useEffect, type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, eyebrow, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal__head">
          <div className="grow">
            {eyebrow && <div className="sheet__eyebrow">{eyebrow}</div>}
            <h2 id="modal-title" className="modal__title">{title}</h2>
          </div>
          <button type="button" className="icon-btn icon-btn-sm icon-btn-plain" onClick={onClose} aria-label="Fechar">
            <IconX size={18} aria-hidden />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
