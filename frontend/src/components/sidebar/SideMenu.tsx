import type { ReactNode } from 'react'
import type { Arco, Local, NPC } from '../../types'
import { ImageSlot } from '../media/ImageSlot'
import './SideMenu.css'

export type SideTab = 'locais' | 'npcs' | 'arcos' | 'grupo'

const STATUS_LABEL: Record<string, string> = {
  vivo: 'Vivo',
  morto: 'Morto',
  desaparecido: 'Desaparecido',
  desconhecido: 'Desconhecido',
}

interface SideMenuProps {
  tab: SideTab
  onTabChange: (tab: SideTab) => void
  locais: Local[]
  npcs: NPC[]
  arcos: Arco[]
  query: string
  onQueryChange: (value: string) => void
  selectedNpcId: number | null
  selectedArcoId: number | null
  onSelectLocal: (id: number) => void
  onSelectNpc: (id: number) => void
  onSelectArco: (id: number) => void
  onLocalHover?: (id: number | null) => void
  tabs?: SideTab[]
  brand?: string
  onCloseMobile?: () => void
  isMobileOverlay?: boolean
  isGm?: boolean
  headerExtra?: ReactNode
  adminPanel?: ReactNode
}

export function SideMenu({
  tab,
  onTabChange,
  locais,
  npcs,
  arcos,
  query,
  onQueryChange,
  selectedNpcId,
  selectedArcoId,
  onSelectLocal,
  onSelectNpc,
  onSelectArco,
  onLocalHover,
  tabs = ['locais', 'npcs', 'arcos'],
  brand = 'Codex da Campanha',
  onCloseMobile,
  isMobileOverlay,
  isGm = false,
  headerExtra,
  adminPanel,
}: SideMenuProps) {
  const needle = query.toLowerCase()
  const filteredLocais = locais.filter((l) => l.nome.toLowerCase().includes(needle))
  const filteredNpcs = npcs.filter((n) => n.nome.toLowerCase().includes(needle))
  const sortedArcos = [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id)

  const tabLabel: Record<SideTab, string> = {
    locais: 'Locais',
    npcs: 'NPCs',
    arcos: 'História',
    grupo: 'Grupo',
  }

  return (
    <aside className={`side-menu${isMobileOverlay ? ' side-menu--overlay' : ''}`}>
      <header className="side-menu__header">
        {isMobileOverlay && onCloseMobile ? (
          <button type="button" className="btn btn-ghost" onClick={onCloseMobile}>
            ‹ Mapa
          </button>
        ) : (
          <div className="side-menu__brand-row">
            <div className="side-menu__brand">{brand}</div>
            {isGm && <span className="tag tag-accent">Modo GM</span>}
          </div>
        )}
        {headerExtra}
      </header>

      <div className="side-menu__seg-wrap">
        <div className="seg" role="tablist" aria-label="Seções">
          {tabs.map((t) => (
            <label key={t} className="seg-opt">
              <input
                type="radio"
                name="side-tab"
                checked={tab === t}
                onChange={() => onTabChange(t)}
              />
              {tabLabel[t]}
            </label>
          ))}
        </div>
      </div>

      {!isGm && (tab === 'locais' || tab === 'npcs') && (
        <div className="side-menu__search-wrap">
          <input
            className="input side-menu__search"
            type="search"
            placeholder={tab === 'locais' ? 'Buscar local…' : 'Buscar NPC…'}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
      )}

      <div className="side-menu__body">
        {isGm && adminPanel ? (
          adminPanel
        ) : (
          <>
            {tab === 'locais' && (
              <div className="side-menu__stack">
                {filteredLocais.length === 0 && (
                  <p className="text-muted">Nenhum local visitado ainda.</p>
                )}
                {filteredLocais.map((local) => {
                  const arco = arcos.find((a) => a.id === local.arco_id)
                  return (
                    <button
                      key={local.id}
                      type="button"
                      className="card elev-sm side-menu__card-btn"
                      onClick={() => onSelectLocal(local.id)}
                      onMouseEnter={() => onLocalHover?.(local.id)}
                      onMouseLeave={() => onLocalHover?.(null)}
                    >
                      {arco && <div className="card-kicker">{arco.titulo}</div>}
                      <div className="card-title">{local.nome}</div>
                    </button>
                  )
                })}
              </div>
            )}

            {tab === 'npcs' && (
              <div className="side-menu__stack">
                {filteredNpcs.length === 0 && (
                  <p className="text-muted">Nenhum NPC conhecido ainda.</p>
                )}
                {filteredNpcs.map((npc) => {
                  const expanded = selectedNpcId === npc.id
                  const related = locais.filter((l) => npc.local_ids.includes(l.id))
                  return (
                    <div key={npc.id} className="card elev-sm">
                      <button
                        type="button"
                        className="side-menu__npc-head"
                        onClick={() => onSelectNpc(npc.id)}
                      >
                        <ImageSlot
                          src={npc.retrato_url}
                          placeholder="Retrato"
                          shape="circle"
                          style={{ width: 40, height: 40, flexShrink: 0, padding: 0 }}
                        />
                        <span>
                          <span className="card-title" style={{ fontSize: 15 }}>
                            {npc.nome}
                          </span>
                          <span className="tag tag-outline" style={{ marginTop: 4 }}>
                            {STATUS_LABEL[npc.status ?? 'desconhecido']}
                          </span>
                        </span>
                      </button>
                      {expanded && (
                        <div className="side-menu__npc-body">
                          {npc.retrato_url && (
                            <ImageSlot
                              src={npc.retrato_url}
                              shape="rounded"
                              style={{ width: '100%', height: 110, marginBottom: 8 }}
                            />
                          )}
                          <p className="card-body">{npc.descricao || 'Sem descrição.'}</p>
                          {npc.faccao && <p className="card-meta">Facção: {npc.faccao}</p>}
                          <p className="card-meta">Locais onde apareceu</p>
                          <div className="side-menu__chips">
                            {related.length === 0 && (
                              <span className="text-muted">Nenhum ainda.</span>
                            )}
                            {related.map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                className="tag tag-outline"
                                onClick={() => onSelectLocal(loc.id)}
                              >
                                {loc.nome}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'arcos' && (
              <div className="side-menu__stack">
                {sortedArcos.length === 0 && (
                  <p className="text-muted">Nenhum arco registrado ainda.</p>
                )}
                {sortedArcos.map((arco) => {
                  const expanded = selectedArcoId === arco.id
                  const events = locais
                    .filter((l) => l.arco_id === arco.id)
                    .sort((a, b) => a.id - b.id)
                  return (
                    <div key={arco.id} className="card elev-sm">
                      <button
                        type="button"
                        className="side-menu__card-btn"
                        onClick={() => onSelectArco(arco.id)}
                      >
                        <div className="card-kicker">Arco {arco.ordem}</div>
                        <div className="card-title">{arco.titulo}</div>
                        <p className="card-body">{arco.resumo}</p>
                      </button>
                      {expanded && (
                        <div className="side-menu__npc-body">
                          {events.length === 0 && (
                            <p className="text-muted">Sem locais neste arco.</p>
                          )}
                          {events.map((ev) => (
                            <button
                              key={ev.id}
                              type="button"
                              className="side-menu__event"
                              onClick={() => onSelectLocal(ev.id)}
                            >
                              <span>{ev.nome}</span>
                              {ev.data_sessao && (
                                <span className="card-meta">{ev.data_sessao}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
