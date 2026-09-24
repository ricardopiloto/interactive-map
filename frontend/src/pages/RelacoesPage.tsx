import { useParams, useSearchParams } from 'react-router-dom'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrowLeft, IconPlus, IconSearch } from '@tabler/icons-react'
import { adminApi } from '../api/admin'
import { campaignApi } from '../api/campaign'
import { CodexHeader } from '../components/layout/CodexHeader'
import { MapSidePanel } from '../components/map/MapSidePanel'
import { GraphStage } from '../components/relacoes/GraphStage'
import {
  PersonagemFormDialog,
  type PersonagemDraft,
} from '../components/relacoes/PersonagemFormDialog'
import { VinculoFormDialog, type VinculoDraft } from '../components/relacoes/VinculoFormDialog'
import {
  matchesStatusFilter,
  STATUS_FILTER_OPTIONS,
  isRelacoesStatusFilter,
  type RelacoesStatusFilter,
} from '../components/relacoes/statusFilter'
import {
  isDuasVias,
  edgeMatchesTipos,
  notaFromPerspective,
  qualFromPerspective,
  tipoFromPerspective,
} from '../components/relacoes/vinculoDirection'
import { formatVinculoTipoLabel } from '../components/relacoes/vinculoLabel'
import {
  getVinculoTipoLabel,
  VINCULO_STYLES,
  VINCULO_TIPOS,
  vinculoStyle,
} from '../components/relacoes/vinculoStyles'
import { useVinculoTipoChipClicks } from '../components/relacoes/useVinculoTipoChipClicks'
import { ImageSlot } from '../components/media/ImageSlot'
import { ConfirmDialog, Button, Chip, Select} from '../components/ui'
import { useApiErrorMessage } from '../hooks/useApiErrorMessage'
import { useEditMode } from '../context/EditModeContext'
import { useInstanceConfig, getCachedInstanceConfig } from '../hooks/useInstanceConfig'
import { labelMatchesQuery } from '../utils/textMatch'
import type { Personagem, Vinculo, VinculoTipo } from '../types'
import './RelacoesPage.css'

