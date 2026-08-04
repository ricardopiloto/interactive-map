import { useMemo, useState } from 'react'
import { campaignApi } from '../../api/campaign'
import type { Local, Ritmo, RoutePlanItem, Waypoint } from '../../types'
import './RoutePlanner.css'

const RITMOS: { value: Ritmo; label: string }[] = [
  { value: 'normal', label: 'Normal (6 h/dia)' },
  { value: 'intenso', label: 'Intenso (8 h/dia)' },
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

/** FR-008: nome do nó → nome do Local → `Nó {id}` */
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
      .map((wp) => ({ wp, label: waypointOptionLabel(wp, locaisById) }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
  }, [waypoints, locaisById])

  const routeTitles = useMemo(
    () => disambiguateRouteTitles(plan.map((r) => routeTitleBase(r.tipos))),
    [plan],
  )
  const [origemId, setOrigemId] = useState<number | ''>('')
  const [destinoId, setDestinoId] = useState<number | ''>('')
  const [ritmo, setRitmo] = useState<Ritmo>('normal')
  const [velocidade, setVelocidade] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function calcular() {
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
      const res = await campaignApi.planRoute(origemId, destinoId, ritmo, mph)
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
  }

  return (
    <aside className="route-planner" aria-label="Calcular rota">
      <div className="route-planner__head">
        <h2 className="route-planner__title">Calcular rota</h2>
        <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <label className="route-planner__field">
        <span>De</span>
        <select
          className="input"
          value={origemId === '' ? '' : String(origemId)}
          onChange={(e) => setOrigemId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">—</option>
          {options.map(({ wp, label }) => (
            <option key={wp.id} value={wp.id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="route-planner__field">
        <span>Para</span>
        <select
          className="input"
          value={destinoId === '' ? '' : String(destinoId)}
          onChange={(e) => setDestinoId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">—</option>
          {options.map(({ wp, label }) => (
            <option key={wp.id} value={wp.id}>
              {label}
            </option>
          ))}
        </select>
      </label>
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
                  {i === 0 ? ' · mais rápida' : ''}
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
        <p className="text-muted">Nenhum nó na rede de vias ainda.</p>
      )}
    </aside>
  )
}
