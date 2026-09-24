import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './ui.css'

export type ToastTone = 'info' | 'success' | 'error'

type ToastItem = { id: number; message: string; tone: ToastTone }

type Listener = (items: ToastItem[]) => void

let seq = 1
let items: ToastItem[] = []
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l(items)
}

function push(message: string, tone: ToastTone) {
  const id = seq++
  items = [...items, { id, message, tone }]
  emit()
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== id)
    emit()
  }, 4000)
}

export const toast = {
  info: (message: string) => push(message, 'info'),
  success: (message: string) => push(message, 'success'),
  error: (message: string) => push(message, 'error'),
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<ToastItem[]>(items)

  const onChange = useCallback((next: ToastItem[]) => setList(next), [])

  useEffect(() => {
    listeners.add(onChange)
    return () => {
      listeners.delete(onChange)
    }
  }, [onChange])

  return (
    <>
      {children}
      {createPortal(
        <div className="ui-toast-region" aria-live="polite" aria-relevant="additions">
          {list.map((t) => (
            <div
              key={t.id}
              className={`ui-toast ui-toast--${t.tone}`}
              role={t.tone === 'error' ? 'alert' : 'status'}
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
