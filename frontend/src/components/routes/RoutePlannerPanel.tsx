import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { campaignApi } from '../../api/campaign'
import type { Local, OrdenacaoRota, Ritmo, RoutePlanItem, Waypoint } from '../../types'
import { WaypointCombobox } from './WaypointCombobox'
import './RoutePlanner.css'

const RITMOS: { value: Ritmo; label: string }[] = [
  { value: 'normal', label: 'Normal (6 h/dia)' },
  { value: 'intenso', label: 'Intenso (8 h/dia)' },
]

const ORDENACOES: { value: OrdenacaoRota; label: string }[] = [
  { value: 'mais_rapida', label: 'Mais rápida' },
  { value: 'mais_barata', label: 'Mais barata' },
]

const TIPO_LABELS: Record<string, string> = {
  estrada: 'Estrada',
  rio: 'Rio',
  trilha: 'Trilha',
}

function formatRouteTipoLabel(tipo: string): string {
  const key = tipo.trim().toLowerCase()
  if (TIPO_LABELS[key]) return TIPO_LABELS[key]
  if (!key) return ''
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function routeTitleBase(tipos: string[]): string {
  const labels = tipos.map(formatRouteTipoLabel).filter(Boolean)
  return labels.length > 0 ? labels.join(', ') : 'Rota'
}

/** First occurrence of each base keeps bare title; later ones get (2), (3), … */
function disambiguateRouteTitles(bases: string[]): string[] {
  const seen = new Map<string, number>()
  return bases.map((base) => {
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base} (${n})`
  })
}

/** FR-002: own trimmed name, or linked Local with trimmed name. */
function isNamedWaypoint(wp: Waypoint, locaisById: Map<number, string>): boolean {
  if (wp.nome?.trim()) return true
  if (wp.local_id != null) {
    const localNome = locaisById.get(wp.local_id)?.trim()
    if (localNome) return true
  }
  return false
}

/** nome do nó → nome do Local (named options only; `Nó {id}` is defensive). */
function waypointOptionLabel(wp: Waypoint, locaisById: Map<number, string>): string {
  const nome = wp.nome?.trim()
  if (nome) return nome
  if (wp.local_id != null) {
    const localNome = locaisById.get(wp.local_id)?.trim()
    if (localNome) return localNome
  }
  return `Nó ${wp.id}`
}

interface Props {
  waypoints: Waypoint[]
  locais: Local[]
  open: boolean
  onClose: () => void
  plan: RoutePlanItem[]
  selectedIndex: number
  onPlanChange: (rotas: RoutePlanItem[], selectedIndex: number) => void
  onSelectIndex: (index: number) => void
}

export function RoutePlannerPanel({
  waypoints,
  locais,
  open,
  onClose,
  plan,
  selectedIndex,
  onPlanChange,
  onSelectIndex,
}: Props) {
  const locaisById = useMemo(() => {
    const m = new Map<number, string>()
    for (const l of locais) m.set(l.id, l.nome)
    return m
  }, [locais])

  const options = useMemo(() => {
    return [...waypoints]
      .filter((wp) => isNamedWaypoint(wp, locaisById))
      .map((wp) => ({ id: wp.id, label: waypointOptionLabel(wp, locaisById) }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
  }, [waypoints, locaisById])

  const namedIds = useMemo(() => new Set(options.map((o) => o.id)), [options])

  const routeTitles = useMemo(
    () => disambiguateRouteTitles(plan.map((r) => routeTitleBase(r.tipos))),
    [plan],
  )
  const [origemId, setOrigemId] = useState<number | ''>('')
  const [destinoId, setDestinoId] = useState<number | ''>('')
  const [origemQuery, setOrigemQuery] = useState('')
  const [destinoQuery, setDestinoQuery] = useState('')
  const [ritmo, setRitmo] = useState<Ritmo>('normal')
  const [ordenacao, setOrdenacao] = useState<OrdenacaoRota>('mais_rapida')
  const [velocidade, setVelocidade] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const skipOrdenacaoRecalc = useRef(true)

  useEffect(() => {
    if (origemId !== '' && !namedIds.has(origemId)) {
      setOrigemId('')
      setOrigemQuery('')
    }
    if (destinoId !== '' && !namedIds.has(destinoId)) {
      setDestinoId('')
      setDestinoQuery('')
    }
  }, [namedIds, origemId, destinoId])

  const calcular = useCallback(
    async (ord: OrdenacaoRota = ordenacao) => {
      setError(null)
      if (origemId === '' || destinoId === '') {
        setError('Escolha origem e destino.')
        return
      }
      if (origemId === destinoId) {
        setError('Origem e destino devem ser diferentes.')
        return
      }
      const trimmed = velocidade.trim()
      let mph: number | undefined
      if (trimmed !== '') {
        mph = Number(trimmed)
        if (!Number.isFinite(mph) || mph <= 0) {
          setError('Velocidade média deve ser um número maior que zero.')
          return
        }
      }
      setBusy(true)
      try {
        const res = await campaignApi.planRoute(origemId, destinoId, ritmo, mph, ord)
        if (res.rotas.length === 0) {
          setError('Nenhuma rota encontrada entre esses nós.')
          onPlanChange([], 0)
        } else {
          onPlanChange(res.rotas, 0)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao calcular rota')
        onPlanChange([], 0)
      } finally {
        setBusy(false)
      }
    },
    [origemId, destinoId, velocidade, ritmo, ordenacao, onPlanChange],
  )

  useEffect(() => {
    if (skipOrdenacaoRecalc.current) {
      skipOrdenacaoRecalc.current = false
      return
    }
    if (!open || origemId === '' || destinoId === '' || origemId === destinoId) return
    void calcular(ordenacao)
  }, [ordenacao]) // eslint-disable-line react-hooks/exhaustive-deps -- only on preference change

  if (!open) return null

  const firstBadge = ordenacao === 'mais_barata' ? 'mais barata' : 'mais rápida'

  return (
    <aside className="route-planner" aria-label="Calcular rota">
      <div className="route-planner__head">
        <h2 className="route-planner__title">Calcular rota</h2>
        <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <WaypointCombobox
        label="De"
        options={options}
        query={origemQuery}
        selectedId={origemId}
        onQueryChange={(q) => {
          setOrigemQuery(q)
          setOrigemId('')
        }}
        onSelect={(id, label) => {
          setOrigemId(id)
          setOrigemQuery(label)
        }}
      />
      <WaypointCombobox
        label="Para"
        options={options}
        query={destinoQuery}
        selectedId={destinoId}
        onQueryChange={(q) => {
          setDestinoQuery(q)
          setDestinoId('')
        }}
        onSelect={(id, label) => {
          setDestinoId(id)
          setDestinoQuery(label)
        }}
      />
      <label className="route-planner__field">
        <span>Ritmo</span>
        <select className="input" value={ritmo} onChange={(e) => setRitmo(e.target.value as Ritmo)}>
          {RITMOS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="route-planner__ordenacao">
        <legend>Ordenar por</legend>
        <div className="route-planner__ordenacao-options">
          {ORDENACOES.map((o) => (
            <label key={o.value} className="route-planner__ordenacao-option">
              <input
                type="radio"
                name="ordenacao-rota"
                value={o.value}
                checked={ordenacao === o.value}
                onChange={() => setOrdenacao(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="route-planner__field">
        <span>Velocidade média (mi/h)</span>
        <input
          className="input"
          type="number"
          min={0.1}
          step={0.1}
          placeholder="Tabela (estrada 6 · rio 8)"
          value={velocidade}
          onChange={(e) => setVelocidade(e.target.value)}
        />
      </label>
      <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void calcular()}>
        {busy ? 'Calculando…' : 'Calcular'}
      </button>
      {error && (
        <p className="route-planner__error" role="alert">
          {error}
        </p>
      )}
      {plan.length > 0 && (
        <ul className="route-planner__list">
          {plan.map((r, i) => (
            <li key={`${r.waypoint_ids.join('-')}-${r.tipos.join('-')}-${i}`}>
              <button
                type="button"
                className={`route-planner__item${i === selectedIndex ? ' is-selected' : ''}`}
                onClick={() => onSelectIndex(i)}
              >
                <strong>
                  {routeTitles[i] ?? 'Rota'}
                  {i === 0 ? ` · ${firstBadge}` : ''}
                </strong>
                <span>{r.distancia_milhas} mi</span>
                <span>{r.tempo_texto || `${r.tempo_horas} h`}</span>
                <span className="route-planner__costs">
                  Dentro {r.custo_dentro_bp} bp · Fora {r.custo_fora_bp} bp
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {options.length === 0 && (
        <p className="text-muted">
          {waypoints.length === 0
            ? 'Nenhum nó na rede de vias ainda.'
            : 'Nenhum nó com nome disponível para origem/destino.'}
        </p>
      )}
    </aside>
  )
}
