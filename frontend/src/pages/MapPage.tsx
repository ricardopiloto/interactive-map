import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminApi } from '../api/admin'
import { campaignApi } from '../api/campaign'
import {
  clearAdminCredentials,
  hasAdminCredentials,
  setAdminCredentials,
} from '../api/client'
import { CampaignMap, type PinFocusRequest } from '../components/map/CampaignMap'
import { PinModal } from '../components/common/PinModal'
import { SideMenu, type SideTab } from '../components/sidebar/SideMenu'
import { AdminGateDialog } from '../components/gm/AdminGateDialog'
import { RouteDigitizerView } from '../components/gm/RouteDigitizerView'
import { RoutePlannerPanel } from '../components/routes/RoutePlannerPanel'
import { LocalAdminList } from '../components/admin/LocalAdminList'
import { LocalFormDialog, localToDraft, type LocalFormDraft } from '../components/admin/LocalFormDialog'
import { NpcAdminList, NpcFormDialog } from '../components/admin/NpcAdminList'
import { ArcoAdminList, ArcoFormDialog } from '../components/admin/ArcoAdminList'
import { GrupoAdminPanel } from '../components/admin/GrupoAdminPanel'
import { useCampaignData } from '../hooks/useCampaignData'
import type { GrupoFormato, NPCStatus, RoutePlanItem, Waypoint } from '../types'
import './MapPage.css'

const DEFAULT_MAP_URL = import.meta.env.VITE_MAP_URL ?? '/uploads/map/campaign-map.webp'
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? 'gm'
const MOBILE_BP = 800

type Placement = 'none' | 'add-pin' | 'reposition' | 'move-group'

