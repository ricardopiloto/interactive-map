/** Apply campaign genre via data-genre (tokens.css). Spec 111. */

import { genreById, resolveGenreId, type GenreId } from './genres'

const THEME_KEY = 'codex.theme'
const FORCED_DARK_ATTR = 'data-genre-forced-dark'

/** Apply genre on <html>; force dark when genre lacks light support. */
export function applyCampaignGenre(genero: string | null | undefined): void {
  const id = resolveGenreId(genero)
  const def = genreById(id)
  document.documentElement.dataset.genre = id

  if (!def.supportsLight) {
    document.documentElement.setAttribute(FORCED_DARK_ATTR, '1')
    document.documentElement.dataset.theme = 'dark'
  } else {
    document.documentElement.removeAttribute(FORCED_DARK_ATTR)
    restoreUserTheme()
  }
}

export function clearCampaignGenre(): void {
  delete document.documentElement.dataset.genre
  document.documentElement.removeAttribute(FORCED_DARK_ATTR)
  restoreUserTheme()
}

function restoreUserTheme(): void {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.dataset.theme = stored
    return
  }
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  document.documentElement.dataset.theme = prefersLight ? 'light' : 'dark'
}

/** Preview helper for create form — set genre without forcing global theme persistence. */
export function previewGenreOnElement(el: HTMLElement, id: GenreId): void {
  el.dataset.genre = id
}
