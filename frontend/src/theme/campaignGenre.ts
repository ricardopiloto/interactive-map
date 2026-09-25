/** Apply campaign genre via data-genre (tokens.css). Spec 111. */

import { applyThemePreference } from './themePreference'
import { resolveGenreId, type GenreId } from './genres'

/** Apply the campaign identity without overriding the user's effective theme. */
export function applyCampaignGenre(genero: string | null | undefined): void {
  const id = resolveGenreId(genero)
  document.documentElement.dataset.genre = id
  applyThemePreference()
}

export function clearCampaignGenre(): void {
  delete document.documentElement.dataset.genre
  applyThemePreference()
}

/** Preview helper for create form — set genre without forcing global theme persistence. */
export function previewGenreOnElement(el: HTMLElement, id: GenreId): void {
  el.dataset.genre = id
}
