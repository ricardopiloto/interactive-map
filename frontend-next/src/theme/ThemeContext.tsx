import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { GenreId, Mode } from './genres'

export type ThemePreference = 'auto' | 'light' | 'dark'

interface ThemeState {
  genre: GenreId
  mode: Mode
  /** O que o viewer escolheu — 'auto' segue o sistema; mode acima é sempre o valor resolvido (nunca 'auto'). */
  preference: ThemePreference
  setGenre: (g: GenreId) => void
  setPreference: (p: ThemePreference) => void
  /** @deprecated use setPreference — mantido pelos chamadores antigos do toggle simples. */
  toggleMode: () => void
}

const ThemeCtx = createContext<ThemeState | null>(null)

const STORAGE_KEY = 'codex-proto-theme'

function systemPrefersLight(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false
}

function resolve(pref: ThemePreference): Mode {
  if (pref === 'auto') return systemPrefersLight() ? 'light' : 'dark'
  return pref
}

/**
 * Applies data-genre / data-mode to <html>. Cada rota de campanha chama
 * useCampaignGenre(campaign.genero) pra re-skinar o chrome inteiro (não só
 * o mapa). Fora de campanha (marketing/explorar/painel/admin) o gênero fica
 * fixo em "fantasia", a identidade própria do produto — igual ao app real.
 *
 * Tema segue o padrão do app real: 'auto' (padrão) acompanha
 * prefers-color-scheme e reage a mudança em tempo real; 'light'/'dark' fixam.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [genre, setGenre] = useState<GenreId>(() => {
    if (typeof window === 'undefined') return 'fantasia'
    return (localStorage.getItem(`${STORAGE_KEY}:genre`) as GenreId) || 'fantasia'
  })
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'auto'
    return (localStorage.getItem(`${STORAGE_KEY}:preference`) as ThemePreference) || 'auto'
  })
  const [mode, setModeState] = useState<Mode>(() => resolve(preference))

  useEffect(() => {
    document.documentElement.setAttribute('data-genre', genre)
    localStorage.setItem(`${STORAGE_KEY}:genre`, genre)
  }, [genre])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}:preference`, preference)
    setModeState(resolve(preference))
    if (preference !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => setModeState(resolve('auto'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  const value = useMemo<ThemeState>(
    () => ({
      genre,
      mode,
      preference,
      setGenre,
      setPreference,
      toggleMode: () => setPreference(mode === 'dark' ? 'light' : 'dark'),
    }),
    [genre, mode, preference],
  )

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

/** Campaign screens call this once to force the shell into the campaign's genre. */
export function useCampaignGenre(genre: GenreId | undefined) {
  const { genre: current, setGenre } = useTheme()
  useEffect(() => {
    if (genre && genre !== current) setGenre(genre)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre])
}
