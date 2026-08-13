import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import type { VinculoTipo } from '../../types'
import { VINCULO_STYLES, VINCULO_TIPOS } from './vinculoStyles'
import './RelacoesSideColumn.css'

const CLICK_DELAY_MS = 280

interface RelacoesSideColumnProps {
  query: string
  onQueryChange: (value: string) => void
  activeTipos: Set<VinculoTipo>
  onToggleTipo: (tipo: VinculoTipo) => void
  onDoubleClickTipo: (tipo: VinculoTipo) => void
  isolate: boolean
  onToggleIsolate: (value: boolean) => void
  isolateDisabled?: boolean
}

export function RelacoesSideColumn({
  query,
  onQueryChange,
  activeTipos,
  onToggleTipo,
  onDoubleClickTipo,
  isolate,
  onToggleIsolate,
  isolateDisabled = false,
}: RelacoesSideColumnProps) {
  const pendingClick = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pendingClick.current != null) clearTimeout(pendingClick.current)
    }
  }, [])

  function clearPendingClick() {
    if (pendingClick.current != null) {
      clearTimeout(pendingClick.current)
      pendingClick.current = null
    }
  }

  function handleChipClick(tipo: VinculoTipo) {
    clearPendingClick()
    pendingClick.current = setTimeout(() => {
      pendingClick.current = null
      onToggleTipo(tipo)
    }, CLICK_DELAY_MS)
  }

  function handleChipDoubleClick(e: MouseEvent<HTMLButtonElement>, tipo: VinculoTipo) {
    e.preventDefault()
    clearPendingClick()
    onDoubleClickTipo(tipo)
  }

  return (
    <aside className="relacoes-side">
      <div className="relacoes-side__section">
        <input
          className="input"
          type="search"
          placeholder="Buscar personagem…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="relacoes-side__section">
        <h6>Tipos de vínculo</h6>
        <div className="relacoes-side__chips">
          {VINCULO_TIPOS.map((tipo) => {
            const style = VINCULO_STYLES[tipo]
            const active = activeTipos.has(tipo)
            return (
              <button
                key={tipo}
                type="button"
                className={`relacoes-side__chip${active ? ' relacoes-side__chip--active' : ''}`}
                style={{ '--chip-color': style.color } as CSSProperties}
                onClick={() => handleChipClick(tipo)}
                onDoubleClick={(e) => handleChipDoubleClick(e, tipo)}
                aria-pressed={active}
              >
                <span className="relacoes-side__chip-dot" />
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relacoes-side__section">
        <label className="relacoes-side__isolate">
          <input
            type="checkbox"
            checked={isolate}
            disabled={isolateDisabled}
            onChange={(e) => onToggleIsolate(e.target.checked)}
          />
          Isolar seleção
        </label>
      </div>

      <div className="relacoes-side__legend">
        <h6>Legenda</h6>
        <div className="relacoes-side__legend-row">
          <span className="relacoes-side__legend-disc relacoes-side__legend-disc--pj" />
          PJ
        </div>
        <div className="relacoes-side__legend-row">
          <span className="relacoes-side__legend-disc relacoes-side__legend-disc--npc" />
          NPC
        </div>
        <div className="hr" />
        {VINCULO_TIPOS.map((tipo) => {
          const style = VINCULO_STYLES[tipo]
          return (
            <div key={tipo} className="relacoes-side__legend-row">
              <span
                className={`relacoes-side__legend-line${style.dashed ? ' relacoes-side__legend-line--dashed' : ''}`}
                style={{ '--chip-color': style.color } as CSSProperties}
              />
              {style.label}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