export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { locais, npcs, arcos, grupo, loading, error, refresh } = useCampaignData()
  const [tab, setTab] = useState<SideTab>('locais')
  const [query, setQuery] = useState('')
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null)
  const [hoveredLocalId, setHoveredLocalId] = useState<number | null>(null)
  const [focusRequest, setFocusRequest] = useState<PinFocusRequest | null>(null)
  const [selectedNpcId, setSelectedNpcId] = useState<number | null>(null)
  const [selectedArcoId, setSelectedArcoId] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false,
  )
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

  const [isGm, setIsGm] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [gateError, setGateError] = useState(false)
  const [placement, setPlacement] = useState<Placement>('none')
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP_URL)
  const [busyError, setBusyError] = useState<string | null>(null)

  const [localDraft, setLocalDraft] = useState<LocalFormDraft | null>(null)
  const [routePlannerOpen, setRoutePlannerOpen] = useState(false)
  const [travelPlan, setTravelPlan] = useState<RoutePlanItem[]>([])
  const [travelSelectedIndex, setTravelSelectedIndex] = useState(0)
  const [routeWaypoints, setRouteWaypoints] = useState<Waypoint[]>([])
  const [routeDigitizerOpen, setRouteDigitizerOpen] = useState(false)
  const [npcDraft, setNpcDraft] = useState<{
    id?: number
    nome: string
    descricao: string
    faccao: string
    status: NPCStatus
    retrato_url: string | null
    isNew: boolean
  } | null>(null)
  const [arcoDraft, setArcoDraft] = useState<{
    id?: number
    titulo: string
    resumo: string
    ordem: number
    isNew: boolean
  } | null>(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BP)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (searchParams.get('gm') === '1' || searchParams.get('admin') === '1') {
      setShowGate(true)
      const next = new URLSearchParams(searchParams)
      next.delete('gm')
      next.delete('admin')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!hasAdminCredentials()) return
    void adminApi
      .session()
      .then(() => setIsGm(true))
      .catch(() => {
        clearAdminCredentials()
        setIsGm(false)
      })
  }, [])

  useEffect(() => {
    void campaignApi
      .listWaypoints(false)
      .then(setRouteWaypoints)
      .catch(() => setRouteWaypoints([]))
  }, [locais, routeDigitizerOpen])

  const selectedLocal = useMemo(
    () => locais.find((l) => l.id === selectedLocalId) ?? null,
    [locais, selectedLocalId],
  )

  /** Map pins/lines: edit draft overrides persisted coords until save/cancel (033). */
  const displayLocais = useMemo(() => {
    if (!localDraft || localDraft.isNew || localDraft.id == null) return locais
    return locais.map((l) =>
      l.id === localDraft.id
        ? { ...l, x: localDraft.x, y: localDraft.y, cor_pin: localDraft.cor_pin }
        : l,
    )
  }, [locais, localDraft])

  const selectedArco = useMemo(() => {
    if (!selectedLocal?.arco_id) return null
    return arcos.find((a) => a.id === selectedLocal.arco_id) ?? null
  }, [arcos, selectedLocal])

  function selectLocal(id: number) {
    if (isGm && placement !== 'none') return
    setSelectedLocalId(id)
    setSelectedNpcId(null)
    if (isMobile) setMobilePanelOpen(false)
  }

  function selectLocalFromMenu(id: number) {
    if (isGm && placement !== 'none') return
    selectLocal(id)
    setFocusRequest({ localId: id, nonce: Date.now() })
  }

  /** Player map-pin click: select + focus (015). GM: select only, no focusRequest. */
  function selectLocalFromMap(id: number) {
    if (isGm && placement !== 'none') return
    selectLocal(id)
    if (isGm) return
    setFocusRequest({ localId: id, nonce: Date.now() })
  }

  function selectNpc(id: number) {
    setSelectedNpcId((prev) => (prev === id ? null : id))
    setTab('npcs')
    setSelectedLocalId(null)
    if (isMobile) setMobilePanelOpen(true)
  }

  function selectArco(id: number) {
    setSelectedArcoId((prev) => (prev === id ? null : id))
    setTab('arcos')
    setSelectedLocalId(null)
    if (isMobile) setMobilePanelOpen(true)
  }

  async function submitGate(password: string) {
    setGateError(false)
    setAdminCredentials(ADMIN_USER, password)
    try {
      await adminApi.session()
      setIsGm(true)
      setShowGate(false)
      setTab('locais')
    } catch {
      clearAdminCredentials()
      setGateError(true)
    }
  }

  function logoutGm() {
    clearAdminCredentials()
    setIsGm(false)
    setPlacement('none')
    setLocalDraft(null)
    setNpcDraft(null)
    setArcoDraft(null)
    setTab('locais')
  }

  async function saveLocal() {
    if (!localDraft || !localDraft.nome.trim()) return
    setBusyError(null)
    try {
      const payload = {
        nome: localDraft.nome.trim(),
        descricao: localDraft.descricao,
        x: localDraft.x,
        y: localDraft.y,
        data_sessao: localDraft.data_sessao.trim() || null,
        arco_id: localDraft.arco_id,
        npc_ids: localDraft.npc_ids,
        saida_ids: localDraft.saida_ids,
        imagem_url: localDraft.imagem_url,
        cor_pin: localDraft.cor_pin,
        waypoint_id: localDraft.waypoint_id,
      }
      if (localDraft.isNew) await adminApi.createLocal(payload)
      else if (localDraft.id != null) await adminApi.updateLocal(localDraft.id, payload)
      setLocalDraft(null)
      setPlacement('none')
      refresh()
    } catch (e) {
      setBusyError(e instanceof Error ? e.message : 'Erro ao salvar local')
    }
  }

  async function saveNpc() {
    if (!npcDraft || !npcDraft.nome.trim()) return
    try {
      const payload = {
        nome: npcDraft.nome.trim(),
        descricao: npcDraft.descricao,
        faccao: npcDraft.faccao.trim() || null,
        status: npcDraft.status,
        retrato_url: npcDraft.retrato_url,
      }
      if (npcDraft.isNew) await adminApi.createNpc(payload)
      else if (npcDraft.id != null) await adminApi.updateNpc(npcDraft.id, payload)
      setNpcDraft(null)
      refresh()
    } catch (e) {
      setBusyError(e instanceof Error ? e.message : 'Erro ao salvar NPC')
    }
  }

  async function saveArco() {
    if (!arcoDraft || !arcoDraft.titulo.trim()) return
    try {
      const payload = {
        titulo: arcoDraft.titulo.trim(),
        resumo: arcoDraft.resumo,
        ordem: arcoDraft.ordem,
      }
      if (arcoDraft.isNew) await adminApi.createArco(payload)
      else if (arcoDraft.id != null) await adminApi.updateArco(arcoDraft.id, payload)
      setArcoDraft(null)
      refresh()
    } catch (e) {
      setBusyError(e instanceof Error ? e.message : 'Erro ao salvar arco')
    }
  }

  async function changeFormato(formato: GrupoFormato) {
    if (!grupo) return
    await adminApi.updateGrupo({ x: grupo.x, y: grupo.y, formato })
    refresh()
  }

  const tabs: SideTab[] = isGm ? ['locais', 'npcs', 'arcos', 'grupo'] : ['locais', 'npcs', 'arcos']
  const showSidebar = !isMobile || mobilePanelOpen

  const adminPanel = isGm ? (
    <>
      {busyError && <p className="map-page__inline-error">{busyError}</p>}
      {tab === 'locais' && (
        <LocalAdminList
          locais={locais}
          arcos={arcos}
          adding={placement === 'add-pin'}
          onStartAdd={() => {
            setLocalDraft(null)
            setSelectedLocalId(null)
            setPlacement('add-pin')
          }}
          onCancelAdd={() => setPlacement('none')}
          onEdit={(loc) => {
            setPlacement('none')
            setLocalDraft(localToDraft(loc))
          }}
          onDelete={async (id) => {
            await adminApi.deleteLocal(id)
            refresh()
          }}
          onLocalHover={setHoveredLocalId}
        />
      )}
      {tab === 'npcs' && (
        <NpcAdminList
          npcs={npcs}
          onAdd={() =>
            setNpcDraft({
              nome: '',
              descricao: '',
              faccao: '',
              status: 'vivo',
              retrato_url: null,
              isNew: true,
            })
          }
          onEdit={(npc) =>
            setNpcDraft({
              id: npc.id,
              nome: npc.nome,
              descricao: npc.descricao,
              faccao: npc.faccao ?? '',
              status: npc.status ?? 'desconhecido',
              retrato_url: npc.retrato_url,
              isNew: false,
            })
          }
          onDelete={async (id) => {
            await adminApi.deleteNpc(id)
            refresh()
          }}
        />
      )}
      {tab === 'arcos' && (
        <ArcoAdminList
          arcos={arcos}
          onAdd={() =>
            setArcoDraft({ titulo: '', resumo: '', ordem: arcos.length + 1, isNew: true })
          }
          onEdit={(arco) =>
            setArcoDraft({
              id: arco.id,
              titulo: arco.titulo,
              resumo: arco.resumo,
              ordem: arco.ordem,
              isNew: false,
            })
          }
          onDelete={async (id) => {
            await adminApi.deleteArco(id)
            refresh()
          }}
        />
      )}
      {tab === 'grupo' && grupo && (
        <GrupoAdminPanel
          x={grupo.x}
          y={grupo.y}
          formato={grupo.formato ?? 'bandeira'}
          moving={placement === 'move-group'}
          onStartMove={() => setPlacement('move-group')}
          onCancelMove={() => setPlacement('none')}
          onFormatoChange={(f) => void changeFormato(f)}
        />
      )}
    </>
  ) : undefined

  return (
    <div className={`map-page${isMobile ? ' map-page--mobile' : ''}`}>
      {showSidebar && (
        <SideMenu
          tab={tab}
          onTabChange={(t) => {
            setTab(t)
            setHoveredLocalId(null)
            if (isMobile) setMobilePanelOpen(true)
          }}
          locais={locais}
          npcs={npcs}
          arcos={arcos}
          query={query}
          onQueryChange={setQuery}
          selectedNpcId={selectedNpcId}
          selectedArcoId={selectedArcoId}
          onSelectLocal={selectLocalFromMenu}
          onSelectNpc={selectNpc}
          onSelectArco={selectArco}
          onLocalHover={setHoveredLocalId}
          isMobileOverlay={isMobile}
          onCloseMobile={() => setMobilePanelOpen(false)}
          tabs={tabs}
          isGm={isGm}
          adminPanel={adminPanel}
        />
      )}

      <main className="map-page__main">
        <header className="map-page__top">
          <div className="map-page__top-left">
            <span className="map-page__brand">Codex da Campanha</span>
            <span className="map-page__subtitle text-muted">Mapa da campanha WFRP4e</span>
            {isGm && <span className="tag tag-accent">Modo GM</span>}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setRoutePlannerOpen((o) => !o)
                if (routePlannerOpen) {
                  setTravelPlan([])
                  setTravelSelectedIndex(0)
                }
              }}
            >
              Calcular rota
            </button>
            {isGm && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setRouteDigitizerOpen(true)
                  setPlacement('none')
                  setTravelPlan([])
                  setRoutePlannerOpen(false)
                }}
              >
                Rede de rotas
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn-ghost map-page__corner"
            onClick={() => {
              if (isGm) logoutGm()
              else {
                setGateError(false)
                setShowGate(true)
              }
            }}
          >
            {isGm ? 'Modo GM · Sair' : 'Acesso restrito (GM)'}
          </button>
        </header>

        {loading && <p className="map-page__status">Carregando campanha…</p>}
        {error && <p className="map-page__status map-page__status--error">{error}</p>}
        <div className="map-page__map">
          {!loading && !error && (
            <>
              <CampaignMap
                mapUrl={mapUrl}
                locais={displayLocais}
                grupo={grupo}
                selectedLocalId={selectedLocalId}
                hoveredLocalId={hoveredLocalId}
                onSelectLocal={selectLocalFromMap}
                focusRequest={focusRequest}
                onFocusApplied={() => setFocusRequest(null)}
                interactivePins={!isGm || placement === 'none'}
                placementMode={isGm ? placement : 'none'}
                mapEditable={isGm}
                travelPlan={travelPlan}
                travelSelectedIndex={travelSelectedIndex}
                onClearSelection={isGm ? () => setSelectedLocalId(null) : undefined}
                onCancelPlacement={
                  isGm && placement === 'reposition' ? () => setPlacement('none') : undefined
                }
                onMapUploaded={(url) => setMapUrl(`${url}?t=${Date.now()}`)}
                onMapClickRelative={async (x, y) => {
                  if (!isGm) return
                  if (placement === 'add-pin') {
                    setLocalDraft({
                      nome: '',
                      descricao: '',
                      data_sessao: '',
                      arco_id: arcos[0]?.id ?? null,
                      npc_ids: [],
                      saida_ids: [],
                      x,
                      y,
                      imagem_url: null,
                      cor_pin: '#c4b5fd',
                      waypoint_id: null,
                      isNew: true,
                    })
                    setPlacement('none')
                  } else if (placement === 'reposition' && localDraft) {
                    setLocalDraft({ ...localDraft, x, y })
                    setPlacement('none')
                  } else if (placement === 'move-group' && grupo) {
                    await adminApi.updateGrupo({
                      x,
                      y,
                      formato: grupo.formato ?? 'bandeira',
                    })
                    setPlacement('none')
                    refresh()
                  }
                }}
              />
              <RoutePlannerPanel
                waypoints={routeWaypoints}
                locais={locais}
                open={routePlannerOpen}
                onClose={() => {
                  setRoutePlannerOpen(false)
                  setTravelPlan([])
                  setTravelSelectedIndex(0)
                }}
                plan={travelPlan}
                selectedIndex={travelSelectedIndex}
                onPlanChange={(rotas, idx) => {
                  setTravelPlan(rotas)
                  setTravelSelectedIndex(idx)
                }}
                onSelectIndex={setTravelSelectedIndex}
              />
            </>
          )}
          {routeDigitizerOpen && isGm && (
            <RouteDigitizerView
              mapUrl={mapUrl}
              locais={locais}
              onCampaignChanged={() => refresh()}
              onClose={() => {
                setRouteDigitizerOpen(false)
                refresh()
              }}
            />
          )}
        </div>

        {!isGm && selectedLocal && (
          <PinModal
            local={selectedLocal}
            npcs={npcs}
            arco={selectedArco}
            onClose={() => setSelectedLocalId(null)}
            onOpenNpc={(id) => {
              setSelectedLocalId(null)
              selectNpc(id)
            }}
            onOpenArco={(id) => {
              setSelectedLocalId(null)
              selectArco(id)
            }}
          />
        )}
      </main>

      {isMobile && (
        <nav className="map-page__bottom" aria-label="Navegação">
          {tabs
            .filter((t) => t !== 'grupo' || isGm)
            .map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t && mobilePanelOpen ? 'active' : ''}
                onClick={() => {
                  setTab(t)
                  setMobilePanelOpen(true)
                }}
              >
                {t === 'locais' ? 'Locais' : t === 'npcs' ? 'NPCs' : t === 'arcos' ? 'História' : 'Grupo'}
              </button>
            ))}
        </nav>
      )}

      {showGate && (
        <AdminGateDialog
          error={gateError}
          onSubmit={(pw) => void submitGate(pw)}
          onCancel={() => {
            setShowGate(false)
            setGateError(false)
          }}
        />
      )}

      {localDraft && placement !== 'reposition' && (
        <LocalFormDialog
          draft={localDraft}
          arcos={arcos}
          npcs={npcs}
          locais={locais}
          waypoints={routeWaypoints}
          onChange={(patch) => setLocalDraft({ ...localDraft, ...patch })}
          onSave={() => void saveLocal()}
          onCancel={() => {
            setLocalDraft(null)
            setPlacement('none')
          }}
          onStartReposition={() => setPlacement('reposition')}
        />
      )}

      {npcDraft && (
        <NpcFormDialog
          title={npcDraft.isNew ? 'Novo NPC' : 'Editar NPC'}
          nome={npcDraft.nome}
          descricao={npcDraft.descricao}
          faccao={npcDraft.faccao}
          status={npcDraft.status}
          retrato_url={npcDraft.retrato_url}
          onChange={(patch) => setNpcDraft({ ...npcDraft, ...patch })}
          onSave={() => void saveNpc()}
          onCancel={() => setNpcDraft(null)}
        />
      )}

      {arcoDraft && (
        <ArcoFormDialog
          title={arcoDraft.isNew ? 'Novo arco' : 'Editar arco'}
          titulo={arcoDraft.titulo}
          resumo={arcoDraft.resumo}
          ordem={arcoDraft.ordem}
          onChange={(patch) => setArcoDraft({ ...arcoDraft, ...patch })}
          onSave={() => void saveArco()}
          onCancel={() => setArcoDraft(null)}
        />
      )}
    </div>
  )
}
