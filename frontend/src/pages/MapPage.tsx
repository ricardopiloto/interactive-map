import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { adminApi } from '../api/admin'
import { campaignApi } from '../api/campaign'
import { CampaignMap, type PinFocusRequest } from '../components/map/CampaignMap'
import { MapSidePanel } from '../components/map/MapSidePanel'
import { CodexHeader } from '../components/layout/CodexHeader'
import { LocalFormDialog, localToDraft, type LocalFormDraft } from '../components/admin/LocalFormDialog'
import { NpcFormDialog } from '../components/admin/NpcAdminList'
import { ArcoAdminList, ArcoFormDialog } from '../components/admin/ArcoAdminList'
import { ImageSlot } from '../components/media/ImageSlot'
import { MarkdownSafe } from '../components/common/MarkdownSafe'
import { ConfirmDialog, IconButton, Button, Chip} from '../components/ui'
import { useApiErrorMessage } from '../hooks/useApiErrorMessage'
import { useCampaignData } from '../hooks/useCampaignData'
import { useEditMode } from '../context/EditModeContext'
import { defaultMapUrl } from '../api/campaignSlug'
import { markHasMapImageInCache, useInstanceConfig } from '../hooks/useInstanceConfig'
import type { GrupoFormato, Local, NPC, NPCStatus, Waypoint } from '../types'
import { labelMatchesQuery } from '../utils/textMatch'
import './MapPage.css'

const MOBILE_BP = 860

type Placement = 'none' | 'add-pin' | 'reposition' | 'move-group'
type PanelFilter = 'todos' | 'locais' | 'npcs'
type PanelSelection = { kind: 'local' | 'npc'; id: number } | null

function isVisited(local: Local): boolean {
  return local.estado_exploracao === 'visitado'
}

function MapCharacterAvatar({ character }: { character: NPC }) {
  const [portraitFailed, setPortraitFailed] = useState(false)

  useEffect(() => {
    setPortraitFailed(false)
  }, [character.retrato_url])

  return (
    <span className="map-page__avatar" aria-hidden>
      {character.nome.trim().charAt(0).toUpperCase() || '?'}
      {character.retrato_url && !portraitFailed ? (
        <img
          src={character.retrato_url}
          alt=""
          onError={() => setPortraitFailed(true)}
        />
      ) : null}
    </span>
  )
}

