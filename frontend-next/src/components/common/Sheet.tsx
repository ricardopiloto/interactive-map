import { useEffect, useRef, type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import './Sheet.css'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  wide?: boolean
}

/**
 * Painel contextual estilo "place page" de mapa: vira gaveta lateral no
 * desktop e folha inferior no celular, sempre ancorado ao mesmo container
 * (o palco do mapa/grafo), nunca escurecendo o conteúdo por trás.
 */
export function Sheet({ open, onClose, title, eyebrow, actions, children, wide }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      ref={ref}
      className={`sheet${wide ? ' sheet--wide' : ''}`}
      data-open={open}
      role="dialog"
      aria-modal="false"
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <div className="sheet__grabber" aria-hidden />
      <header className="sheet__head">
        <div className="grow">
          {eyebrow && <div className="sheet__eyebrow">{eyebrow}</div>}
          {title && <h2 className="sheet__title">{title}</h2>}
        </div>
        {actions}
        <button type="button" className="icon-btn icon-btn-sm icon-btn-plain" onClick={onClose} aria-label="Fechar">
          <IconX size={18} aria-hidden />
        </button>
      </header>
      <div className="sheet__body">{children}</div>
    </div>
  )
}
