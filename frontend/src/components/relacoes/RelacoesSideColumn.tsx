import { useEffect, useMemo, useRef, type CSSProperties, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Personagem, VinculoTipo } from '../../types'
import { labelMatchesQuery } from '../../utils/textMatch'
import { VINCULO_STYLES, VINCULO_TIPOS, getVinculoTipoLabel } from './vinculoStyles'
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
  personagens: Personagem[]
  selectedId: number | null
  onSelectPersonagem: (id: number) => void
  onPersonagemHover?: (id: number | null) => void
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
  personagens,
  selectedId,
  onSelectPersonagem,
  onPersonagemHover,
}: RelacoesSideColumnProps) {
  const { t } = useTranslation('relacoes')
  const { t: tc } = useTranslation('comum')
  const pendingClick = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pendingClick.current != null) clearTimeout(pendingClick.current)
      onPersonagemHover?.(null)
    }
  }, [onPersonagemHover])

  const listItems = useMemo(() => {
    return personagens
      .filter((p) => labelMatchesQuery(p.nome, query))
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
  }, [personagens, query])

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

  const hasQuery = query.trim().length > 0

  return (
    <aside className="relacoes-side">
      <div className="relacoes-side__section">
        <input
          className="input"
          type="search"
          placeholder={t('column.search')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="relacoes-side__section">
        <h6>{t('column.tiposVinculo')}</h6>
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
                {getVinculoTipoLabel(t, tipo)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relacoes-side__section relacoes-side__list-section">
        <h6>{t('column.personagens')}</h6>
        {listItems.length === 0 ? (
          <p className="relacoes-side__list-empty">
            {hasQuery ? t('column.listEmptySearch') : t('column.listEmpty')}
          </p>
        ) : (
          <ul className="relacoes-side__list">
            {listItems.map((p) => {
              const selected = p.id === selectedId
              const oculto = p.visivel_para_todos === false
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`relacoes-side__list-item${selected ? ' relacoes-side__list-item--selected' : ''}`}
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => onSelectPersonagem(p.id)}
                    onPointerEnter={() => onPersonagemHover?.(p.id)}
                    onPointerLeave={() => onPersonagemHover?.(null)}
                  >
                    <span className="relacoes-side__list-name">{p.nome}</span>
                    {oculto ? (
                      <span
                        className="relacoes-side__list-oculto"
                        title={t('graph.ocultoAria')}
                        aria-label={t('graph.ocultoAria')}
                      />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="relacoes-side__section">
        <label className="relacoes-side__isolate">
          <input
            type="checkbox"
            checked={isolate}
            disabled={isolateDisabled}
            onChange={(e) => onToggleIsolate(e.target.checked)}
          />
          {t('column.isolate')}
        </label>
      </div>

      <div className="relacoes-side__legend">
        <h6>{t('column.legend')}</h6>
        <div className="relacoes-side__legend-row">
          <span className="relacoes-side__legend-disc relacoes-side__legend-disc--pj" />
          {tc('tipo.pj')}
        </div>
        <div className="relacoes-side__legend-row">
          <span className="relacoes-side__legend-disc relacoes-side__legend-disc--npc" />
          {tc('tipo.npc')}
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
              {getVinculoTipoLabel(t, tipo)}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
