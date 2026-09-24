import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { IconSearch, IconArrowLeft, IconPlus, IconTrash, IconSkull, IconGhost2, IconQuestionMark } from '@tabler/icons-react'
import type { CampaignCtx } from './CampaignLayout'
import { RelationGraph } from '../components/graph/RelationGraph'
import { MapSidePanel } from '../components/map/MapSidePanel'
import { PersonagemFormModal } from '../components/graph/PersonagemFormModal'
import { VinculoFormModal } from '../components/graph/VinculoFormModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import type { Personagem, Vinculo, VinculoFamilia } from '../data/types'
import './MapPage.css' // classes compartilhadas do painel lateral (busca, linhas de lista, detalhe, fab)
import './RelacoesPage.css'

const FAMILIES: { id: VinculoFamilia; label: string }[] = [
  { id: 'afinidade', label: 'Afinidade' },
  { id: 'laco', label: 'Laço' },
  { id: 'hostil', label: 'Hostil' },
  { id: 'neutro', label: 'Neutro' },
]

const STATUS_ICON = { morto: IconSkull, desaparecido: IconGhost2, desconhecido: IconQuestionMark } as const

export function RelacoesPage() {
  const { campaign, isGm } = useOutletContext<CampaignCtx>()
  const [personagens, setPersonagens] = useState<Personagem[]>(campaign.personagens)
  const [vinculos, setVinculos] = useState<Vinculo[]>(campaign.vinculos)
  const [query, setQuery] = useState('')
  const [activeFamilies, setActiveFamilies] = useState<Set<VinculoFamilia>>(new Set(FAMILIES.map((f) => f.id)))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [personagemFormOpen, setPersonagemFormOpen] = useState(false)
  const [vinculoFormOpen, setVinculoFormOpen] = useState(false)
  const [confirmDeleteVinculo, setConfirmDeleteVinculo] = useState<string | null>(null)

  const visible = useMemo(() => personagens.filter((p) => isGm || p.visivelParaTodos), [personagens, isGm])
  const byId = useMemo(() => new Map(personagens.map((p) => [p.id, p])), [personagens])
  const filtered = visible.filter((p) => p.nome.toLowerCase().includes(query.trim().toLowerCase()))
  const selected = selectedId ? byId.get(selectedId) : undefined

  function toggleFamily(f: VinculoFamilia) {
    setActiveFamilies((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f); else next.add(f)
      return next
    })
  }

  function selectNode(id: string) { setSelectedId(id); setExpanded(true) }

  function linksOf(id: string) {
    return vinculos
      .filter((v) => v.aId === id || v.bId === id)
      .map((v) => ({ vinculo: v, other: byId.get(v.aId === id ? v.bId : v.aId) }))
      .filter((x): x is { vinculo: Vinculo; other: Personagem } => Boolean(x.other))
  }

  function handleSavePersonagem(data: Omit<Personagem, 'id' | 'localIds'>) {
    const id = `npc-${Date.now()}`
    setPersonagens((prev) => [...prev, { ...data, id, localIds: [] }])
    setPersonagemFormOpen(false)
    selectNode(id)
  }

  function handleSaveVinculo(data: Omit<Vinculo, 'id'>) {
    setVinculos((prev) => [...prev, { ...data, id: `v-${Date.now()}` }])
    setVinculoFormOpen(false)
  }

  function handleDeleteVinculo() {
    if (!confirmDeleteVinculo) return
    setVinculos((prev) => prev.filter((v) => v.id !== confirmDeleteVinculo))
    setConfirmDeleteVinculo(null)
  }

  return (
    <div className="relacoes-page">
      <div className="relacoes-page__stage">
        <RelationGraph
          personagens={visible}
          vinculos={vinculos.filter((v) => visible.some((p) => p.id === v.aId) && visible.some((p) => p.id === v.bId))}
          focusId={selectedId}
          hoveredId={hoveredId}
          onSelect={selectNode}
          onHover={setHoveredId}
          activeFamilies={activeFamilies}
        />
        <div className="relacoes-page__legend">
          {FAMILIES.map((f) => (
            <button key={f.id} type="button" className={`relacoes-page__legend-item${activeFamilies.has(f.id) ? '' : ' is-off'}`} onClick={() => toggleFamily(f.id)}>
              <span className={`relacoes-page__legend-swatch relacoes-page__legend-swatch--${f.id}`} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isGm && (
        <div className="relacoes-page__add">
          {addMenuOpen && (
            <div className="relacoes-page__add-menu">
              <button type="button" className="campaign-bar__menu-item" onClick={() => { setAddMenuOpen(false); setPersonagemFormOpen(true) }}>Novo personagem</button>
              <button type="button" className="campaign-bar__menu-item" onClick={() => { setAddMenuOpen(false); setVinculoFormOpen(true) }}>Novo vínculo</button>
            </div>
          )}
          <button type="button" className="icon-btn icon-btn-accent map-page__fab" onClick={() => setAddMenuOpen((v) => !v)} aria-label="Adicionar">
            <IconPlus size={22} aria-hidden />
          </button>
        </div>
      )}

      <MapSidePanel
        expanded={expanded}
        onToggleExpand={() => setExpanded((v) => !v)}
        head={
          !selected ? (
            <>
              <div className="search-field">
                <IconSearch size={17} aria-hidden />
                <input className="search-field__input" placeholder="Buscar personagem…" value={query} onChange={(e) => { setQuery(e.target.value); setExpanded(true) }} onFocus={() => setExpanded(true)} />
              </div>
              <div className="row gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                {FAMILIES.map((f) => (
                  <button key={f.id} type="button" className={`chip${activeFamilies.has(f.id) ? ' is-active' : ''}`} onClick={() => toggleFamily(f.id)}>{f.label}</button>
                ))}
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedId(null)}>
              <IconArrowLeft size={15} aria-hidden /> Voltar à lista
            </button>
          )
        }
      >
        {!selected ? (
          <div className="stack gap-1">
            {filtered.map((p) => {
              const StatusIcon = p.status !== 'vivo' ? STATUS_ICON[p.status as keyof typeof STATUS_ICON] : null
              return (
                <button key={p.id} type="button" className="map-page__row" onClick={() => selectNode(p.id)} onMouseEnter={() => setHoveredId(p.id)} onMouseLeave={() => setHoveredId(null)}>
                  <span className="avatar avatar-sm">{p.nome[0]}</span>
                  <span className="grow">
                    <span className="map-page__row-title">{p.nome}</span>
                    <span className="text-3">{p.papel ?? (p.tipo === 'pj' ? 'PJ' : 'NPC')}</span>
                  </span>
                  {StatusIcon && <StatusIcon size={14} className="text-3" aria-hidden />}
                </button>
              )
            })}
            {filtered.length === 0 && <div className="empty-state"><p>Nenhum personagem encontrado.</p></div>}
          </div>
        ) : (
          <div className="map-page__detail">
            <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
              <div className="avatar avatar-lg">{selected.nome[0]}</div>
              <div className="grow">
                <div className="badge badge-accent" style={{ marginBottom: 6 }}>{selected.tipo === 'pj' ? 'PJ' : 'NPC'}</div>
                <h2 style={{ margin: 0 }}>{selected.nome}</h2>
                <span className="text-2">{selected.papel}{selected.faccao ? ` · ${selected.faccao}` : ''}</span>
              </div>
            </div>
            <span className={`badge ${selected.status === 'vivo' ? 'badge-success' : selected.status === 'morto' ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: 10, display: 'inline-flex' }}>{selected.status}</span>
            {!selected.visivelParaTodos && isGm && <span className="badge" style={{ marginLeft: 6 }}>Oculto dos jogadores</span>}
            <div className="map-page__markdown">
              {selected.descricao ? <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{selected.descricao}</ReactMarkdown> : <p className="text-3">Sem descrição ainda.</p>}
            </div>
            <h3 className="map-page__section-title">Vínculos · {linksOf(selected.id).length}</h3>
            <div className="stack gap-2">
              {linksOf(selected.id).map(({ vinculo, other }) => (
                <div key={vinculo.id} className="relacoes-page__link-row">
                  <span className={`relacoes-page__legend-swatch relacoes-page__legend-swatch--${vinculo.familia}`} />
                  <button type="button" className="map-page__row" style={{ padding: '4px 6px' }} onClick={() => selectNode(other.id)}>
                    <span className="grow">
                      <span className="map-page__row-title">{other.nome}</span>
                      <span className="text-3">{vinculo.tipo.replace('_', ' ')}{vinculo.qualificador ? ` · ${vinculo.qualificador}` : ''}</span>
                    </span>
                  </button>
                  {isGm && (
                    <button type="button" className="icon-btn icon-btn-sm icon-btn-plain" onClick={() => setConfirmDeleteVinculo(vinculo.id)} aria-label="Remover vínculo">
                      <IconTrash size={14} aria-hidden />
                    </button>
                  )}
                </div>
              ))}
              {linksOf(selected.id).length === 0 && <p className="text-3">Ainda sem vínculos registrados.</p>}
            </div>
          </div>
        )}
      </MapSidePanel>

      <PersonagemFormModal open={personagemFormOpen} onClose={() => setPersonagemFormOpen(false)} onSave={handleSavePersonagem} />
      <VinculoFormModal open={vinculoFormOpen} onClose={() => setVinculoFormOpen(false)} onSave={handleSaveVinculo} personagens={personagens} defaultAId={selectedId} />
      <ConfirmDialog
        open={confirmDeleteVinculo !== null}
        title="Remover vínculo"
        message="Esse vínculo deixa de aparecer no grafo para todos os jogadores."
        danger
        confirmLabel="Remover"
        onConfirm={handleDeleteVinculo}
        onCancel={() => setConfirmDeleteVinculo(null)}
      />
    </div>
  )
}