function RelationsListAvatar({ character }: { character: Personagem }) {
  const [portraitFailed, setPortraitFailed] = useState(false)

  useEffect(() => {
    setPortraitFailed(false)
  }, [character.retrato_url])

  return (
    <span className="relacoes-page__avatar" aria-hidden>
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

const SELECTION_ANIMATION_MS = 600
const MOBILE_BP = 860

function neighbourId(v: Vinculo, selfId: number): number {
  return v.personagem_a_id === selfId ? v.personagem_b_id : v.personagem_a_id
}

function sortVinculosByNeighbourName(
  vinculos: Vinculo[],
  selfId: number,
  personagemById: Map<number, Personagem>,
): Vinculo[] {
  return [...vinculos].sort((a, b) => {
    const nomeA = personagemById.get(neighbourId(a, selfId))?.nome
    const nomeB = personagemById.get(neighbourId(b, selfId))?.nome
    if (nomeA == null && nomeB == null) return a.id - b.id
    if (nomeA == null) return 1
    if (nomeB == null) return -1
    const cmp = nomeA.localeCompare(nomeB, 'pt', { sensitivity: 'base' })
    if (cmp !== 0) return cmp
    return a.id - b.id
  })
}

export function RelacoesPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation('relacoes')
  const { t: tc } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()
  const { config: instanceConfig } = useInstanceConfig(slug)
  const [personagens, setPersonagens] = useState<Personagem[]>([])
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [activeTipos, setActiveTipos] = useState<Set<VinculoTipo>>(() => new Set())
  const [isolate, setIsolate] = useState(false)
  const [statusFilter, setStatusFilter] = useState<RelacoesStatusFilter>('todos')
  const [expanded, setExpanded] = useState(false)
  const [panelFocused, setPanelFocused] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false,
  )

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [showEdges, setShowEdges] = useState(false)
  const selectionTimer = useRef<number | undefined>(undefined)

  const { enabled: isGm, canEdit } = useEditMode()
  const [busyError, setBusyError] = useState<string | null>(null)

  const [personagemDraft, setPersonagemDraft] = useState<PersonagemDraft | null>(null)
  const [vinculoDraft, setVinculoDraft] = useState<VinculoDraft | null>(null)
  const [pendingDelete, setPendingDelete] = useState<
    null | { kind: 'personagem' | 'vinculo'; id: number }
  >(null)

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
    const raw = searchParams.get('personagem')
    if (!raw || loading) return
    const id = Number(raw)
    if (!Number.isFinite(id)) return
    if (!personagens.some((p) => p.id === id)) return
    setSelectedId(id)
    setExpanded(true)
    setShowEdges(false)
    if (selectionTimer.current) window.clearTimeout(selectionTimer.current)
    selectionTimer.current = window.setTimeout(() => setShowEdges(true), SELECTION_ANIMATION_MS)
    const next = new URLSearchParams(searchParams)
    next.delete('personagem')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, personagens, loading])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const [ps, vs] = await Promise.all([
        isGm ? adminApi.listPersonagensAdmin() : campaignApi.listPersonagens(),
        isGm ? adminApi.listVinculosAdmin() : campaignApi.listVinculos(),
      ])
      setPersonagens(ps)
      setVinculos(vs)
    } catch (e) {
      setError(e instanceof Error && e.name === 'ApiError' ? apiErrorMessage(e) : t('page.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGm])

  useEffect(() => {
    if (isGm) return
    setPersonagemDraft(null)
    setVinculoDraft(null)
    setFabOpen(false)
    setPendingDelete(null)
  }, [isGm])

  const personagemById = useMemo(() => new Map(personagens.map((p) => [p.id, p])), [personagens])
  const selectedPersonagem = selectedId != null ? personagemById.get(selectedId) ?? null : null

  const visiblePersonagens = useMemo(
    () => personagens.filter((p) => matchesStatusFilter(p, statusFilter)),
    [personagens, statusFilter],
  )
  const visibleIds = useMemo(
    () => new Set(visiblePersonagens.map((p) => p.id)),
    [visiblePersonagens],
  )
  const visibleVinculos = useMemo(
    () =>
      vinculos.filter(
        (v) => visibleIds.has(v.personagem_a_id) && visibleIds.has(v.personagem_b_id),
      ),
    [vinculos, visibleIds],
  )

  const selectedVinculos = useMemo(() => {
    if (selectedId == null) return []
    return visibleVinculos.filter(
      (v) => v.personagem_a_id === selectedId || v.personagem_b_id === selectedId,
    )
  }, [visibleVinculos, selectedId])

  const listItems = useMemo(() => {
    return visiblePersonagens
      .filter((p) => labelMatchesQuery(p.nome, query))
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
  }, [visiblePersonagens, query])

  function clearSelectionTimer() {
    if (selectionTimer.current != null) {
      window.clearTimeout(selectionTimer.current)
      selectionTimer.current = undefined
    }
  }

  function selectPersonagem(id: number) {
    if (id === selectedId) {
      deselectPersonagem()
      return
    }
    clearSelectionTimer()
    setShowEdges(false)
    setSelectedId(id)
    setExpanded(true)
    selectionTimer.current = window.setTimeout(() => setShowEdges(true), SELECTION_ANIMATION_MS)
  }

  function deselectPersonagem() {
    clearSelectionTimer()
    setShowEdges(false)
    setSelectedId(null)
    setIsolate(false)
  }

  useEffect(() => {
    if (selectedId == null) return
    if (visibleIds.has(selectedId)) return
    clearSelectionTimer()
    setShowEdges(false)
    setSelectedId(null)
    setIsolate(false)
  }, [selectedId, visibleIds])

  /** Colapsa o painel quando a ação termina — busca sem foco e nada selecionado (BKLG-004). */
  useEffect(() => {
    if (!panelFocused && selectedId == null) setExpanded(false)
  }, [panelFocused, selectedId])

  function toggleTipo(tipo: VinculoTipo) {
    setActiveTipos((prev) => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  const { onClick: handleChipClick, onDoubleClick: handleChipDoubleClick } =
    useVinculoTipoChipClicks(setActiveTipos, {
      toggleTipo,
      onSingleClickSideEffect: () => setExpanded(true),
    })

  function startCreatePersonagem() {
    setFabOpen(false)
    setPersonagemDraft({
      nome: '',
      tipo: 'npc',
      papel: '',
      faccao: '',
      descricao: '',
      status: 'vivo',
      retrato_url: null,
      visivel_para_todos: true,
      extensoes_mecanica: {},
      isNew: true,
    })
  }

  function startEditPersonagem(p: Personagem) {
    setPersonagemDraft({
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      papel: p.papel ?? '',
      faccao: p.faccao ?? '',
      descricao: p.descricao,
      status: p.status ?? 'desconhecido',
      retrato_url: p.retrato_url,
      visivel_para_todos: p.visivel_para_todos !== false,
      extensoes_mecanica: { ...(p.extensoes_mecanica ?? {}) },
      isNew: false,
    })
  }

  async function savePersonagem() {
    if (!personagemDraft || !personagemDraft.nome.trim()) return
    setBusyError(null)
    try {
      const payload = {
        nome: personagemDraft.nome.trim(),
        tipo: personagemDraft.tipo,
        papel: personagemDraft.papel.trim() || null,
        descricao: personagemDraft.descricao,
        faccao: personagemDraft.faccao.trim() || null,
        status: personagemDraft.status,
        retrato_url: personagemDraft.retrato_url,
        visivel_para_todos: personagemDraft.visivel_para_todos,
        extensoes_mecanica: personagemDraft.extensoes_mecanica,
      }
      if (personagemDraft.isNew) await adminApi.createPersonagem(payload)
      else if (personagemDraft.id != null) await adminApi.updatePersonagem(personagemDraft.id, payload)
      setPersonagemDraft(null)
      await refresh()
    } catch (e) {
      setBusyError(apiErrorMessage(e))
    }
  }

  function requestDeletePersonagem(id: number) {
    setPendingDelete({ kind: 'personagem', id })
  }

  async function deletePersonagem(id: number) {
    setBusyError(null)
    try {
      await adminApi.deletePersonagem(id)
      if (selectedId === id) deselectPersonagem()
      await refresh()
    } catch (e) {
      setBusyError(apiErrorMessage(e))
    }
  }

  function startCreateVinculo(prefillA?: number) {
    setFabOpen(false)
    setVinculoDraft({
      personagem_a_id: prefillA ?? selectedId ?? null,
      personagem_b_id: null,
      modo: 'reciproco',
      tipo_ab: 'conhecido',
      tipo_ba: 'conhecido',
      nota_ab: '',
      nota_ba: '',
      conhecido_ab: true,
      conhecido_ba: true,
      qualificador_ab: '',
      qualificador_ba: '',
      direcao: null,
      publico: false,
      isNew: true,
    })
  }

  function startEditVinculo(vinculoId: number) {
    const v = vinculos.find((x) => x.id === vinculoId)
    if (!v) return
    const duas = isDuasVias(v)
    setVinculoDraft({
      id: v.id,
      personagem_a_id: v.personagem_a_id,
      personagem_b_id: v.personagem_b_id,
      modo: duas ? 'duas_vias' : 'reciproco',
      tipo_ab: v.tipo_ab ?? v.tipo_ba ?? 'conhecido',
      tipo_ba: v.tipo_ba ?? v.tipo_ab ?? 'conhecido',
      nota_ab: v.nota_ab,
      nota_ba: v.nota_ba,
      conhecido_ab: v.conhecido_ab ?? true,
      conhecido_ba: v.conhecido_ba ?? true,
      qualificador_ab: v.qualificador_ab ?? '',
      qualificador_ba: v.qualificador_ba ?? '',
      direcao: v.direcao ?? null,
      publico: v.publico,
      isNew: false,
    })
  }

  async function saveVinculo() {
    if (!vinculoDraft) return
    const { personagem_a_id, personagem_b_id } = vinculoDraft
    if (personagem_a_id == null || personagem_b_id == null || personagem_a_id === personagem_b_id) {
      return
    }
    setBusyError(null)
    try {
      const duas = vinculoDraft.modo === 'duas_vias'
      const payload = {
        personagem_a_id,
        personagem_b_id,
        tipo_ab: vinculoDraft.tipo_ab,
        tipo_ba: duas ? vinculoDraft.tipo_ba : null,
        nota_ab: vinculoDraft.nota_ab,
        nota_ba: duas ? vinculoDraft.nota_ba : '',
        publico: vinculoDraft.publico,
        conhecido_ab: duas ? vinculoDraft.conhecido_ab : true,
        conhecido_ba: duas ? vinculoDraft.conhecido_ba : true,
        qualificador_ab: vinculoDraft.qualificador_ab.trim(),
        qualificador_ba: duas ? vinculoDraft.qualificador_ba.trim() : '',
        direcao: vinculoDraft.direcao,
      }
      if (vinculoDraft.isNew) await adminApi.createVinculo(payload)
      else if (vinculoDraft.id != null) await adminApi.updateVinculo(vinculoDraft.id, payload)
      setVinculoDraft(null)
      await refresh()
    } catch (e) {
      setBusyError(apiErrorMessage(e))
    }
  }

  function requestDeleteVinculo(id: number) {
    setPendingDelete({ kind: 'vinculo', id })
  }

  async function deleteVinculo(id: number) {
    setBusyError(null)
    try {
      await adminApi.deleteVinculo(id)
      await refresh()
    } catch (e) {
      setBusyError(apiErrorMessage(e))
    }
  }

  const hasQuery = query.trim().length > 0

  const panelHead = selectedPersonagem == null ? (
    <div
      onFocus={() => setPanelFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPanelFocused(false)
      }}
    >
      <div className="relacoes-page__search">
        <IconSearch size={17} aria-hidden />
        <input
          className="relacoes-page__search-input"
          type="search"
          placeholder={t('column.search')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setExpanded(true)
          }}
          onFocus={() => setExpanded(true)}
        />
      </div>
      <div className="relacoes-page__chips" role="group" aria-label={t('column.tiposVinculo')}>
        {VINCULO_TIPOS.map((tipo) => {
          const style = VINCULO_STYLES[tipo]
          const active = activeTipos.has(tipo)
          return (
            <button
              key={tipo}
              type="button"
              className={`relacoes-page__chip${active ? ' is-active' : ''}`}
              style={{ '--chip-color': style.color } as CSSProperties}
              onClick={() => handleChipClick(tipo)}
              onDoubleClick={(e) => handleChipDoubleClick(e, tipo)}
              aria-pressed={active}
            >
              <span className="relacoes-page__chip-swatch" style={{ background: style.color }} />
              {getVinculoTipoLabel(t, tipo)}
            </button>
          )
        })}
      </div>
      <div className="relacoes-page__filters">
        <label className="relacoes-page__status-filter">
          {t('column.statusFilter')}
          <Select
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value
              if (isRelacoesStatusFilter(value)) setStatusFilter(value)
              setExpanded(true)
            }}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'todos' ? t('column.statusFilterTodos') : tc(`status.${opt}`)}
              </option>
            ))}
          </Select>
        </label>
        <label className="relacoes-page__isolate">
          <input
            type="checkbox"
            checked={isolate}
            disabled={selectedId == null}
            onChange={(e) => {
              setIsolate(e.target.checked)
              setExpanded(true)
            }}
          />
          {t('column.isolate')}
        </label>
      </div>
    </div>
  ) : (
    <Button variant="ghost" size="sm" className="relacoes-page__back" type="button" onClick={deselectPersonagem}>
      <IconArrowLeft size={15} aria-hidden /> {t('panel.backToList')}
    </Button>
  )

  const panelBody =
    selectedPersonagem == null ? (
      <div className="relacoes-page__list">
        <h3 className="relacoes-page__section-title">
          {t('panel.sectionPersonagens', { count: listItems.length })}
        </h3>
        {listItems.length === 0 ? (
          <p className="relacoes-page__empty">
            {hasQuery
              ? t('column.listEmptySearch')
              : statusFilter === 'todos'
                ? t('column.listEmpty')
                : t('column.listEmptyStatus')}
          </p>
        ) : (
          <div className="relacoes-page__rows">
            {listItems.map((p) => {
              const selected = p.id === selectedId
              const oculto = p.visivel_para_todos === false
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`relacoes-page__row${selected ? ' is-selected' : ''}`}
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => selectPersonagem(p.id)}
                  onPointerEnter={() => setHoveredId(p.id)}
                  onPointerLeave={() => setHoveredId(null)}
                >
                  <RelationsListAvatar character={p} />
                  <span className="relacoes-page__row-text">
                    <span className="relacoes-page__row-title">{p.nome}</span>
                    <span className="relacoes-page__row-meta">
                      {p.papel ?? (p.tipo === 'pj' ? 'PJ' : 'NPC')}
                      {p.status ? ` · ${tc(`status.${p.status}`)}` : ''}
                    </span>
                  </span>
                  {oculto && isGm ? (
                    <span
                      className="relacoes-page__oculto"
                      title={t('graph.ocultoAria')}
                      aria-label={t('graph.ocultoAria')}
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>
    ) : (
      <PersonagemDetailBody
        key={selectedPersonagem.id}
        personagem={selectedPersonagem}
        vinculos={selectedVinculos}
        personagemById={personagemById}
        activeTipos={activeTipos}
        onTipoClick={handleChipClick}
        onTipoDoubleClick={handleChipDoubleClick}
        isGm={isGm}
        onFocusPersonagem={selectPersonagem}
        onEdit={() => startEditPersonagem(selectedPersonagem)}
        onDelete={() => requestDeletePersonagem(selectedPersonagem.id)}
        onEditVinculo={startEditVinculo}
        onDeleteVinculo={requestDeleteVinculo}
      />
    )

  return (
    <div className={`relacoes-page${isMobile ? ' relacoes-page--mobile' : ''}`}>
      <CodexHeader
        campaignName={instanceConfig?.nome}
        showMapNav={
          Boolean(getCachedInstanceConfig(slug)?.has_map_image ?? instanceConfig?.has_map_image) ||
          canEdit
        }
      />

      {busyError && <p className="relacoes-page__inline-error">{busyError}</p>}

      <main className="relacoes-page__stage">
        {loading && <p className="relacoes-page__status">{tc('loading.network')}</p>}
        {error && <p className="relacoes-page__status relacoes-page__status--error">{error}</p>}

        {!loading && !error && (
          <GraphStage
            personagens={visiblePersonagens}
            vinculos={visibleVinculos}
            selectedId={selectedId}
            onSelect={selectPersonagem}
            onDeselect={deselectPersonagem}
            showEdges={showEdges}
            isolate={isolate}
            activeTipos={activeTipos}
            onEdgeClick={isGm ? startEditVinculo : undefined}
            searchQuery={query}
            hoveredId={hoveredId}
            onHoverPersonagem={setHoveredId}
          />
        )}

        <MapSidePanel
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          head={panelHead}
        >
          {panelBody}
        </MapSidePanel>

        {isGm && (
          <div className="relacoes-page__fab-wrap">
            <button
              type="button"
              className={`relacoes-page__fab${fabOpen ? ' is-open' : ''}`}
              aria-label={t('panel.fabMenuAria')}
              aria-expanded={fabOpen}
              onClick={() => setFabOpen((v) => !v)}
            >
              <IconPlus size={22} aria-hidden />
            </button>
            {fabOpen && (
              <div className="relacoes-page__fab-menu" role="menu">
                <button type="button" role="menuitem" onClick={startCreatePersonagem}>
                  {t('page.addPersonagem')}
                </button>
                <button type="button" role="menuitem" onClick={() => startCreateVinculo()}>
                  {t('page.addConexao')}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {personagemDraft && (
        <PersonagemFormDialog
          title={personagemDraft.isNew ? t('page.newPersonagem') : t('page.editPersonagem')}
          draft={personagemDraft}
          instanceConfig={instanceConfig}
          isGm={isGm}
          onChange={(patch) => setPersonagemDraft({ ...personagemDraft, ...patch })}
          onSave={() => void savePersonagem()}
          onCancel={() => setPersonagemDraft(null)}
        />
      )}

      {vinculoDraft && (
        <VinculoFormDialog
          title={vinculoDraft.isNew ? t('page.newConexao') : t('page.editConexao')}
          draft={vinculoDraft}
          personagens={personagens}
          onChange={(patch) => setVinculoDraft({ ...vinculoDraft, ...patch })}
          onSave={() => void saveVinculo()}
          onCancel={() => setVinculoDraft(null)}
        />
      )}

      <ConfirmDialog
        open={pendingDelete != null}
        title={
          pendingDelete?.kind === 'vinculo'
            ? t('page.confirmRemoveVinculo')
            : t('page.confirmRemovePersonagem')
        }
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const pending = pendingDelete
          setPendingDelete(null)
          if (!pending) return
          if (pending.kind === 'personagem') void deletePersonagem(pending.id)
          else void deleteVinculo(pending.id)
        }}
      />
    </div>
  )
}

function PersonagemDetailBody({
  personagem,
  vinculos,
  personagemById,
  activeTipos,
  onTipoClick,
  onTipoDoubleClick,
  isGm,
  onFocusPersonagem,
  onEdit,
  onDelete,
  onEditVinculo,
  onDeleteVinculo,
}: {
  personagem: Personagem
  vinculos: Vinculo[]
  personagemById: Map<number, Personagem>
  activeTipos: Set<VinculoTipo>
  onTipoClick: (tipo: VinculoTipo) => void
  onTipoDoubleClick: (e: MouseEvent<HTMLButtonElement>, tipo: VinculoTipo) => void
  isGm: boolean
  onFocusPersonagem: (id: number) => void
  onEdit?: () => void
  onDelete?: () => void
  onEditVinculo?: (vinculoId: number) => void
  onDeleteVinculo?: (vinculoId: number) => void
}) {
  const { t } = useTranslation('relacoes')
  const { t: tc } = useTranslation('comum')
  const sortedVinculos = sortVinculosByNeighbourName(vinculos, personagem.id, personagemById)
  const filteredVinculos = sortedVinculos.filter((v) => edgeMatchesTipos(v, activeTipos))

  return (
    <div className="relacoes-page__detail">
      <div className="relacoes-page__detail-kicker">
        {personagem.tipo === 'pj' ? tc('tipo.pj') : tc('tipo.npc')}
        {personagem.papel ? ` · ${personagem.papel}` : ''}
      </div>
      <h2
        className={`relacoes-page__detail-title${personagem.status === 'morto' ? ' is-morto' : ''}`}
      >
        {personagem.nome}
      </h2>

      {personagem.retrato_url ? (
        <ImageSlot
          src={personagem.retrato_url}
          shape="rounded"
          fit="contain"
          className="relacoes-page__detail-portrait"
        />
      ) : null}

      <div className="relacoes-page__detail-tags">
        <Chip variant="outline">
          {tc(`status.${personagem.status ?? 'desconhecido'}`)}
        </Chip>
        {personagem.faccao && <Chip variant="neutral">{personagem.faccao}</Chip>}
        {isGm && personagem.visivel_para_todos === false && (
          <Chip variant="accent">{t('personagemForm.ocultoAosJogadores')}</Chip>
        )}
      </div>

      {personagem.descricao.trim() ? (
        <p className="relacoes-page__detail-desc">{personagem.descricao}</p>
      ) : null}

      {isGm && (
        <div className="relacoes-page__detail-actions">
          <Button size="sm" type="button" onClick={onEdit}>
            {tc('buttons.edit')}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={onDelete}>
            {tc('buttons.remove')}
          </Button>
        </div>
      )}

      <h3 className="relacoes-page__section-title">
        {t('detail.vinculosCount', { count: filteredVinculos.length })}
      </h3>
      {sortedVinculos.length > 0 && (
        <div className="relacoes-page__chips" role="group" aria-label={t('column.tiposVinculo')}>
          {VINCULO_TIPOS.map((tipo) => {
            const style = VINCULO_STYLES[tipo]
            const active = activeTipos.has(tipo)
            return (
              <button
                key={tipo}
                type="button"
                className={`relacoes-page__chip${active ? ' is-active' : ''}`}
                style={{ '--chip-color': style.color } as CSSProperties}
                onClick={() => onTipoClick(tipo)}
                onDoubleClick={(e) => onTipoDoubleClick(e, tipo)}
                aria-pressed={active}
              >
                <span className="relacoes-page__chip-swatch" style={{ background: style.color }} />
                {getVinculoTipoLabel(t, tipo)}
              </button>
            )
          })}
        </div>
      )}
      <div className="relacoes-page__vinculos">
        {sortedVinculos.length === 0 && <p className="text-muted">{t('detail.noVinculos')}</p>}
        {sortedVinculos.length > 0 && filteredVinculos.length === 0 && (
          <p className="text-muted">{t('detail.noVinculos')}</p>
        )}
        {filteredVinculos.map((v) => {
          const otherId = neighbourId(v, personagem.id)
          const other = personagemById.get(otherId)
          const myTipo = tipoFromPerspective(v, personagem.id)
          const theirTipo = tipoFromPerspective(v, otherId)
          const myNota = notaFromPerspective(v, personagem.id)
          const theirNota = notaFromPerspective(v, otherId)
          const myQual = qualFromPerspective(v, personagem.id)
          const theirQual = qualFromPerspective(v, otherId)
          const showPrimary = myTipo != null
          const showReturn = theirTipo != null && (isDuasVias(v) || myTipo == null)
          const resolvedTipo = myTipo ?? theirTipo ?? 'conhecido'
          const style = vinculoStyle(resolvedTipo)
          return (
            <div key={v.id} className="relacoes-page__vinculo">
              <div className="relacoes-page__vinculo-row">
                <span
                  className="relacoes-page__vinculo-dot"
                  style={{ background: showPrimary ? style.color : vinculoStyle(theirTipo!).color }}
                />
                <button
                  type="button"
                  className="relacoes-page__vinculo-name"
                  onClick={() => onFocusPersonagem(otherId)}
                  disabled={!other}
                >
                  {other?.nome ?? t('detail.removed')}
                </button>
                {showPrimary && myTipo != null && (
                  <span className="relacoes-page__vinculo-tipo" style={{ color: style.color }}>
                    {formatVinculoTipoLabel(
                      getVinculoTipoLabel(t, myTipo),
                      myQual,
                      isDuasVias(v) ? null : v.direcao,
                    )}
                  </span>
                )}
              </div>
              {showPrimary && myNota && <p className="relacoes-page__vinculo-nota">{myNota}</p>}
              {showReturn && theirTipo != null && (
                <p className="relacoes-page__vinculo-return">
                  {t('detail.veTeComo')}{' '}
                  <span style={{ color: vinculoStyle(theirTipo).color }}>
                    {formatVinculoTipoLabel(getVinculoTipoLabel(t, theirTipo), theirQual)}
                  </span>
                  {theirNota ? ` — ${theirNota}` : ''}
                </p>
              )}
              {isGm && (
                <div className="relacoes-page__detail-actions">
                  <Button size="sm" type="button" onClick={() => onEditVinculo?.(v.id)}>
                    {tc('buttons.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onDeleteVinculo?.(v.id)}
                  >
                    {tc('buttons.remove')}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
