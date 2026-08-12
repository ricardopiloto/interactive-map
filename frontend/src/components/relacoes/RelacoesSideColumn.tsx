import type { CSSProperties } from 'react'
import type { VinculoTipo } from '../../types'
import { VINCULO_STYLES, VINCULO_TIPOS } from './vinculoStyles'
import './RelacoesSideColumn.css'

interface RelacoesSideColumnProps {
  query: string
  onQueryChange: (value: string) => void
  activeTipos: Set<VinculoTipo>
  onToggleTipo: (tipo: VinculoTipo) => void
  isolate: boolean
  onToggleIsolate: (value: boolean) => void
  isolateDisabled?: boolean
}

export function RelacoesSideColumn({
  query,
  onQueryChange,
  activeTipos,
  onToggleTipo,
  isolate,
  onToggleIsolate,
  isolateDisabled = false,
}: RelacoesSideColumnProps) {
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
                onClick={() => onToggleTipo(tipo)}
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
