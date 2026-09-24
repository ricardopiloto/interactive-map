import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api/client'
import { campaignAdminPrefix } from '../api/campaignSlug'

type EditModeContextValue = {
  enabled: boolean
  canEdit: boolean
  canEditReady: boolean
  setEnabled: (next: boolean) => void
  toggle: () => void
}

const EditModeContext = createContext<EditModeContextValue | null>(null)

function storageKey(slug: string) {
  return `codex.editMode.${slug}`
}

function readStored(slug: string): boolean {
  if (typeof sessionStorage === 'undefined') return false
  try {
    return sessionStorage.getItem(storageKey(slug)) === '1'
  } catch {
    return false
  }
}

function writeStored(slug: string, enabled: boolean) {
  if (typeof sessionStorage === 'undefined') return
  try {
    if (enabled) sessionStorage.setItem(storageKey(slug), '1')
    else sessionStorage.removeItem(storageKey(slug))
  } catch {
    /* ignore */
  }
}

async function probeCanEdit(slug: string): Promise<boolean> {
  try {
    await api.adminGet<{ email: string }>(`${campaignAdminPrefix(slug)}/session`)
    return true
  } catch {
    return false
  }
}

export function EditModeProvider({
  slug,
  children,
}: {
  slug: string
  children: ReactNode
}) {
  const [canEdit, setCanEdit] = useState(false)
  const [canEditReady, setCanEditReady] = useState(false)
  const [enabled, setEnabledState] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCanEditReady(false)
    setCanEdit(false)
    setEnabledState(false)

    void probeCanEdit(slug).then((ok) => {
      if (cancelled) return
      setCanEdit(ok)
      setCanEditReady(true)
      if (ok) {
        const stored = readStored(slug)
        setEnabledState(stored)
      } else {
        writeStored(slug, false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [slug])

  const setEnabled = useCallback(
    (next: boolean) => {
      if (!canEdit) return
      setEnabledState(next)
      writeStored(slug, next)
    },
    [canEdit, slug],
  )

  const toggle = useCallback(() => {
    setEnabled(!enabled)
  }, [enabled, setEnabled])

  const value = useMemo(
    () => ({
      enabled: canEdit ? enabled : false,
      canEdit,
      canEditReady,
      setEnabled,
      toggle,
    }),
    [canEdit, canEditReady, enabled, setEnabled, toggle],
  )

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
}

export function useEditMode(): EditModeContextValue {
  const ctx = useContext(EditModeContext)
  if (!ctx) {
    return {
      enabled: false,
      canEdit: false,
      canEditReady: true,
      setEnabled: () => {},
      toggle: () => {},
    }
  }
  return ctx
}
