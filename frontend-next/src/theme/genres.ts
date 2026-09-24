export type GenreId = 'fantasia' | 'gotico' | 'scifi' | 'urbano'
export type Mode = 'dark' | 'light'

export interface GenreDef {
  id: GenreId
  label: string
  tagline: string
  swatch: string
  supportsLight: boolean
  suggestedSystems: string[]
}

export const GENRES: GenreDef[] = [
  {
    id: 'fantasia',
    label: 'Fantasia medieval',
    tagline: 'Reinos, tavernas e velhos impérios — âmbar sobre carvão quente.',
    swatch: '#d8aa5a',
    supportsLight: true,
    suggestedSystems: ['WFRP 4e', 'D&D 5e', 'Old Dragon', 'Pathfinder'],
  },
  {
    id: 'gotico',
    label: 'Gótico contemporâneo',
    tagline: 'Cidades noturnas e pactos de sangue — carmesim sobre breu.',
    swatch: '#de7384',
    supportsLight: false,
    suggestedSystems: ['World of Darkness', 'Vampiro: A Máscara', 'Chronicles of Darkness'],
  },
  {
    id: 'scifi',
    label: 'Ficção científica',
    tagline: 'Estações orbitais e fronteiras distantes — ciano sobre grafite.',
    swatch: '#51c0d6',
    supportsLight: false,
    suggestedSystems: ['Starfinder', 'Traveller', 'Stars Without Number', 'Alien RPG'],
  },
  {
    id: 'urbano',
    label: 'Urbano contemporâneo',
    tagline: 'O mundo real com um segredo por baixo — azul sobre ardósia.',
    swatch: '#73a5de',
    supportsLight: false,
    suggestedSystems: ['Call of Cthulhu', 'Blades in the Dark', 'Urban Shadows'],
  },
]

export function genreById(id: string | undefined): GenreDef {
  return GENRES.find((g) => g.id === id) ?? GENRES[0]
}
