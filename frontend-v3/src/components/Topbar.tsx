import { useState, useRef, useEffect } from 'react'
import { IconSearch, IconPalette, IconEye, IconEyeOff, IconCheck } from '@tabler/icons-react'
import { useTheme, THEMES } from '../theme'

export function Topbar({
  gmMode,
  onToggleGm,
  onOpenSearch,
  title,
}: {
  gmMode: boolean
  onToggleGm: () => void
  onOpenSearch: () => void
  title: string
}) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPaletteOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>

      <div className="topbar__actions">
        <button type="button" className="topbar__search" onClick={onOpenSearch}>
          <IconSearch size={15} aria-hidden />
          Buscar no codex…
          <kbd>⌘K</kbd>
        </button>

        <button
          type="button"
          className={`topbar__gm${gmMode ? ' topbar__gm--on' : ''}`}
          onClick={onToggleGm}
          title={gmMode ? 'Desativar Modo Mestre' : 'Ativar Modo Mestre'}
        >
          {gmMode ? <IconEye size={16} aria-hidden /> : <IconEyeOff size={16} aria-hidden />}
          {gmMode ? 'Modo Mestre' : 'Modo Jogador'}
        </button>

        <div className="topbar__theme" ref={ref}>
          <button
            type="button"
            className="topbar__icon-btn"
            onClick={() => setPaletteOpen((v) => !v)}
            title="Trocar tema"
            aria-expanded={paletteOpen}
          >
            <IconPalette size={17} aria-hidden />
          </button>
          {paletteOpen ? (
            <div className="theme-menu" role="menu">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="menuitem"
                  className="theme-menu__item"
                  onClick={() => {
                    setTheme(t.id)
                    setPaletteOpen(false)
                  }}
                >
                  <span className={`theme-menu__swatch theme-menu__swatch--${t.id}`} />
                  <span className="theme-menu__text">
                    <strong>{t.nome}</strong>
                    <small>{t.descricao}</small>
                  </span>
                  {theme === t.id ? <IconCheck size={15} aria-hidden /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
