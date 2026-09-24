import type { ReactNode } from 'react'
import type { FocusEvent } from 'react'
import { useTranslation } from 'react-i18next'
import './MapSidePanel.css'

interface MapSidePanelProps {
  expanded: boolean
  onToggleExpand: () => void
  onFocusWithinChange?: (focused: boolean) => void
  head: ReactNode
  children: ReactNode
}

/** Floating map panel: left card on desktop, bottom sheet on mobile. */
export function MapSidePanel({
  expanded,
  onToggleExpand,
  onFocusWithinChange,
  head,
  children,
}: MapSidePanelProps) {
  const { t } = useTranslation('mapa')

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onFocusWithinChange?.(false)
    }
  }

  return (
    <div
      className="map-panel panel"
      data-expanded={expanded}
      onFocus={() => onFocusWithinChange?.(true)}
      onBlur={handleBlur}
    >
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
