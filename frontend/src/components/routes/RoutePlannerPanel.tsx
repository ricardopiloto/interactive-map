import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { campaignApi } from '../../api/campaign'
import type { Local, ModoTransporte, OrdenacaoRota, PreferenciaVia, Ritmo, RoutePlanItem, Waypoint } from '../../types'
import { WaypointCombobox } from './WaypointCombobox'
import {
  isNamedWaypoint,
  waypointOptionLabel,
  type RouteMapPick,
} from './routeMapPick'
import './RoutePlanner.css'

const RITMOS: { value: Ritmo; label: string; hint: string }[] = [
  { value: 'normal', label: 'Normal', hint: '6 h/dia' },
  { value: 'intenso', label: 'Intenso', hint: '8 h/dia' },
]

const ORDENACOES: { value: OrdenacaoRota; label: string }[] = [
  { value: 'mais_rapida', label: 'Mais rápida' },
  { value: 'mais_barata', label: 'Mais barata' },
]

const MODOS: { value: ModoTransporte; label: string }[] = [
  { value: 'pago', label: 'Pago' },
  { value: 'proprio', label: 'Próprio' },
]

const PREFERENCIAS: { value: PreferenciaVia; label: string }[] = [
  { value: 'nenhuma', label: 'Sem preferência' },
  { value: 'rio', label: 'Por rio' },
  { value: 'estrada', label: 'Por estrada' },
]

const DEFAULT_PROPRIO_SPEED = '4'
const OPTIONS_PANEL_ID = 'route-planner-options-body'

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

/** Non-default option fragments for collapsed header (research §2). */
function formatOptionsSummary(
  modo: ModoTransporte,
  ritmo: Ritmo,
  ordenacao: OrdenacaoRota,
  preferenciaVia: PreferenciaVia,
  velocidade: string,
): string[] {
  const fragments: string[] = []
  if (modo === 'proprio') {
    fragments.push('Próprio')
    const trimmed = velocidade.trim()
    if (trimmed !== '' && trimmed !== DEFAULT_PROPRIO_SPEED) {
      fragments.push(`${trimmed} mi/h`)
    }
  }
  if (ritmo === 'intenso') fragments.push('Intenso')
  if (ordenacao === 'mais_barata') fragments.push('Mais barata')
  if (preferenciaVia === 'rio') fragments.push('Por rio')
  if (preferenciaVia === 'estrada') fragments.push('Por estrada')
  return fragments
}

