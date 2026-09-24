import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import {
  IconSearch, IconMapPin, IconUsers, IconArrowLeft, IconPlus, IconPencil, IconTrash,
  IconSkull, IconQuestionMark, IconGhost2, IconDoorExit,
} from '@tabler/icons-react'
import type { CampaignCtx } from './CampaignLayout'
import { MapCanvas } from '../components/map/MapCanvas'
import { MapSidePanel } from '../components/map/MapSidePanel'
import { LocalFormModal } from '../components/map/LocalFormModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ArcoManagerPanel } from '../components/map/ArcoManagerPanel'
import { groupCopy } from '../components/map/groupCopy'
import type { Arco, Local, Personagem } from '../data/types'
import './MapPage.css'

type Filter = 'todos' | 'locais' | 'npcs'
type Selected = { kind: 'local' | 'npc'; id: string } | null

const STATUS_ICON: Record<string, typeof IconSkull> = {
  morto: IconSkull, desaparecido: IconGhost2, desconhecido: IconQuestionMark,
}

export function MapPage() {
  const { campaign, isGm, groupMarker, setGroupMarker, moveGroupMode, setMoveGroupMode, arcoManagerOpen, setArcoManagerOpen } = useOutletContext<CampaignCtx>()
  const [locais, setLocais] = useState<Local[]>(campaign.locais)
  const [arcos, setArcos] = useState<Arco[]>(campaign.arcos)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')
  const [selected, setSelected] = useState<Selected>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [addMode, setAddMode] = useState(false)
  const [draftCoords, setDraftCoords] = useState<{ x: number; y: number } | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLocal, setEditingLocal] = useState<Local | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => { if (moveGroupMode) setAddMode(false) }, [moveGroupMode])

  const npcById = useMemo(() => new Map(campaign.personagens.map((p) => [p.id, p])), [campaign.personagens])
  const localById = useMemo(() => new Map(locais.map((l) => [l.id, l])), [locais])
  const displayedArcos = isGm ? arcos : arcos.filter((a) => a.visivelParaTodos)
  const displayedArcIds = new Set(displayedArcos.map((a) => a.id))
  const displayLocais = isGm ? locais : locais.map((l) => l.arcoId && !displayedArcIds.has(l.arcoId) ? { ...l, arcoId: null } : l)
  const arcoById = useMemo(() => new Map(displayedArcos.map((a) => [a.id, a])), [arcos, isGm])

  const needle = query.trim().toLowerCase()
  const filteredLocais = filter === 'npcs' ? [] : displayLocais.filter((l) => l.nome.toLowerCase().includes(needle))
  const filteredNpcs = filter === 'locais' ? [] : campaign.personagens.filter((p) => p.nome.toLowerCase().includes(needle) && (isGm || p.visivelParaTodos))

  function selectLocal(id: string) { setSelected({ kind: 'local', id }); setExpanded(true) }
  function selectNpc(id: string) { setSelected({ kind: 'npc', id }); setExpanded(true) }
  function back() { setSelected(null) }

  function handleAddAt(x: number, y: number) {
    setDraftCoords({ x, y })
    setEditingLocal(null)
    setFormOpen(true)
    setAddMode(false)
  }

  function handleSaveLocal(data: Omit<Local, 'id' | 'npcIds' | 'saidaIds'>) {
    if (editingLocal) {
      setLocais((prev) => prev.map((l) => (l.id === editingLocal.id ? { ...l, ...data } : l)))
      setSelected({ kind: 'local', id: editingLocal.id })
    } else {
      const id = `loc-${Date.now()}`
      setLocais((prev) => [...prev, { ...data, id, npcIds: [], saidaIds: [] }])
      setSelected({ kind: 'local', id })
    }
    setFormOpen(false)
    setEditingLocal(null)
    setDraftCoords(null)
  }

  function handleDelete() {
    if (!confirmDeleteId) return
    setLocais((prev) => prev.filter((l) => l.id !== confirmDeleteId))
    setConfirmDeleteId(null)
    setSelected(null)
  }

  const selectedLocal = selected?.kind === 'local' ? localById.get(selected.id) : undefined
  const selectedNpc = selected?.kind === 'npc' ? npcById.get(selected.id) : undefined

  return (
    <div className="map-page">
      <MapCanvas
        campaign={{ ...campaign, arcos: displayedArcos, locais: displayLocais, grupo: groupMarker }}
        selectedId={selected?.kind === 'local' ? selected.id : null}
        hoveredId={hoveredId}
        onSelectLocal={selectLocal}
        onHoverLocal={setHoveredId}
        addMode={addMode}
        onAddAt={handleAddAt}
        moveGroupMode={isGm && moveGroupMode}
        onMoveGroupAt={(x, y) => { setGroupMarker({ ...groupMarker, x, y }); setMoveGroupMode(false) }}
      />

      {isGm && moveGroupMode && <div className="map-page__add-hint chip" role="status">
        {groupCopy('hint')}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMoveGroupMode(false)}>{groupCopy('cancel')}</button>
      </div>}
      {isGm && !moveGroupMode && (
        <button
          type="button"
          className={`icon-btn icon-btn-accent map-page__fab${addMode ? ' is-active' : ''}`}
          onClick={() => setAddMode((v) => !v)}
          aria-label={addMode ? 'Cancelar adição de local' : 'Adicionar local'}
          title={addMode ? 'Toque no mapa para posicionar — ou cancele aqui' : 'Adicionar novo local'}
        >
          <IconPlus size={22} aria-hidden />
        </button>
      )}
      {addMode && <div className="map-page__add-hint chip">Toque no mapa para posicionar o novo local</div>}

      <MapSidePanel
        expanded={expanded}
        onToggleExpand={() => setExpanded((v) => !v)}
        head={
          !selected ? (
            <>
              <div className="search-field">
                <IconSearch size={17} aria-hidden />
                <input
                  className="search-field__input"
                  placeholder="Buscar local ou personagem…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setExpanded(true) }}
                  onFocus={() => setExpanded(true)}
                />
              </div>
              <div className="row gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                <button type="button" className={`chip${filter === 'todos' ? ' is-active' : ''}`} onClick={() => setFilter('todos')}>Tudo</button>
                <button type="button" className={`chip${filter === 'locais' ? ' is-active' : ''}`} onClick={() => setFilter('locais')}>
                  <IconMapPin size={14} aria-hidden /> Locais
                </button>
                <button type="button" className={`chip${filter === 'npcs' ? ' is-active' : ''}`} onClick={() => setFilter('npcs')}>
                  <IconUsers size={14} aria-hidden /> Personagens
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={back}>
              <IconArrowLeft size={15} aria-hidden /> Voltar à lista
            </button>
          )
        }
      >
        {!selected ? (
          <div className="stack gap-4">
            {filteredLocais.length > 0 && (
              <section>
                <h3 className="map-page__section-title">Locais · {filteredLocais.length}</h3>
                <div className="stack gap-1">
                  {filteredLocais.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className="map-page__row"
                      onClick={() => selectLocal(l.id)}
                      onMouseEnter={() => setHoveredId(l.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <span className="map-page__row-dot" style={{ background: l.corPin, opacity: l.visitado ? 1 : 0.35 }} />
                      <span className="grow">
                        <span className="map-page__row-title">{l.nome}</span>
                        <span className="text-3">{l.arcoId ? arcoById.get(l.arcoId)?.titulo ?? 'Sem arco' : 'Sem arco'}</span>
                      </span>
                      {!l.visitado && <span className="badge">conhecido</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {filteredNpcs.length > 0 && (
              <section>
                <h3 className="map-page__section-title">Personagens · {filteredNpcs.length}</h3>
                <div className="stack gap-1">
                  {filteredNpcs.map((p) => (
                    <button key={p.id} type="button" className="map-page__row" onClick={() => selectNpc(p.id)}>
                      <span className="avatar avatar-sm">{p.nome[0]}</span>
                      <span className="grow">
                        <span className="map-page__row-title">{p.nome}</span>
                        <span className="text-3">{p.papel ?? (p.tipo === 'pj' ? 'PJ' : 'NPC')}</span>
                      </span>
                      {p.status !== 'vivo' && STATUS_ICON[p.status] && (
                        (() => { const Icon = STATUS_ICON[p.status]; return <Icon size={14} className="text-3" aria-hidden /> })()
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {filteredLocais.length === 0 && filteredNpcs.length === 0 && (
              <div className="empty-state">
                <p>Nada encontrado para “{query}”.</p>
              </div>
            )}
          </div>
        ) : selectedLocal ? (
          <div className="map-page__detail">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="badge badge-accent" style={{ marginBottom: 6 }}>{selectedLocal.arcoId ? arcoById.get(selectedLocal.arcoId)?.titulo ?? 'Sem arco' : 'Sem arco'}</div>
                <h2 style={{ margin: 0 }}>{selectedLocal.nome}</h2>
              </div>
      {isGm && !moveGroupMode && (
                <div className="row gap-1">
                  <button type="button" className="icon-btn icon-btn-sm" onClick={() => { setEditingLocal(selectedLocal); setFormOpen(true) }} aria-label="Editar local">
                    <IconPencil size={15} aria-hidden />
                  </button>
                  <button type="button" className="icon-btn icon-btn-sm btn-danger" onClick={() => setConfirmDeleteId(selectedLocal.id)} aria-label="Excluir local">
                    <IconTrash size={15} aria-hidden />
                  </button>
                </div>
              )}
            </div>
            <span className={`badge ${selectedLocal.visitado ? 'badge-success' : ''}`} style={{ marginTop: 8, display: 'inline-flex' }}>
              {selectedLocal.visitado ? 'Visitado' : 'Conhecido, não visitado'}
            </span>
            <div className="map-page__markdown">
              {selectedLocal.descricao ? (
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{selectedLocal.descricao}</ReactMarkdown>
              ) : (
                <p className="text-3">Sem descrição ainda.</p>
              )}
            </div>
            {selectedLocal.npcIds.length > 0 && (
              <>
                <h3 className="map-page__section-title">Personagens aqui</h3>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {selectedLocal.npcIds.map((id) => {
                    const p = npcById.get(id)
                    if (!p) return null
                    return <button key={id} type="button" className="chip" onClick={() => selectNpc(id)}>{p.nome}</button>
                  })}
                </div>
              </>
            )}
            {selectedLocal.saidaIds.length > 0 && (
              <>
                <h3 className="map-page__section-title"><IconDoorExit size={14} aria-hidden style={{ verticalAlign: -2 }} /> Saídas conhecidas</h3>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {selectedLocal.saidaIds.map((id) => {
                    const l = localById.get(id)
                    if (!l) return null
                    return <button key={id} type="button" className="chip" onClick={() => selectLocal(id)}>{l.nome}</button>
                  })}
                </div>
              </>
            )}
          </div>
        ) : selectedNpc ? (
          <NpcDetailContent npc={selectedNpc} isGm={isGm} localById={localById} onSelectLocal={selectLocal} />
        ) : null}
      </MapSidePanel>

      <LocalFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingLocal(null); setDraftCoords(null) }}
        onSave={handleSaveLocal}
        arcos={arcos}
        initial={editingLocal}
        coords={draftCoords}
      />
      <ArcoManagerPanel open={isGm && arcoManagerOpen} onClose={() => setArcoManagerOpen(false)} arcos={arcos} onChange={(next) => {
        const removed = new Set(arcos.filter((a) => !next.some((n) => n.id === a.id)).map((a) => a.id))
        setArcos(next)
        if (removed.size) setLocais((prev) => prev.map((l) => l.arcoId && removed.has(l.arcoId) ? { ...l, arcoId: null } : l))
      }} />
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Excluir local"
        message="Este local some do mapa e das listas para todos os jogadores. Essa ação não pode ser desfeita."
        danger
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function NpcDetailContent({ npc, isGm, localById, onSelectLocal }: {
  npc: Personagem
  isGm: boolean
  localById: Map<string, Local>
  onSelectLocal: (id: string) => void
}) {
  return (
    <div className="map-page__detail">
      <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
        <div className="avatar avatar-lg">{npc.nome[0]}</div>
        <div className="grow">
          <div className="badge badge-accent" style={{ marginBottom: 6 }}>{npc.tipo === 'pj' ? 'PJ' : 'NPC'}</div>
          <h2 style={{ margin: 0 }}>{npc.nome}</h2>
          <span className="text-2">{npc.papel}{npc.faccao ? ` · ${npc.faccao}` : ''}</span>
        </div>
      </div>
      <span className={`badge ${npc.status === 'vivo' ? 'badge-success' : npc.status === 'morto' ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: 10, display: 'inline-flex' }}>
        {npc.status}
      </span>
      {!npc.visivelParaTodos && isGm && <span className="badge" style={{ marginLeft: 6 }}>Oculto dos jogadores</span>}
      <div className="map-page__markdown">
        {npc.descricao ? <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{npc.descricao}</ReactMarkdown> : <p className="text-3">Sem descrição ainda.</p>}
      </div>
      {npc.localIds.length > 0 && (
        <>
          <h3 className="map-page__section-title">Visto em</h3>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {npc.localIds.map((id) => {
              const l = localById.get(id)
              if (!l) return null
              return <button key={id} type="button" className="chip" onClick={() => onSelectLocal(id)}>{l.nome}</button>
            })}
          </div>
        </>
      )}
    </div>
  )
}
