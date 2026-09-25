export type GenreId = 'fantasia' | 'gotico' | 'scifi' | 'urbano'

export interface GenreDef {
  id: GenreId
  suggestedSystems: string[]
}

export const GENRES: GenreDef[] = [
  {
    id: 'fantasia',
    suggestedSystems: ['wfrp4e', 'D&D 5e', 'Old Dragon', 'Pathfinder'],
  },
  {
    id: 'gotico',
    suggestedSystems: ['wod', 'Vampiro: A Máscara', 'Chronicles of Darkness'],
  },
  {
    id: 'scifi',
    suggestedSystems: ['Starfinder', 'Traveller', 'Stars Without Number', 'Alien RPG'],
  },
  {
    id: 'urbano',
    suggestedSystems: ['Call of Cthulhu', 'Blades in the Dark', 'Urban Shadows'],
  },
]

export const GENRE_IDS: GenreId[] = GENRES.map((g) => g.id)

export const DEFAULT_GENRE: GenreId = 'fantasia'

export function genreById(id: string | null | undefined): GenreDef {
  return GENRES.find((g) => g.id === id) ?? GENRES[0]
}

export function resolveGenreId(id: string | null | undefined): GenreId {
  if (id && GENRE_IDS.includes(id as GenreId)) return id as GenreId
  return DEFAULT_GENRE
}

export function genreSwatchVar(id: GenreId): string {
  return `var(--genre-swatch-${id})`
}
