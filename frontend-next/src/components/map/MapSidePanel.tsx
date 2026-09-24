import type { ReactNode } from 'react'
import './MapSidePanel.css'

interface MapSidePanelProps {
  expanded: boolean
  onToggleExpand: () => void
  head: ReactNode
  children: ReactNode
}

/**
 * Painel de busca + lista + detalhe do Mapa, ao estilo Google/Apple Maps:
 * cartão fixo à esquerda no desktop, folha inferior recolhível no celular
 * (mostra só a busca em repouso; expande ao tocar ou ao selecionar algo).
 */
export function MapSidePanel({ expanded, onToggleExpand, head, children }: MapSidePanelProps) {
  return (
    <div className="map-panel panel" data-expanded={expanded}>
      <button type="button" className="map-panel__grabber" onClick={onToggleExpand} aria-label={expanded ? 'Recolher painel' : 'Expandir painel'}>
        <span />
      </button>
      <div className="map-panel__head">{head}</div>
      <div className="map-panel__scroll">{children}</div>
    </div>
  )
}