export function MapPage() {
  const { t } = useTranslation('mapa')
  const { t: tc } = useTranslation('comum')
  const { t: ta } = useTranslation('admin')
  const navigate = useNavigate()
  const { slug = '' } = useParams<{ slug: string }>()
  const apiErrorMessage = useApiErrorMessage()
  const { config: instanceConfig } = useInstanceConfig(slug)
  const [searchParams, setSearchParams] = useSearchParams()
  const { enabled: isGm, canEdit, canEditReady } = useEditMode()
  const { locais, npcs, arcos, grupo, loading, error, refresh } = useCampaignData(isGm)
  const [groupOverride, setGroupOverride] = useState<typeof grupo>(null)
  const activeGroup = groupOverride ?? grupo

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<PanelFilter>('todos')
  const [selected, setSelected] = useState<PanelSelection>(null)
  const [expanded, setExpanded] = useState(false)
  const [panelFocused, setPanelFocused] = useState(false)
  const [hoveredLocalId, setHoveredLocalId] = useState<number | null>(null)
  const [focusRequest, setFocusRequest] = useState<PinFocusRequest | null>(null)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false,
  )

  const [mapImagePresent, setMapImagePresent] = useState(
    () => Boolean(instanceConfig?.has_map_image),
  )
  const [placement, setPlacement] = useState<Placement>('none')
  const [mapUrl, setMapUrl] = useState(() =>
    defaultMapUrl(slug, instanceConfig?.map_url, instanceConfig?.mapa_arquivo),
  )
  const [busyError, setBusyError] = useState<string | null>(null)
  const [groupSaving, setGroupSaving] = useState(false)
  const [retryGroupPosition, setRetryGroupPosition] = useState<{ x: number; y: number } | null>(null)
  const [gmMenuOpen, setGmMenuOpen] = useState(false)
  const [arcoManagerOpen, setArcoManagerOpen] = useState(false)
  const [confirmDeleteLocalId, setConfirmDeleteLocalId] = useState<number | null>(null)

  const [localDraft, setLocalDraft] = useState<LocalFormDraft | null>(null)
  const [routeWaypoints, setRouteWaypoints] = useState<Waypoint[]>([])
  const [npcDraft, setNpcDraft] = useState<{
    id?: number
    nome: string
    papel: string
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
    visivel_para_todos: boolean
    isNew: boolean
  } | null>(null)

  useEffect(() => {
    if (grupo) setGroupOverride(null)
  }, [grupo])

  useEffect(() => {
    if (instanceConfig && !instanceConfig.has_map_image && !mapImagePresent) {
      setMapUrl('')
    }
    if (instanceConfig?.has_map_image) {
      setMapImagePresent(true)
      setMapUrl(
        (prev) =>
          prev ||
          defaultMapUrl(slug, instanceConfig.map_url, instanceConfig.mapa_arquivo),
      )
    }
  }, [instanceConfig, mapImagePresent, slug])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BP)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (searchParams.get('gm') === '1' || searchParams.get('admin') === '1') {
      const next = new URLSearchParams(searchParams)
      next.delete('gm')
      next.delete('admin')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const raw = searchParams.get('local')
    if (!raw || loading) return
    const id = Number(raw)
    if (!Number.isFinite(id)) return
    if (!locais.some((l) => l.id === id)) return
    setSelected({ kind: 'local', id })
    setExpanded(true)
    const next = new URLSearchParams(searchParams)
    next.delete('local')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, locais, loading])

  useEffect(() => {
    if (!canEditReady) return
    const hasMap = Boolean(instanceConfig?.has_map_image) || mapImagePresent
    if (instanceConfig && !hasMap && !canEdit) {
      navigate(`/c/${slug}/relacoes`, { replace: true })
    }
  }, [canEditReady, instanceConfig, mapImagePresent, canEdit, navigate, slug])

  useEffect(() => {
    if (isGm) return
    setPlacement('none')
    setLocalDraft(null)
    setNpcDraft(null)
    setArcoDraft(null)
    setGmMenuOpen(false)
    setArcoManagerOpen(false)
    setConfirmDeleteLocalId(null)
  }, [isGm])

  useEffect(() => {
    void campaignApi
      .listWaypoints(false, slug)
      .then(setRouteWaypoints)
      .catch(() => setRouteWaypoints([]))
  }, [locais, slug])

  /** Colapsa o painel quando a ação termina — busca sem foco e nada selecionado (BKLG-004). */
  useEffect(() => {
    if (!panelFocused && !selected) setExpanded(false)
  }, [panelFocused, selected])

  useEffect(() => {
    if (!selected) return
    if (selected.kind === 'local' && !locais.some((l) => l.id === selected.id)) {
      setSelected(null)
    }
    if (selected.kind === 'npc' && !npcs.some((n) => n.id === selected.id)) {
      setSelected(null)
    }
  }, [selected, locais, npcs])

  const selectedLocalId = selected?.kind === 'local' ? selected.id : null
  const selectedLocal = useMemo(
    () => (selectedLocalId != null ? locais.find((l) => l.id === selectedLocalId) ?? null : null),
    [locais, selectedLocalId],
  )
  const selectedNpc = useMemo(() => {
    if (selected?.kind !== 'npc') return null
    return npcs.find((n) => n.id === selected.id) ?? null
  }, [npcs, selected])

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

  const arcoById = useMemo(() => new Map(arcos.map((a) => [a.id, a])), [arcos])
  const localById = useMemo(() => new Map(locais.map((l) => [l.id, l])), [locais])

  const needle = query.trim()
  const filteredLocais = useMemo(() => {
    if (filter === 'npcs') return []
    return locais.filter((l) => labelMatchesQuery(l.nome, needle))
  }, [locais, filter, needle])
  const filteredNpcs = useMemo(() => {
    if (filter === 'locais') return []
    return npcs.filter((n) => labelMatchesQuery(n.nome, needle))
  }, [npcs, filter, needle])

  function selectLocal(id: number, opts?: { focus?: boolean }) {
    if (isGm && placement !== 'none') return
    setSelected({ kind: 'local', id })
    setExpanded(true)
    if (opts?.focus) {
      setFocusRequest({ target: 'local', localId: id, nonce: Date.now() })
    }
  }

  function selectLocalFromList(id: number) {
    selectLocal(id, { focus: true })
  }

  function selectLocalFromMap(id: number) {
    if (isGm && placement !== 'none') return
    selectLocal(id)
    if (!isGm) {
      setFocusRequest({ target: 'local', localId: id, nonce: Date.now() })
    }
  }

  function selectNpc(id: number) {
    if (isGm && placement !== 'none') return
    setSelected({ kind: 'npc', id })
    setExpanded(true)
  }

  function clearSelection() {
    setSelected(null)
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
        estado_exploracao: localDraft.estado_exploracao,
        arco_id: localDraft.arco_id,
        npc_ids: localDraft.npc_ids,
        saida_ids: localDraft.saida_ids,
        imagem_url: localDraft.imagem_url,
        cor_pin: localDraft.cor_pin,
        waypoint_id: localDraft.waypoint_id,
        visivel_para_todos: localDraft.visivel_para_todos,
      }
      let savedId = localDraft.id
      if (localDraft.isNew) {
        const created = await adminApi.createLocal(payload)
        savedId = created.id
      } else if (localDraft.id != null) {
        await adminApi.updateLocal(localDraft.id, payload)
      }
      setLocalDraft(null)
      setPlacement('none')
      refresh()
      if (savedId != null) setSelected({ kind: 'local', id: savedId })
    } catch (e) {
      setBusyError(apiErrorMessage(e))
    }
  }

  async function saveNpc() {
    if (!npcDraft || !npcDraft.nome.trim()) return
    try {
      const payload = {
        nome: npcDraft.nome.trim(),
        tipo: 'npc' as const,
        papel: npcDraft.papel.trim() || null,
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
      setBusyError(apiErrorMessage(e))
    }
  }

  async function saveArco() {
    if (!arcoDraft || !arcoDraft.titulo.trim()) return
    try {
      const payload = {
        titulo: arcoDraft.titulo.trim(),
        resumo: arcoDraft.resumo,
        ordem: arcoDraft.ordem,
        visivel_para_todos: arcoDraft.visivel_para_todos,
      }
      if (arcoDraft.isNew) await adminApi.createArco(payload)
      else if (arcoDraft.id != null) await adminApi.updateArco(arcoDraft.id, payload)
      setArcoDraft(null)
      refresh()
    } catch (e) {
      setBusyError(apiErrorMessage(e))
    }
  }

  async function deleteArco(id: number) {
    try {
      await adminApi.deleteArco(id)
      refresh()
    } catch (e) {
      setBusyError(apiErrorMessage(e))
    }
  }

  async function changeFormato(formato: GrupoFormato) {
    if (!activeGroup) return
    setBusyError(null)
    try {
      const updated = await adminApi.updateGrupo({ x: activeGroup.x, y: activeGroup.y, formato })
      setGroupOverride(updated)
      refresh()
    } catch {
      setBusyError(t('mapPage.saveGroupFormatError'))
    }
  }

  async function saveGroupPosition(x: number, y: number) {
    if (!activeGroup || groupSaving) return
    setBusyError(null)
    setRetryGroupPosition({ x, y })
    setGroupSaving(true)
    try {
      const updated = await adminApi.updateGrupo({ x, y, formato: activeGroup.formato ?? 'bandeira' })
      setGroupOverride(updated)
      setRetryGroupPosition(null)
      setPlacement('none')
      refresh()
    } catch {
      setBusyError(t('mapPage.saveGroupError'))
    } finally {
      setGroupSaving(false)
    }
  }

  function cancelGroupPlacement() {
    if (groupSaving) return
    setPlacement('none')
    setBusyError(null)
    setRetryGroupPosition(null)
  }

  async function confirmDeleteLocal() {
    if (confirmDeleteLocalId == null) return
    try {
      await adminApi.deleteLocal(confirmDeleteLocalId)
      setConfirmDeleteLocalId(null)
      setSelected(null)
      refresh()
    } catch (e) {
      setBusyError(apiErrorMessage(e))
      setConfirmDeleteLocalId(null)
    }
  }

  const panelHead = arcoManagerOpen ? (
    <Button variant="ghost" size="sm" type="button" onClick={() => setArcoManagerOpen(false)}>
      <IconArrowLeft size={15} aria-hidden /> {t('panel.backToList')}
    </Button>
  ) : !selected ? (
    <div>
      <div className="map-page__search">
        <IconSearch size={17} aria-hidden />
        <input
          className="map-page__search-input"
          placeholder={t('panel.searchPlaceholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setExpanded(true)
          }}
          onFocus={() => setExpanded(true)}
        />
      </div>
      <div className="map-page__chips" role="group" aria-label={t('panel.filterAll')}>
        <button
          type="button"
          className={`map-page__chip${filter === 'todos' ? ' is-active' : ''}`}
          onClick={() => {
            setFilter('todos')
            setExpanded(true)
          }}
        >
          {t('panel.filterAll')}
        </button>
        <button
          type="button"
          className={`map-page__chip${filter === 'locais' ? ' is-active' : ''}`}
          onClick={() => {
            setFilter('locais')
            setExpanded(true)
          }}
        >
          <IconMapPin size={14} aria-hidden /> {t('panel.filterLocais')}
        </button>
        <button
          type="button"
          className={`map-page__chip${filter === 'npcs' ? ' is-active' : ''}`}
          onClick={() => {
            setFilter('npcs')
            setExpanded(true)
          }}
        >
          <IconUsers size={14} aria-hidden /> {t('panel.filterPersonagens')}
        </button>
      </div>
    </div>
  ) : (
    <Button variant="ghost" size="sm" className="map-page__back" type="button" onClick={clearSelection}>
      <IconArrowLeft size={15} aria-hidden /> {t('panel.backToList')}
    </Button>
  )

  const panelBody = arcoManagerOpen ? (
    <ArcoAdminList
      arcos={arcos}
      onAdd={() => setArcoDraft({ titulo: '', resumo: '', ordem: arcos.length + 1, visivel_para_todos: true, isNew: true })}
      onEdit={(arco) => setArcoDraft({ id: arco.id, titulo: arco.titulo, resumo: arco.resumo, ordem: arco.ordem, visivel_para_todos: arco.visivel_para_todos ?? true, isNew: false })}
      onDelete={(id) => void deleteArco(id)}
    />
  ) : !selected ? (
    <div className="map-page__list">
      {filteredLocais.length > 0 && (
        <section>
          <h3 className="map-page__section-title">
            {t('panel.sectionLocais', { count: filteredLocais.length })}
          </h3>
          <div className="map-page__rows">
            {filteredLocais.map((l) => (
              <button
                key={l.id}
                type="button"
                className="map-page__row"
                onClick={() => selectLocalFromList(l.id)}
                onMouseEnter={() => setHoveredLocalId(l.id)}
                onMouseLeave={() => setHoveredLocalId(null)}
              >
                <span
                  className="map-page__row-dot"
                  style={{ background: l.cor_pin, opacity: isVisited(l) ? 1 : 0.35 }}
                />
                <span className="map-page__row-text">
                  <span className="map-page__row-title">{l.nome}</span>
                  <span className="map-page__row-meta">
                    {l.arco_id != null
                      ? (arcoById.get(l.arco_id)?.titulo ?? t('list.noArco'))
                      : t('list.noArco')}
                  </span>
                </span>
                {!isVisited(l) && <Chip variant="neutral">{t('legend.known')}</Chip>}
              </button>
            ))}
          </div>
        </section>
      )}
      {filteredNpcs.length > 0 && (
        <section>
          <h3 className="map-page__section-title">
            {t('panel.sectionPersonagens', { count: filteredNpcs.length })}
          </h3>
          <div className="map-page__rows">
            {filteredNpcs.map((n) => (
              <button
                key={n.id}
                type="button"
                className="map-page__row"
                onClick={() => selectNpc(n.id)}
              >
                <MapCharacterAvatar character={n} />
                <span className="map-page__row-text">
                  <span className="map-page__row-title">{n.nome}</span>
                  <span className="map-page__row-meta">
                    {n.papel ?? (n.tipo === 'pj' ? 'PJ' : 'NPC')}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {filteredLocais.length === 0 && filteredNpcs.length === 0 && (
        <div className="map-page__empty">
          <p>
            {needle
              ? t('panel.emptyQuery', { query: needle })
              : t('panel.empty')}
          </p>
        </div>
      )}
    </div>
  ) : selectedLocal ? (
    <LocalDetail
      local={selectedLocal}
      arco={selectedArco}
      npcs={npcs}
      localById={localById}
      editMode={isGm}
      onSelectNpc={selectNpc}
      onSelectLocal={selectLocalFromList}
      onEdit={() => {
        setPlacement('none')
        setLocalDraft(localToDraft(selectedLocal))
      }}
      onDelete={() => setConfirmDeleteLocalId(selectedLocal.id)}
    />
  ) : selectedNpc ? (
    <NpcDetail
      npc={selectedNpc}
      localById={localById}
      onSelectLocal={selectLocalFromList}
    />
  ) : null

  return (
    <div className={`map-page${isMobile ? ' map-page--mobile' : ''}`}>
      <CodexHeader
        campaignName={instanceConfig?.nome}
        showMapNav={Boolean(instanceConfig?.has_map_image) || mapImagePresent || canEdit}
        extraLeft={
          isGm ? (
            <div className="map-page__gm-tools">
              <Button size="sm"
                type="button"
                aria-expanded={gmMenuOpen}
                aria-haspopup="menu"
                aria-label={t('panel.gmMenuAria')}
                onClick={() => setGmMenuOpen((v) => !v)}
              >
                {t('panel.gmTools')}
              </Button>
              {gmMenuOpen && (
                <div className="map-page__gm-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setNpcDraft({
                        nome: '',
                        papel: '',
                        descricao: '',
                        faccao: '',
                        status: 'vivo',
                        retrato_url: null,
                        isNew: true,
                      })
                      setGmMenuOpen(false)
                    }}
                  >
                    {t('mapPage.newNpc')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setArcoManagerOpen(true)
                      setSelected(null)
                      setExpanded(true)
                      setGmMenuOpen(false)
                    }}
                  >
                    {ta('arco.manage')}
                  </button>
                  {activeGroup && (
                    <>
                      <button
                      type="button"
                      role="menuitem"
                      disabled={groupSaving}
                      onClick={() => {
                        setBusyError(null)
                        setRetryGroupPosition(null)
                        setPlacement('move-group')
                          setSelected(null)
                          setGmMenuOpen(false)
                        }}
                      >
                        {t('panel.moveGroup')}
                      </button>
                      <button
                      type="button"
                      role="menuitem"
                      disabled={groupSaving}
                        onClick={() => {
                          void changeFormato(activeGroup.formato === 'bandeira' ? 'brasao' : 'bandeira')
                          setGmMenuOpen(false)
                        }}
                      >
                        {activeGroup.formato === 'bandeira' ? t('panel.formatoBrasao') : t('panel.formatoBandeira')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : undefined
        }
      />

      <main className="map-page__stage">
        {busyError && <p role="alert" className="map-page__status map-page__status--error">{busyError}</p>}
        {loading && <p className="map-page__status">{tc('loading.campaign')}</p>}
        {error && <p className="map-page__status map-page__status--error">{error}</p>}

        {!loading && !error && (
          <CampaignMap
            mapUrl={mapUrl}
            locais={displayLocais}
            grupo={activeGroup}
            selectedLocalId={selectedLocalId}
            hoveredLocalId={hoveredLocalId}
            onSelectLocal={selectLocalFromMap}
            focusRequest={focusRequest}
            onFocusApplied={() => setFocusRequest(null)}
            interactivePins={!isGm || placement === 'none'}
            placementMode={isGm ? placement : 'none'}
            mapEditable={isGm}
            travelPlan={[]}
            travelSelectedIndex={0}
            onClearSelection={isGm ? () => setSelected(null) : undefined}
            onCancelPlacement={
              isGm && placement === 'reposition'
                ? () => setPlacement('none')
                : isGm && placement === 'move-group'
                  ? cancelGroupPlacement
                  : undefined
            }
            placementSaving={groupSaving}
            onRetryPlacement={retryGroupPosition ? () => void saveGroupPosition(retryGroupPosition.x, retryGroupPosition.y) : undefined}
            onMapUploaded={(url) => {
              setMapUrl(`${url}?t=${Date.now()}`)
              setMapImagePresent(true)
              markHasMapImageInCache(slug)
            }}
            onMapClickRelative={async (x, y) => {
              if (!isGm) return
              if (placement === 'add-pin') {
                setLocalDraft({
                  nome: '',
                  descricao: '',
                  data_sessao: '',
                  estado_exploracao: 'conhecido',
                  arco_id: arcos[0]?.id ?? null,
                  npc_ids: [],
                  saida_ids: [],
                  x,
                  y,
                  imagem_url: null,
                  cor_pin: '#c4b5fd',
                  waypoint_id: null,
                  visivel_para_todos: true,
                  isNew: true,
                })
                setPlacement('none')
              } else if (placement === 'reposition' && localDraft) {
                setLocalDraft({ ...localDraft, x, y })
                setPlacement('none')
              } else if (placement === 'move-group' && grupo) {
                await saveGroupPosition(x, y)
              }
            }}
          />
        )}

        <MapSidePanel
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          onFocusWithinChange={setPanelFocused}
          head={panelHead}
        >
          {panelBody}
        </MapSidePanel>

        {isGm && (placement === 'none' || placement === 'add-pin') && (
          <button
            type="button"
            className={`map-page__fab${placement === 'add-pin' ? ' is-active' : ''}`}
            aria-label={placement === 'add-pin' ? t('panel.fabCancel') : t('panel.fabAdd')}
            title={placement === 'add-pin' ? t('panel.fabCancel') : t('panel.fabAdd')}
            onClick={() => {
              if (placement === 'add-pin') {
                setPlacement('none')
                return
              }
              setLocalDraft(null)
              setSelected(null)
              setPlacement('add-pin')
            }}
          >
            <IconPlus size={22} aria-hidden />
          </button>
        )}
        {isGm && placement === 'add-pin' && (
          <div className="map-page__add-hint ui-chip ui-chip--accent">{t('panel.addHint')}</div>
        )}
      </main>

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
          title={npcDraft.isNew ? t('mapPage.newNpc') : t('mapPage.editNpc')}
          nome={npcDraft.nome}
          papel={npcDraft.papel}
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
          title={arcoDraft.isNew ? t('mapPage.newArco') : t('mapPage.editArco')}
          titulo={arcoDraft.titulo}
          resumo={arcoDraft.resumo}
          ordem={arcoDraft.ordem}
          visivel_para_todos={arcoDraft.visivel_para_todos}
          onChange={(patch) => setArcoDraft({ ...arcoDraft, ...patch })}
          onSave={() => void saveArco()}
          onCancel={() => setArcoDraft(null)}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteLocalId !== null}
        title={ta('local.confirmDelete')}
        description={ta('local.confirmDelete')}
        danger
        onConfirm={() => void confirmDeleteLocal()}
        onCancel={() => setConfirmDeleteLocalId(null)}
      />
    </div>
  )
}

function LocalDetail({
  local,
  arco,
  npcs,
  localById,
  editMode,
  onSelectNpc,
  onSelectLocal,
  onEdit,
  onDelete,
}: {
  local: Local
  arco: { id: number; titulo: string } | null
  npcs: NPC[]
  localById: Map<number, Local>
  editMode: boolean
  onSelectNpc: (id: number) => void
  onSelectLocal: (id: number) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation('mapa')
  const linkedNpcs = npcs.filter((n) => local.npc_ids.includes(n.id))
  const descricao = local.descricao.trim()
  const visited = isVisited(local)

  return (
    <div className="map-page__detail">
      <div className="map-page__detail-head">
        <div>
          {arco && <div className="ui-chip ui-chip--accent map-page__detail-badge">{arco.titulo}</div>}
          <h2 className="map-page__detail-title">{local.nome}</h2>
        </div>
        {editMode && (
          <div className="map-page__detail-actions">
            <IconButton label={t('panel.editLocal')} onClick={onEdit}>
              <IconPencil size={15} aria-hidden />
            </IconButton>
            <IconButton label={t('panel.deleteLocal')} className="map-page__danger-btn" onClick={onDelete}>
              <IconTrash size={15} aria-hidden />
            </IconButton>
          </div>
        )}
      </div>
      <span className={`ui-chip ${visited ? 'ui-chip--accent' : 'ui-chip--neutral'}`}>
        {visited ? t('panel.visited') : t('panel.known')}
      </span>
      {local.data_sessao && <div className="ui-card__meta">{local.data_sessao}</div>}
      {local.imagem_url ? (
        <ImageSlot
          src={local.imagem_url}
          placeholder={t('pinModal.localImage')}
          shape="rounded"
          fit="contain"
          className="map-page__detail-image"
        />
      ) : null}
      <div className="map-page__markdown">
        {descricao ? (
          <MarkdownSafe className="ui-dialog__body">{descricao}</MarkdownSafe>
        ) : (
          <p className="text-muted">{t('panel.noDescription')}</p>
        )}
      </div>
      {linkedNpcs.length > 0 && (
        <>
          <h3 className="map-page__section-title">{t('panel.npcsHere')}</h3>
          <div className="map-page__chip-row">
            {linkedNpcs.map((n) => (
              <Chip variant="outline" key={n.id} type="button" onClick={() => onSelectNpc(n.id)}>
                {n.nome}
              </Chip>
            ))}
          </div>
        </>
      )}
      {local.saida_ids.length > 0 && (
        <>
          <h3 className="map-page__section-title">{t('panel.exits')}</h3>
          <div className="map-page__chip-row">
            {local.saida_ids.map((id) => {
              const loc = localById.get(id)
              if (!loc) return null
              return (
                <Chip variant="outline" key={id} type="button" onClick={() => onSelectLocal(id)}>
                  {loc.nome}
                </Chip>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function NpcDetail({
  npc,
  localById,
  onSelectLocal,
}: {
  npc: NPC
  localById: Map<number, Local>
  onSelectLocal: (id: number) => void
}) {
  const { t } = useTranslation('mapa')
  const descricao = npc.descricao.trim()

  return (
    <div className="map-page__detail">
      <div className="map-page__detail-head">
        <span className="map-page__avatar map-page__avatar--lg" aria-hidden>
          {npc.nome.trim().charAt(0).toUpperCase() || '?'}
        </span>
        <div>
          <div className="ui-chip ui-chip--accent map-page__detail-badge">
            {npc.tipo === 'pj' ? 'PJ' : 'NPC'}
          </div>
          <h2 className="map-page__detail-title">{npc.nome}</h2>
          <span className="map-page__row-meta">
            {[npc.papel, npc.faccao].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>
      {npc.status && <Chip variant="neutral">{npc.status}</Chip>}
      <div className="map-page__markdown">
        {descricao ? (
          <MarkdownSafe className="ui-dialog__body">{descricao}</MarkdownSafe>
        ) : (
          <p className="text-muted">{t('panel.noDescription')}</p>
        )}
      </div>
      {npc.local_ids.length > 0 && (
        <>
          <h3 className="map-page__section-title">{t('panel.seenAt')}</h3>
          <div className="map-page__chip-row">
            {npc.local_ids.map((id) => {
              const loc = localById.get(id)
              if (!loc) return null
              return (
                <Chip variant="outline" key={id} type="button" onClick={() => onSelectLocal(id)}>
                  {loc.nome}
                </Chip>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