interface Props {
  waypoints: Waypoint[]
  locais: Local[]
  open: boolean
  /** Optional clear/close; hidden in embedded side-tab mode when omitted. */
  onClose?: () => void
  plan: RoutePlanItem[]
  selectedIndex: number
  onPlanChange: (rotas: RoutePlanItem[], selectedIndex: number) => void
  onSelectIndex: (index: number) => void
  /** Map pin pick while panel open (060): nonce re-triggers same waypoint. */
  mapPick?: RouteMapPick | null
  /** Render inside side menu (no floating chrome). */
  embedded?: boolean
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
  mapPick = null,
  embedded = false,
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
  const [modo, setModo] = useState<ModoTransporte>('pago')
  const [preferenciaVia, setPreferenciaVia] = useState<PreferenciaVia>('nenhuma')
  const [velocidade, setVelocidade] = useState(DEFAULT_PROPRIO_SPEED)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedMapPickNonce, setAppliedMapPickNonce] = useState<number | null>(null)
  const skipOrdenacaoRecalc = useRef(true)
  const skipModoRecalc = useRef(true)
  const skipPreferenciaRecalc = useRef(true)
  const wasOpen = useRef(false)
  const origemIdRef = useRef(origemId)
  origemIdRef.current = origemId

  const summaryFragments = useMemo(
    () => formatOptionsSummary(modo, ritmo, ordenacao, preferenciaVia, velocidade),
    [modo, ritmo, ordenacao, preferenciaVia, velocidade],
  )

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

  // FR-012 / FR-007: each open → pago + Sem preferência + speed draft 4 + options collapsed
  useEffect(() => {
    if (open && !wasOpen.current) {
      setModo((prev) => {
        if (prev !== 'pago') {
          skipModoRecalc.current = true
        }
        return 'pago'
      })
      setPreferenciaVia((prev) => {
        if (prev !== 'nenhuma') {
          skipPreferenciaRecalc.current = true
        }
        return 'nenhuma'
      })
      setVelocidade(DEFAULT_PROPRIO_SPEED)
      setOptionsOpen(false)
      setError(null)
    }
    wasOpen.current = open
  }, [open])

  const calcular = useCallback(
    async (
      ord: OrdenacaoRota = ordenacao,
      modoAtual: ModoTransporte = modo,
      prefAtual: PreferenciaVia = preferenciaVia,
      origemOverride?: number | '',
      destinoOverride?: number | '',
    ) => {
      const o = origemOverride !== undefined ? origemOverride : origemId
      const d = destinoOverride !== undefined ? destinoOverride : destinoId
      setError(null)
      if (o === '' || d === '') {
        setError('Escolha origem e destino.')
        return
      }
      if (o === d) {
        setError('Origem e destino devem ser diferentes.')
        return
      }
      let mph: number | undefined
      if (modoAtual === 'proprio') {
        const trimmed = velocidade.trim()
        if (trimmed === '') {
          setError('Informe a velocidade desejada (mi/h).')
          return
        }
        mph = Number(trimmed)
        if (!Number.isFinite(mph) || mph <= 0) {
          setError('Velocidade desejada deve ser um número maior que zero.')
          return
        }
      }
      setBusy(true)
      try {
        const res = await campaignApi.planRoute(o, d, ritmo, modoAtual, mph, ord, prefAtual)
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
    [origemId, destinoId, velocidade, ritmo, ordenacao, modo, preferenciaVia, onPlanChange],
  )

  // 060/061: map pin → De/Para by field state; auto-calc when both ends set (FR-011)
  useEffect(() => {
    if (!open || !mapPick) return
    if (appliedMapPickNonce === mapPick.nonce) return
    if (!namedIds.has(mapPick.waypointId)) return
    const wp = waypoints.find((w) => w.id === mapPick.waypointId)
    if (!wp) return
    const label = waypointOptionLabel(wp, locaisById)
    const pickId = mapPick.waypointId
    const prevOrigem = origemIdRef.current

    setAppliedMapPickNonce(mapPick.nonce)
    setError(null)

    if (prevOrigem === '') {
      setOrigemId(pickId)
      setOrigemQuery(label)
      origemIdRef.current = pickId
      return
    }

    setDestinoId(pickId)
    setDestinoQuery(label)
    if (prevOrigem === pickId) {
      setError('Origem e destino devem ser diferentes.')
      return
    }
    void calcular(ordenacao, modo, preferenciaVia, prevOrigem, pickId)
  }, [mapPick, open, namedIds, waypoints, locaisById, appliedMapPickNonce, calcular, ordenacao, modo, preferenciaVia])

  useEffect(() => {
    if (skipOrdenacaoRecalc.current) {
      skipOrdenacaoRecalc.current = false
      return
    }
    if (!open || origemId === '' || destinoId === '' || origemId === destinoId) return
    void calcular(ordenacao, modo, preferenciaVia)
  }, [ordenacao]) // eslint-disable-line react-hooks/exhaustive-deps -- only on sort preference change

  useEffect(() => {
    if (skipModoRecalc.current) {
      skipModoRecalc.current = false
      return
    }
    if (!open || origemId === '' || destinoId === '' || origemId === destinoId) return
    void calcular(ordenacao, modo, preferenciaVia)
  }, [modo]) // eslint-disable-line react-hooks/exhaustive-deps -- only on mode change (FR-010)

  useEffect(() => {
    if (skipPreferenciaRecalc.current) {
      skipPreferenciaRecalc.current = false
      return
    }
    if (!open || origemId === '' || destinoId === '' || origemId === destinoId) return
    void calcular(ordenacao, modo, preferenciaVia)
  }, [preferenciaVia]) // eslint-disable-line react-hooks/exhaustive-deps -- FR-006

  const onModoChange = (next: ModoTransporte) => {
    if (next === 'proprio') {
      setVelocidade(DEFAULT_PROPRIO_SPEED)
    }
    setModo(next)
  }

  if (!open) return null

  const firstBadge = ordenacao === 'mais_barata' ? 'mais barata' : 'mais rápida'
  const ritmoHint = RITMOS.find((r) => r.value === ritmo)?.hint

  return (
    <aside
      className={embedded ? 'route-planner route-planner--embedded' : 'route-planner'}
      aria-label="Calcular rota"
    >
      <div className="route-planner__head">
        <h2 className="route-planner__title">Calcular rota</h2>
        {onClose ? (
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        ) : null}
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
      <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void calcular()}>
        {busy ? 'Calculando…' : 'Calcular'}
      </button>
      {error && (
        <p className="route-planner__error" role="alert">
          {error}
        </p>
      )}
      <div className="route-planner__options">
        <button
          type="button"
          className="route-planner__options-toggle"
          aria-expanded={optionsOpen}
          aria-controls={OPTIONS_PANEL_ID}
          onClick={() => setOptionsOpen((v) => !v)}
        >
          <span className="route-planner__options-toggle-main">
            <span className="route-planner__options-label">Opções de viagem</span>
            <span className={`route-planner__options-chevron${optionsOpen ? ' is-open' : ''}`} aria-hidden>
              ▾
            </span>
          </span>
          {!optionsOpen && summaryFragments.length > 0 && (
            <span className="route-planner__options-summary">{summaryFragments.join(' · ')}</span>
          )}
        </button>
        <div
          id={OPTIONS_PANEL_ID}
          className="route-planner__options-body"
          hidden={!optionsOpen}
        >
          <fieldset className="route-planner__modo">
            <legend>Transporte</legend>
            <div className="route-planner__modo-options">
              {MODOS.map((m) => (
                <label key={m.value} className="route-planner__modo-option">
                  <input
                    type="radio"
                    name="modo-transporte"
                    value={m.value}
                    checked={modo === m.value}
                    onChange={() => onModoChange(m.value)}
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="route-planner__ritmo">
            <legend>Ritmo</legend>
            <div className="route-planner__ritmo-options">
              {RITMOS.map((r) => (
                <label key={r.value} className="route-planner__ritmo-option">
                  <input
                    type="radio"
                    name="ritmo-rota"
                    value={r.value}
                    checked={ritmo === r.value}
                    onChange={() => setRitmo(r.value)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
            {ritmoHint && <p className="route-planner__hint">{ritmoHint}</p>}
          </fieldset>
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
          <fieldset className="route-planner__preferencia">
            <legend>Preferência de via</legend>
            <div className="route-planner__preferencia-options">
              {PREFERENCIAS.map((p) => (
                <label key={p.value} className="route-planner__preferencia-option">
                  <input
                    type="radio"
                    name="preferencia-via"
                    value={p.value}
                    checked={preferenciaVia === p.value}
                    onChange={() => setPreferenciaVia(p.value)}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {modo === 'proprio' && (
            <label className="route-planner__field">
              <span>Velocidade desejada (mi/h)</span>
              <input
                className="input"
                type="number"
                min={0.1}
                step={0.1}
                value={velocidade}
                onChange={(e) => setVelocidade(e.target.value)}
              />
            </label>
          )}
        </div>
      </div>
      {plan.length > 0 && (
        <ul className="route-planner__list">
          {plan.map((r, i) => {
            const tempo = r.tempo_texto || `${r.tempo_horas} h`
            const meta = `${r.distancia_milhas} mi · ${tempo} · Dentro ${r.custo_dentro_bp} · Fora ${r.custo_fora_bp}`
            const itemClass = [
              'route-planner__item',
              i === selectedIndex ? 'is-selected' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <li key={`${r.waypoint_ids.join('-')}-${r.tipos.join('-')}-${i}`}>
                <button
                  type="button"
                  className={itemClass}
                  onClick={() => onSelectIndex(i)}
                >
                  <strong className="route-planner__item-title">
                    {routeTitles[i] ?? 'Rota'}
                    {i === 0 ? ` · ${firstBadge}` : ''}
                  </strong>
                  <span className="route-planner__item-meta">{meta}</span>
                </button>
              </li>
            )
          })}
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
