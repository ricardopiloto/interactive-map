import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { campaignApi } from '../../api/campaign'
import { getCampaignSlug } from '../../api/campaignSlug'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import { getCachedInstanceConfig } from '../../hooks/useInstanceConfig'
import { Chip, Button, Input} from '../ui'
import type { Local, ModoTransporte, OrdenacaoRota, PreferenciaVia, Ritmo, RoutePlanItem, Waypoint } from '../../types'
import {
  formatBp,
  formatDistancia,
  formatTempoHumanizado,
  horasPorDia,
  type UnidadeDistancia,
} from '../../utils/routeFormat'
import { WaypointCombobox } from './WaypointCombobox'
import {
  isNamedWaypoint,
  waypointOptionLabel,
  type RouteMapPick,
} from './routeMapPick'
import './RoutePlanner.css'

const DEFAULT_PROPRIO_SPEED = '4'
const OPTIONS_PANEL_ID = 'route-planner-options-body'

function formatRouteTipoLabel(t: (key: string) => string, tipo: string): string {
  const key = tipo.trim().toLowerCase()
  const known = ['estrada', 'rio', 'trilha'] as const
  if (known.includes(key as (typeof known)[number])) {
    return t(`routeEnums.tipoVia.${key}`)
  }
  if (!key) return ''
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function routeTitleBase(t: (key: string) => string, tipos: string[]): string {
  const labels = tipos.map((tipo) => formatRouteTipoLabel(t, tipo)).filter(Boolean)
  return labels.length > 0 ? labels.join(', ') : t('routePlanner.route')
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

/** Collapsed header chips — always show current values (clarify 106 B). */
function formatOptionsSummary(
  t: (key: string) => string,
  modo: ModoTransporte,
  ritmo: Ritmo,
  ordenacao: OrdenacaoRota,
  preferenciaVia: PreferenciaVia,
  velocidade: string,
): string[] {
  const fragments: string[] = [
    t(`routeEnums.modo.${modo}`),
    t(`routeEnums.ritmo.${ritmo}`),
    t(
      ordenacao === 'mais_barata'
        ? 'routeEnums.ordenacao.maisBarata'
        : 'routeEnums.ordenacao.maisRapida',
    ),
    t(`routeEnums.preferencia.${preferenciaVia}`),
  ]
  if (modo === 'proprio') {
    const trimmed = velocidade.trim() || DEFAULT_PROPRIO_SPEED
    fragments.push(`${trimmed} mi/h`)
  }
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
  /** Spec 116: split form/results for MapSidePanel slots (keeps plan API logic). */
  renderShell?: (parts: { form: ReactNode; results: ReactNode }) => ReactNode
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
  renderShell,
}: Props) {
  const { t } = useTranslation('mapa')
  const { t: tc } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()

  const ritmos = useMemo(
    (): { value: Ritmo; label: string; hint: string }[] => [
      { value: 'normal', label: t('routeEnums.ritmo.normal'), hint: t('routeEnums.ritmo.normalHint') },
      { value: 'intenso', label: t('routeEnums.ritmo.intenso'), hint: t('routeEnums.ritmo.intensoHint') },
    ],
    [t],
  )

  const ordenacoes = useMemo(
    (): { value: OrdenacaoRota; label: string }[] => [
      { value: 'mais_rapida', label: t('routeEnums.ordenacao.maisRapida') },
      { value: 'mais_barata', label: t('routeEnums.ordenacao.maisBarata') },
    ],
    [t],
  )

  const modos = useMemo(
    (): { value: ModoTransporte; label: string }[] => [
      { value: 'pago', label: t('routeEnums.modo.pago') },
      { value: 'proprio', label: t('routeEnums.modo.proprio') },
    ],
    [t],
  )

  const preferencias = useMemo(
    (): { value: PreferenciaVia; label: string }[] => [
      { value: 'nenhuma', label: t('routeEnums.preferencia.nenhuma') },
      { value: 'rio', label: t('routeEnums.preferencia.rio') },
      { value: 'estrada', label: t('routeEnums.preferencia.estrada') },
    ],
    [t],
  )

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
    () => disambiguateRouteTitles(plan.map((r) => routeTitleBase(t, r.tipos))),
    [plan, t],
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
    () => formatOptionsSummary(t, modo, ritmo, ordenacao, preferenciaVia, velocidade),
    [t, modo, ritmo, ordenacao, preferenciaVia, velocidade],
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
        setError(t('routePlanner.errOriginDest'))
        return
      }
      if (o === d) {
        setError(t('routePlanner.errDifferent'))
        return
      }
      let mph: number | undefined
      if (modoAtual === 'proprio') {
        const trimmed = velocidade.trim()
        if (trimmed === '') {
          setError(t('routePlanner.errSpeedRequired'))
          return
        }
        mph = Number(trimmed)
        if (!Number.isFinite(mph) || mph <= 0) {
          setError(t('routePlanner.errSpeedInvalid'))
          return
        }
      }
      setBusy(true)
      try {
        const res = await campaignApi.planRoute(o, d, ritmo, modoAtual, mph, ord, prefAtual)
        if (res.rotas.length === 0) {
          setError(t('routePlanner.errNoRoute'))
          onPlanChange([], 0)
        } else {
          onPlanChange(res.rotas, 0)
        }
      } catch (e) {
        setError(apiErrorMessage(e))
        onPlanChange([], 0)
      } finally {
        setBusy(false)
      }
    },
    [origemId, destinoId, velocidade, ritmo, ordenacao, modo, preferenciaVia, onPlanChange, t, apiErrorMessage],
  )

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
      setError(t('routePlanner.errDifferent'))
      return
    }
    void calcular(ordenacao, modo, preferenciaVia, prevOrigem, pickId)
  }, [mapPick, open, namedIds, waypoints, locaisById, appliedMapPickNonce, calcular, ordenacao, modo, preferenciaVia, t])

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

  const firstBadge =
    ordenacao === 'mais_barata' ? t('routePlanner.badgeCheapest') : t('routePlanner.badgeFastest')
  const ritmoHint = ritmos.find((r) => r.value === ritmo)?.hint

  const form = (
    <div className="route-planner__form" aria-label={t('routePlanner.title')}>
      {!renderShell && (
        <div className="route-planner__head">
          <h2 className="route-planner__title">{t('routePlanner.title')}</h2>
          {onClose ? (
            <Button variant="ghost" type="button" onClick={onClose} aria-label={tc('buttons.close')}>
              ×
            </Button>
          ) : null}
        </div>
      )}
      <WaypointCombobox
        label={t('routePlanner.from')}
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
        label={t('routePlanner.to')}
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
      <Button variant="primary" type="button" disabled={busy} onClick={() => void calcular()}>
        {busy ? t('routePlanner.calculating') : t('routePlanner.calculate')}
      </Button>
      {error && (
        <p className="route-planner__error" role="alert">
          {error}
        </p>
      )}
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {busy
          ? t('routePlanner.calculating')
          : plan.length > 0
            ? t('routePlanner.liveResults', { count: plan.length })
            : ''}
      </p>
      <div className="route-planner__options">
        <button
          type="button"
          className="route-planner__options-toggle"
          aria-expanded={optionsOpen}
          aria-controls={OPTIONS_PANEL_ID}
          onClick={() => setOptionsOpen((v) => !v)}
        >
          <span className="route-planner__options-toggle-main">
            <span className="route-planner__options-label">{t('routePlanner.options')}</span>
            <span className={`route-planner__options-chevron${optionsOpen ? ' is-open' : ''}`} aria-hidden>
              ▾
            </span>
          </span>
          {!optionsOpen && summaryFragments.length > 0 && (
            <span className="route-planner__options-summary">
              {summaryFragments.map((frag, i) => (
                <Chip key={`${i}-${frag}`}>{frag}</Chip>
              ))}
            </span>
          )}
        </button>
        <div
          id={OPTIONS_PANEL_ID}
          className="route-planner__options-body"
          hidden={!optionsOpen}
        >
          <fieldset className="route-planner__modo">
            <legend>{t('routePlanner.transport')}</legend>
            <div className="route-planner__modo-options">
              {modos.map((m) => (
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
            <legend>{t('routePlanner.pace')}</legend>
            <div className="route-planner__ritmo-options">
              {ritmos.map((r) => (
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
            <legend>{t('routePlanner.sortBy')}</legend>
            <div className="route-planner__ordenacao-options">
              {ordenacoes.map((o) => (
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
            <legend>{t('routePlanner.pathPref')}</legend>
            <div className="route-planner__preferencia-options">
              {preferencias.map((p) => (
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
              <span>{t('routePlanner.speedMph')}</span>
              <Input
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
    </div>
  )

  const results = (
    <div className="route-planner__results">
      {plan.length > 0 ? (
        <ul className="route-planner__list">
          {plan.map((r, i) => {
            const slug = getCampaignSlug() ?? undefined
            const unidade: UnidadeDistancia =
              getCachedInstanceConfig(slug)?.unidade_distancia === 'km' ? 'km' : 'mi'
            const dist = formatDistancia(r.distancia_milhas, unidade)
            const tempo = formatTempoHumanizado(r.tempo_horas, horasPorDia(ritmo), {
              day: t('routePlanner.timeDay'),
              days: t('routePlanner.timeDays'),
              hour: t('routePlanner.timeHour'),
            })
            const meta = t('routePlanner.meta', {
              dist: dist.text,
              tempo,
              via: t('routePlanner.viaBp', { n: formatBp(r.custo_dentro_bp) }),
              fora: t('routePlanner.foraBp', { n: formatBp(r.custo_fora_bp) }),
            })
            const itemClass = [
              'route-planner__item',
              i === selectedIndex ? 'is-selected' : '',
            ]
              .filter(Boolean)
              .join(' ')
            const pernoites = i === selectedIndex ? (r.pernoites ?? []) : []
            return (
              <li key={`${r.waypoint_ids.join('-')}-${r.tipos.join('-')}-${i}`}>
                <button
                  type="button"
                  className={itemClass}
                  onClick={() => onSelectIndex(i)}
                >
                  <strong className="route-planner__item-title">
                    {routeTitles[i] ?? t('routePlanner.route')}
                    {i === 0 ? ` · ${firstBadge}` : ''}
                  </strong>
                  <span className="route-planner__item-meta">{meta}</span>
                </button>
                {pernoites.length > 0 && (
                  <ol className="route-planner__overnights" aria-label={t('routePlanner.overnightTitle')}>
                    {pernoites.map((p) => (
                      <li key={`${p.dia}-${p.tipo}-${p.local_id ?? 'wild'}`}>
                        <span className="route-planner__overnight-night">
                          {t('routePlanner.overnightNight', { n: p.dia })}
                        </span>
                        <span className="route-planner__overnight-place">
                          {p.tipo === 'local' && p.nome
                            ? p.nome
                            : t('routePlanner.overnightWild')}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-muted">
          {busy
            ? t('routePlanner.calculating')
            : options.length === 0
              ? waypoints.length === 0
                ? t('routePlanner.noNodes')
                : t('routePlanner.noNamedNodes')
              : t('routePlanner.resultsHint')}
        </p>
      )}
    </div>
  )

  if (renderShell) {
    return <>{renderShell({ form, results })}</>
  }

  return (
    <aside
      className={embedded ? 'route-planner route-planner--embedded' : 'route-planner'}
      aria-label={t('routePlanner.title')}
    >
      {form}
      {results}
    </aside>
  )
}
