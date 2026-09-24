import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import './MapSidePanel.css'

interface MapSidePanelProps {
  expanded: boolean
  onToggleExpand: () => void
  head: ReactNode
  children: ReactNode
}

/** Floating map panel: left card on desktop, bottom sheet on mobile. */
export function MapSidePanel({ expanded, onToggleExpand, head, children }: MapSidePanelProps) {
  const { t } = useTranslation('mapa')
  return (
    <div className="map-panel panel" data-expanded={expanded}>
      <button
        type="button"
        className="map-panel__grabber"
        onClick={onToggleExpand}
        aria-label={expanded ? t('panel.collapse') : t('panel.expand')}
      >
        <span />
      </button>
      <div className="map-panel__head">{head}</div>
      <div className="map-panel__scroll">{children}</div>
    </div>
  )
}
