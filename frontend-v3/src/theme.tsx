import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeId = 'nocturne' | 'pergaminho' | 'arcano'

export const THEMES: { id: ThemeId; nome: string; descricao: string }[] = [
  { id: 'nocturne', nome: 'Nocturne', descricao: 'Escuro · dourado · o clássico do Codex' },
  { id: 'pergaminho', nome: 'Pergaminho', descricao: 'Claro · sépia · grimório de mesa' },
  { id: 'arcano', nome: 'Arcano', descricao: 'Escuro · violeta e teal · fantasia vívida' },
]

interface ThemeCtx {
  theme: ThemeId
  setTheme: (t: ThemeId) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

function readStored(): ThemeId {
  try {
    const stored = window.localStorage.getItem('codex-v3-theme')
    if (stored === 'nocturne' || stored === 'pergaminho' || stored === 'arcano') return stored
  } catch {
    // ignore
  }
  return 'nocturne'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readStored)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      window.localStorage.setItem('codex-v3-theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  function setTheme(t: ThemeId) {
    setThemeState(t)
  }

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}
