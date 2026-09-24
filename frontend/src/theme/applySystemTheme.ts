/**
 * Bootstrap theme sync (UX-1 + UX-3 preference).
 */
import { startThemePreferenceSync } from './themePreference'

/** @deprecated Prefer startThemePreferenceSync — kept name for main.tsx callers. */
export function applySystemTheme(): () => void {
  return startThemePreferenceSync()
}
