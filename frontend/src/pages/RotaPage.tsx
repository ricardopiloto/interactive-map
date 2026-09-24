import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { IconMapPin2 } from '@tabler/icons-react'
import { campaignApi } from '../api/campaign'
import { defaultMapUrl } from '../api/campaignSlug'
import { Button } from '../components/ui'
import { CampaignMap } from '../components/map/CampaignMap'
import { MapSidePanel } from '../components/map/MapSidePanel'
import { CodexHeader } from '../components/layout/CodexHeader'
import { RouteDigitizerView } from '../components/gm/RouteDigitizerView'
import { RoutePlannerPanel } from '../components/routes/RoutePlannerPanel'
import { useEditMode } from '../context/EditModeContext'
import { useCampaignData } from '../hooks/useCampaignData'
import { getCachedInstanceConfig, useInstanceConfig } from '../hooks/useInstanceConfig'
import type { RoutePlanItem, Waypoint } from '../types'
import './RotaPage.css'

const MOBILE_BP = 860

function reloadWaypoints(setWaypoints: (rows: Waypoint[]) => void) {
  return campaignApi
    .listWaypoints(false)
    .then(setWaypoints)
    .catch(() => setWaypoints([]))
}

/** Canonical route planner: full-bleed map + shared floating panel (spec 116). */
export function RotaPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t } = useTranslation('comum')
  const { t: tm } = useTranslation('mapa')
  const { config: instanceConfig } = useInstanceConfig(slug)
  const cfg = getCachedInstanceConfig(slug) ?? instanceConfig
  const { canEdit, enabled: isGm } = useEditMode()
  const { locais, grupo, loading, error, refresh } = useCampaignData(isGm)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [plan, setPlan] = useState<RoutePlanItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [formFocused, setFormFocused] = useState(false)
  const [digitizerOpen, setDigitizerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false,
  )
  const [mapUrl, setMapUrl] = useState(() =>
    defaultMapUrl(slug, cfg?.map_url, cfg?.mapa_arquivo),
  )

  const refreshNetwork = useCallback(() => {
    refresh()
    void reloadWaypoints(setWaypoints)
  }, [refresh])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BP)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (cfg?.map_url || cfg?.mapa_arquivo) {
      setMapUrl(defaultMapUrl(slug, cfg.map_url, cfg.mapa_arquivo))
    }
  }, [cfg?.map_url, cfg?.mapa_arquivo, slug])

  useEffect(() => {
    let cancelled = false
    void campaignApi
      .listWaypoints(false)
      .then((rows) => {
        if (!cancelled) setWaypoints(rows)
      })
      .catch(() => {
        if (!cancelled) setWaypoints([])
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!isGm) setDigitizerOpen(false)
  }, [isGm])

  /** Expande com rota calculada; colapsa quando a ação termina — formulário sem foco
   *  e nenhuma rota calculada (BKLG-004, equivalente de "busca"/"seleção" para a Rota). */
  useEffect(() => {
    if (plan.length > 0) {
      setExpanded(true)
      return
    }
    if (!formFocused) setExpanded(false)
  }, [plan.length, formFocused])

  const showMapNav = Boolean(cfg?.has_map_image) || canEdit

  return (
    <div className={`rota-page${isMobile ? ' rota-page--mobile' : ''}`}>
      <CodexHeader campaignName={cfg?.nome} showMapNav={showMapNav} />
      <main className="rota-page__stage">
        {loading ? <p className="rota-page__status">{t('loading.campaign')}</p> : null}
        {error ? <p className="rota-page__status rota-page__status--error">{error}</p> : null}

        {!loading && !error ? (
          <CampaignMap
            mapUrl={mapUrl}
            locais={locais}
            grupo={grupo}
            selectedLocalId={null}
            onSelectLocal={() => undefined}
            interactivePins={false}
            placementMode="none"
            mapEditable={false}
            travelPlan={plan}
            travelSelectedIndex={selectedIndex}
          />
        ) : null}

        {isGm && !loading && !error && !digitizerOpen ? (
          <Button
            type="button"
            className="rota-page__digitizer-btn"
            onClick={() => setDigitizerOpen(true)}
          >
            <IconMapPin2 size={16} aria-hidden />
            {tm('mapPage.routeNetwork')}
          </Button>
        ) : null}

        {!loading && !error && !digitizerOpen ? (
          <RoutePlannerPanel
            waypoints={waypoints}
            locais={locais}
            open
            mapPick={null}
            plan={plan}
            selectedIndex={selectedIndex}
            onPlanChange={(rotas, idx) => {
              setPlan(rotas)
              setSelectedIndex(idx)
              if (rotas.length > 0) setExpanded(true)
            }}
            onSelectIndex={(idx) => {
              setSelectedIndex(idx)
              setExpanded(true)
            }}
            renderShell={({ form, results }) => (
              <MapSidePanel
                expanded={expanded}
                onToggleExpand={() => setExpanded((v) => !v)}
                head={
                  <div
                    className="rota-page__panel-head"
                    onFocus={() => {
                      setFormFocused(true)
                      setExpanded(true)
                    }}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setFormFocused(false)
                      }
                    }}
                  >
                    <h2 className="rota-page__panel-title">{tm('routePlanner.title')}</h2>
                    {form}
                  </div>
                }
              >
                {results}
              </MapSidePanel>
            )}
          />
        ) : null}

        {digitizerOpen && isGm ? (
          <RouteDigitizerView
            mapUrl={mapUrl}
            locais={locais}
            onCampaignChanged={refreshNetwork}
            onClose={() => {
              setDigitizerOpen(false)
              refreshNetwork()
            }}
          />
        ) : null}
      </main>
    </div>
  )
}
