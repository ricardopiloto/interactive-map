import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  personagens,
  vinculos,
  vinculosDe,
  ROTULOS_VINCULO,
  COR_VINCULO,
  type TipoVinculo,
} from '../data/mock'
import { Avatar, Badge, EmptyState } from '../components/ui'

const TODOS_TIPOS = Object.keys(ROTULOS_VINCULO) as TipoVinculo[]

export function Relacoes({ gmMode }: { gmMode: boolean }) {
  const [filtro, setFiltro] = useState<Set<TipoVinculo>>(new Set(TODOS_TIPOS))
  const [selecionadoId, setSelecionadoId] = useState<string | null>(personagens[0]?.id ?? null)

  const pessoas = useMemo(
    () => personagens.filter((p) => gmMode || p.visivelParaTodos),
    [gmMode],
  )

  const posicoes = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    const n = pessoas.length
    pessoas.forEach((p, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      map.set(p.id, { x: 50 + 38 * Math.cos(angle), y: 50 + 38 * Math.sin(angle) })
    })
    return map
  }, [pessoas])

  const linksVisiveis = useMemo(
    () =>
      vinculos.filter(
        (v) =>
          filtro.has(v.tipo) &&
          posicoes.has(v.aId) &&
          posicoes.has(v.bId),
      ),
    [filtro, posicoes],
  )

  function toggleTipo(tipo: TipoVinculo) {
    setFiltro((prev) => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  const selecionado = pessoas.find((p) => p.id === selecionadoId) ?? null

  return (
    <div className="page page--relacoes">
      <div className="relacoes-legend">
        {TODOS_TIPOS.map((tipo) => (
          <button
            key={tipo}
            type="button"
            className={`relacoes-legend__item${filtro.has(tipo) ? '' : ' relacoes-legend__item--off'}`}
            onClick={() => toggleTipo(tipo)}
          >
            <span className="relacoes-legend__swatch" style={{ background: COR_VINCULO[tipo] }} />
            {ROTULOS_VINCULO[tipo]}
          </button>
        ))}
      </div>

      <div className="relacoes-layout">
        <svg className="relacoes-graph" viewBox="0 0 100 100">
          {linksVisiveis.map((v) => {
            const a = posicoes.get(v.aId)!
            const b = posicoes.get(v.bId)!
            const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.08
            const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.08
            const dimmed = selecionadoId && v.aId !== selecionadoId && v.bId !== selecionadoId
            return (
              <path
                key={v.id}
                d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                stroke={COR_VINCULO[v.tipo]}
                strokeWidth={dimmed ? 0.3 : 0.6}
                opacity={dimmed ? 0.15 : 0.85}
                fill="none"
              />
            )
          })}
          {pessoas.map((p) => {
            const pos = posicoes.get(p.id)!
            const dimmed = selecionadoId && selecionadoId !== p.id
            return (
              <g
                key={p.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="relacoes-node"
                opacity={dimmed ? 0.45 : 1}
                onClick={() => setSelecionadoId(p.id)}
              >
                <circle r={p.tipo === 'pj' ? 4.2 : 3.2} fill="var(--bg-elevated)" stroke={p.corRetrato} strokeWidth={0.6} />
                <text textAnchor="middle" dy="1" fontSize="2.6" fill={p.corRetrato} fontWeight={700}>
                  {p.iniciais}
                </text>
                <text textAnchor="middle" dy={p.tipo === 'pj' ? 7.5 : 6.5} fontSize="2.4" fill="var(--text-secondary)">
                  {p.nome.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </svg>

        <aside className="relacoes-side">
          {!selecionado ? (
            <EmptyState title="Selecione um personagem" />
          ) : (
            <article className="detail">
              <header className="detail__header">
                <Avatar iniciais={selecionado.iniciais} cor={selecionado.corRetrato} size={44} />
                <div>
                  <h2>{selecionado.nome}</h2>
                  <p className="text-muted">{selecionado.papel}</p>
                </div>
              </header>
              <ul className="relation-list">
                {vinculosDe(selecionado.id).map(({ vinculo, outro }) => (
                  <li key={vinculo.id}>
                    <Avatar iniciais={outro.iniciais} cor={outro.corRetrato} size={22} />
                    <button type="button" className="link-quiet" onClick={() => setSelecionadoId(outro.id)}>
                      {outro.nome}
                    </button>
                    <Badge tone="neutral">{ROTULOS_VINCULO[vinculo.tipo]}</Badge>
                  </li>
                ))}
              </ul>
              <Link to={`/codex/personagens/${selecionado.id}`} className="link-quiet">
                Ver ficha completa →
              </Link>
            </article>
          )}
        </aside>
      </div>
    </div>
  )
}
