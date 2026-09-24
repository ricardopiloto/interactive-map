/**
 * Theme preference Auto | Claro | Escuro (UX-3).
 * Storage key `codex.theme`; drives `html[data-theme]`.
 */

export const THEME_STORAGE_KEY = 'codex.theme'

export type ThemePreference = 'auto' | 'light' | 'dark'

export function parseThemePreference(raw: string | null | undefined): ThemePreference {
  if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw
  return 'auto'
}

export function readThemePreference(): ThemePreference {
  if (typeof localStorage === 'undefined') return 'auto'
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'auto'
  }
}

export function writeThemePreference(value: ThemePreference): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value)
  } catch {
    /* ignore quota / private mode */
  }
}

function systemIsDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function effectiveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'light' || pref === 'dark') return pref
  return systemIsDark() ? 'dark' : 'light'
}

export function applyThemePreference(pref: ThemePreference = readThemePreference()): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = effectiveTheme(pref)
}

/**
 * Apply preference and keep Auto in sync with the OS.
 * Returns cleanup for the media-query listener (no-op when not Auto).
 */
export function startThemePreferenceSync(): () => void {
  if (typeof window === 'undefined') return () => {}

  let pref = readThemePreference()
  applyThemePreference(pref)

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onMq = () => {
    if (readThemePreference() === 'auto') applyThemePreference('auto')
  }
  mq.addEventListener('change', onMq)

  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return
    pref = parseThemePreference(e.newValue)
    applyThemePreference(pref)
  }
  window.addEventListener('storage', onStorage)

  return () => {
    mq.removeEventListener('change', onMq)
    window.removeEventListener('storage', onStorage)
  }
}

export function setThemePreference(value: ThemePreference): void {
  writeThemePreference(value)
  applyThemePreference(value)
}
