import {
  useEffect,
  useRef,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from 'react'
import type { VinculoTipo } from '../../types'

/** Shared delay before a single chip click toggles a type (graph + detail filters). */
export const CHIP_CLICK_DELAY_MS = 280

export type UseVinculoTipoChipClicksOptions = {
  /** Custom toggle; default flips membership (empty set = show all types). */
  toggleTipo?: (tipo: VinculoTipo) => void
  /** e.g. expand floating panel — graph only. */
  onSingleClickSideEffect?: () => void
}

/**
 * Delayed single-click toggle + double-click solo/restore for vínculo tipo chips.
 * Empty set means “all types”. Double-click on the sole active type restores empty.
 * Clears pending timeout on unmount (FR-004 when detail remounts via key).
 */
export function useVinculoTipoChipClicks(
  setTipos: Dispatch<SetStateAction<Set<VinculoTipo>>>,
  options: UseVinculoTipoChipClicksOptions = {},
) {
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { toggleTipo, onSingleClickSideEffect } = options

  useEffect(() => {
    return () => {
      if (pendingRef.current != null) {
        clearTimeout(pendingRef.current)
        pendingRef.current = null
      }
    }
  }, [])

  function clearPending() {
    if (pendingRef.current != null) {
      clearTimeout(pendingRef.current)
      pendingRef.current = null
    }
  }

  function defaultToggle(tipo: VinculoTipo) {
    setTipos((prev) => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  function soloOrRestoreTipo(tipo: VinculoTipo) {
    setTipos((prev) => {
      if (prev.size === 1 && prev.has(tipo)) return new Set()
      return new Set([tipo])
    })
  }

  function onClick(tipo: VinculoTipo) {
    onSingleClickSideEffect?.()
    clearPending()
    pendingRef.current = setTimeout(() => {
      pendingRef.current = null
      ;(toggleTipo ?? defaultToggle)(tipo)
    }, CHIP_CLICK_DELAY_MS)
  }

  function onDoubleClick(e: MouseEvent<HTMLButtonElement>, tipo: VinculoTipo) {
    e.preventDefault()
    clearPending()
    soloOrRestoreTipo(tipo)
  }

  return { onClick, onDoubleClick }
}
