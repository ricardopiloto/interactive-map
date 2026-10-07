import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconUser, IconMapPin, IconFlag, IconBox, IconBookmark, IconHistory, IconNotebook } from '@tabler/icons-react'
import { todasEntidades, type EntidadeTipo } from '../data/mock'

const ICONS: Record<EntidadeTipo, typeof IconUser> = {
  personagem: IconUser,
  local: IconMapPin,
  faccao: IconFlag,
  item: IconBox,
  arco: IconBookmark,
  capitulo: IconNotebook,
  sessao: IconHistory,
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return todasEntidades.slice(0, 8)
    return todasEntidades.filter((e) => e.nome.toLowerCase().includes(q)).slice(0, 20)
  }, [query])

  if (!open) return null

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-palette" onClick={(e) => e.stopPropagation()}>
        <div className="search-palette__input">
          <IconSearch size={17} aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar personagens, locais, capítulos, sessões…"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && results[0]) {
                navigate(results[0].rota)
                onClose()
              }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="search-palette__results">
          {results.length === 0 ? (
            <p className="search-palette__empty">Nada encontrado para "{query}".</p>
          ) : (
            results.map((r) => {
              const Icon = ICONS[r.tipo]
              return (
                <button
                  key={`${r.tipo}-${r.id}`}
                  type="button"
                  className="search-palette__result"
                  onClick={() => {
                    navigate(r.rota)
                    onClose()
                  }}
                >
                  <Icon size={16} aria-hidden />
                  <span>{r.nome}</span>
                  <span className="search-palette__kind">{labelTipo(r.tipo)}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function labelTipo(tipo: EntidadeTipo): string {
  const map: Record<EntidadeTipo, string> = {
    personagem: 'Personagem',
    local: 'Local',
    faccao: 'Facção',
    item: 'Item',
    arco: 'Arco',
    capitulo: 'Capítulo',
    sessao: 'Sessão',
  }
  return map[tipo]
}
