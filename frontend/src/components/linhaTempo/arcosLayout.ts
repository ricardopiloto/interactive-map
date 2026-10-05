/** Layout math for the "Por arcos" vertical timeline — git-graph lanes.
 *  Pure functions, no React, so dots and curves always derive their position
 *  from the exact same coordinate values. */

import type { Arco, Evento, Sessao } from '../../types'

export const ROW_HEIGHT = 64
export const LANE_WIDTH = 56
export const DOT_RADIUS = 7
/** Left margin before the first column. */
export const LANES_LEFT = 28

export const SEM_ARCO_KEY = '__sem_arco__'

/** More than this many months between two event dates is a long gap. */
export const LONG_GAP_MONTHS = 12

export interface Lane {
  key: string
  arco: Arco | null
  /** Column x of this arc when it has a visible session; otherwise the first column. */
  x: number
}

export interface GraphColumn {
  x: number
  colorKey: string
}

export interface Row {
  sessao: Sessao
  y: number
}

export interface LaneDot {
  sessaoId: number
  y: number
  x: number
}

export interface Connector {
  orientation: 'vertical' | 'curve'
  /** Arc whose color paints this stroke. A curve uses the arc that branches. */
  colorKey: string
  x1: number
  y1: number
  x2: number
  y2: number
  dashed: boolean
  /** Set when both sessions have an event date. Absent on a same-session join. */
  years: number | null
  months: number | null
}

export interface ArcosLayout {
  lanes: Lane[]
  columns: GraphColumn[]
  rows: Row[]
  rowByNumero: Map<number, Row>
  dotsByLane: Map<string, LaneDot[]>
  connectors: Connector[]
  width: number
  height: number
}

interface EventDate {
  ano: number
  mes: number
}

interface Placed {
  row: Row
  column: number
  arcKey: string
  date: EventDate | null
}

interface ArcSpan {
  min: number
  max: number
  column: number
}

function laneKeyFor(arcoId: number | null | undefined): string {
  return arcoId == null ? SEM_ARCO_KEY : String(arcoId)
}

/** Sessions belong, for layout purposes, to the arc they're a normal member of
 *  (Sessao.arco_id) and — for the transition exception — also to the arc they
 *  open (Sessao.arco_transicao_id), without being duplicated as rows. */
function laneKeysForSessao(s: Sessao): string[] {
  const keys = [laneKeyFor(s.arco_id)]
  if (s.arco_transicao_id != null) keys.push(String(s.arco_transicao_id))
  return keys
}

function monthIndex(date: EventDate): number {
  return date.ano * 12 + date.mes
}

/** Oldest linked event. A missing month counts as 0. No year means no date. */
export function eventDateForSessao(sessaoId: number, eventos: readonly Evento[]): EventDate | null {
  let oldest: EventDate | null = null
  for (const evento of eventos) {
    if (evento.sessao_id !== sessaoId || evento.ano == null) continue
    const date = { ano: evento.ano, mes: evento.mes ?? 0 }
    if (oldest == null || monthIndex(date) < monthIndex(oldest)) oldest = date
  }
  return oldest
}

function sessionVisible(sessao: Sessao, visibleLaneKeys: ReadonlySet<string> | null): boolean {
  if (visibleLaneKeys == null) return true
  return laneKeysForSessao(sessao).some((key) => visibleLaneKeys.has(key))
}

/** Time links use the primary lane when it is visible, otherwise the transition lane. */
function temporalLaneKey(sessao: Sessao, visibleLaneKeys: ReadonlySet<string> | null): string {
  const primary = laneKeyFor(sessao.arco_id)
  if (visibleLaneKeys == null || visibleLaneKeys.has(primary)) return primary
  if (sessao.arco_transicao_id != null && visibleLaneKeys.has(String(sessao.arco_transicao_id))) {
    return String(sessao.arco_transicao_id)
  }
  return primary
}

function compareSessions(
  a: Sessao,
  b: Sessao,
  dateOf: (sessao: Sessao) => EventDate | null,
): number {
  const da = dateOf(a)
  const db = dateOf(b)
  if (da && db) {
    const byDate = monthIndex(db) - monthIndex(da)
    if (byDate !== 0) return byDate
  } else if (da) {
    return -1
  } else if (db) {
    return 1
  }
  return b.numero - a.numero
}

function columnX(column: number): number {
  return LANES_LEFT + column * LANE_WIDTH
}

function rowCenter(y: number): number {
  return y + ROW_HEIGHT / 2
}

function elapsedBetween(newer: EventDate | null, older: EventDate | null): {
  dashed: boolean
  years: number | null
  months: number | null
} {
  if (!newer || !older) return { dashed: false, years: null, months: null }
  const elapsed = Math.abs(monthIndex(newer) - monthIndex(older))
  return {
    dashed: elapsed > LONG_GAP_MONTHS,
    years: Math.floor(elapsed / 12),
    months: elapsed % 12,
  }
}

/** Endpoints sit on the column axis and stop at the dot edge. */
function endpoints(newer: Placed, older: Placed): { x1: number; y1: number; x2: number; y2: number } {
  const yNewer = rowCenter(newer.row.y)
  const yOlder = rowCenter(older.row.y)
  const xNewer = columnX(newer.column)
  const xOlder = columnX(older.column)
  if (yNewer === yOlder) {
    const dir = Math.sign(xOlder - xNewer) || 1
    return {
      x1: xNewer + dir * DOT_RADIUS,
      y1: yNewer,
      x2: xOlder - dir * DOT_RADIUS,
      y2: yOlder,
    }
  }
  const dir = Math.sign(yOlder - yNewer) || 1
  return {
    x1: xNewer,
    y1: yNewer + dir * DOT_RADIUS,
    x2: xOlder,
    y2: yOlder - dir * DOT_RADIUS,
  }
}

function assignColumns(
  rows: Row[],
  dateOf: (sessao: Sessao) => EventDate | null,
  visibleLaneKeys: ReadonlySet<string> | null,
): Placed[] {
  const arcKeyOf = (sessao: Sessao) => temporalLaneKey(sessao, visibleLaneKeys)
  const datedLeft = new Map<string, number>()
  for (const row of rows) {
    if (!dateOf(row.sessao)) continue
    const key = arcKeyOf(row.sessao)
    datedLeft.set(key, (datedLeft.get(key) ?? 0) + 1)
  }

  const reserved = new Map<number, string>()
  const placed: Placed[] = []

  for (const row of rows) {
    const arcKey = arcKeyOf(row.sessao)
    const date = dateOf(row.sessao)
    if (date) datedLeft.set(arcKey, (datedLeft.get(arcKey) ?? 1) - 1)
    const stillHasOlderDated = (datedLeft.get(arcKey) ?? 0) > 0

    let column: number | null = null
    for (const [col, owner] of reserved) {
      if (owner === arcKey) {
        column = col
        break
      }
    }

    if (column == null) {
      const blocked = new Set<number>()
      for (const [col, owner] of reserved) {
        if (owner !== arcKey) blocked.add(col)
      }
      if (date) {
        const at = monthIndex(date)
        for (const prev of placed) {
          if (prev.date && monthIndex(prev.date) === at && prev.arcKey !== arcKey) blocked.add(prev.column)
        }
      }
      column = 0
      while (blocked.has(column)) column += 1
    }

    if (stillHasOlderDated) reserved.set(column, arcKey)
    else if (reserved.get(column) === arcKey) reserved.delete(column)

    placed.push({ row, column, arcKey, date })
  }

  return placed
}

function spansOf(placed: Placed[]): Map<string, ArcSpan> {
  const grouped = new Map<string, Placed[]>()
  for (const item of placed) {
    if (!item.date) continue
    const list = grouped.get(item.arcKey) ?? []
    list.push(item)
    grouped.set(item.arcKey, list)
  }
  const spans = new Map<string, ArcSpan>()
  for (const [key, list] of grouped) {
    if (list.length < 2) continue
    const indexes = list.map((item) => monthIndex(item.date as EventDate))
    const min = Math.min(...indexes)
    const max = Math.max(...indexes)
    if (min === max) continue
    spans.set(key, { min, max, column: list[0].column })
  }
  return spans
}

function parentSpan(item: Placed, spans: Map<string, ArcSpan>): { key: string; column: number } | null {
  if (!item.date) return null
  const at = monthIndex(item.date)
  let best: { key: string; column: number; width: number } | null = null
  for (const [key, span] of spans) {
    if (key === item.arcKey || span.column === item.column) continue
    if (at <= span.min || at >= span.max) continue
    const width = span.max - span.min
    if (!best || width < best.width || (width === best.width && span.column < best.column)) {
      best = { key, column: span.column, width }
    }
  }
  return best ? { key: best.key, column: best.column } : null
}

export function computeArcosLayout(
  arcos: Arco[],
  sessoes: Sessao[],
  eventos: readonly Evento[] = [],
  visibleLaneKeys: ReadonlySet<string> | null = null,
): ArcosLayout {
  const arcosSorted = [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id)
  const dateOf = (sessao: Sessao) => eventDateForSessao(sessao.id, eventos)
  const visibleSessions = sessoes.filter((sessao) => sessionVisible(sessao, visibleLaneKeys))
  const rowsSorted = [...visibleSessions].sort((a, b) => compareSessions(a, b, dateOf))
  const rows: Row[] = rowsSorted.map((sessao, i) => ({ sessao, y: i * ROW_HEIGHT }))
  const rowByNumero = new Map(rows.map((row) => [row.sessao.numero, row]))
  const placed = assignColumns(rows, dateOf, visibleLaneKeys)
  const placedById = new Map(placed.map((item) => [item.row.sessao.id, item]))

  const columnCount = placed.reduce((max, item) => Math.max(max, item.column), -1) + 1
  const columns: GraphColumn[] = []
  for (let index = 0; index < columnCount; index += 1) {
    const newest = placed.find((item) => item.column === index)
    columns.push({ x: columnX(index), colorKey: newest?.arcKey ?? SEM_ARCO_KEY })
  }

  const laneX = new Map<string, number>()
  for (const item of placed) {
    if (!laneX.has(item.arcKey)) laneX.set(item.arcKey, columnX(item.column))
  }
  const lanes: Lane[] = arcosSorted.map((arco) => ({
    key: String(arco.id),
    arco,
    x: laneX.get(String(arco.id)) ?? columnX(0),
  }))
  lanes.push({
    key: SEM_ARCO_KEY,
    arco: null,
    x: laneX.get(SEM_ARCO_KEY) ?? columnX(0),
  })

  const dotsByLane = new Map<string, LaneDot[]>()
  for (const lane of lanes) dotsByLane.set(lane.key, [])
  for (const item of placed) {
    dotsByLane.get(item.arcKey)?.push({
      sessaoId: item.row.sessao.id,
      y: item.row.y,
      x: columnX(item.column),
    })
  }

  const connectors: Connector[] = []
  const byColumn = new Map<number, Placed[]>()
  for (const item of placed) {
    const list = byColumn.get(item.column) ?? []
    list.push(item)
    byColumn.set(item.column, list)
  }
  for (const list of byColumn.values()) {
    for (let i = 0; i < list.length - 1; i += 1) {
      const newer = list[i]
      const older = list[i + 1]
      const ends = endpoints(newer, older)
      connectors.push({
        orientation: 'vertical',
        colorKey: newer.arcKey,
        ...ends,
        ...elapsedBetween(newer.date, older.date),
      })
    }
  }

  const spans = spansOf(placed)
  for (const list of byColumn.values()) {
    let run: Placed[] = []
    let runParent: string | null = null
    const flush = () => {
      if (run.length === 0 || runParent == null) {
        run = []
        runParent = null
        return
      }
      const parentSessions = placed.filter((item) => item.arcKey === runParent && item.date)
      const top = run[0]
      const bottom = run[run.length - 1]
      const topAt = monthIndex(top.date as EventDate)
      const bottomAt = monthIndex(bottom.date as EventDate)
      const newer = parentSessions
        .filter((item) => monthIndex(item.date as EventDate) > topAt)
        .sort((a, b) => monthIndex(a.date as EventDate) - monthIndex(b.date as EventDate))[0]
      const older = parentSessions
        .filter((item) => monthIndex(item.date as EventDate) < bottomAt)
        .sort((a, b) => monthIndex(b.date as EventDate) - monthIndex(a.date as EventDate))[0]
      if (newer) {
        const above = newer.row.y <= top.row.y ? newer : top
        const below = above === newer ? top : newer
        connectors.push({
          orientation: 'curve',
          colorKey: top.arcKey,
          ...endpoints(above, below),
          ...elapsedBetween(above.date, below.date),
        })
      }
      if (older && older !== newer) {
        const above = bottom.row.y <= older.row.y ? bottom : older
        const below = above === bottom ? older : bottom
        connectors.push({
          orientation: 'curve',
          colorKey: bottom.arcKey,
          ...endpoints(above, below),
          ...elapsedBetween(above.date, below.date),
        })
      }
      run = []
      runParent = null
    }

    for (const item of list) {
      const parent = parentSpan(item, spans)
      const parentKey = parent?.key ?? null
      if (parentKey == null) {
        flush()
        continue
      }
      if (runParent != null && parentKey !== runParent) flush()
      runParent = parentKey
      run.push(item)
    }
    flush()
  }

  for (let i = 0; i < placed.length - 1; i += 1) {
    const newer = placed[i]
    const older = placed[i + 1]
    if (!newer.date || !older.date) continue
    if (monthIndex(newer.date) !== monthIndex(older.date)) continue
    if (newer.arcKey === older.arcKey || newer.column === older.column) continue
    connectors.push({
      orientation: 'curve',
      colorKey: newer.column > older.column ? newer.arcKey : older.arcKey,
      ...endpoints(newer, older),
      ...elapsedBetween(newer.date, older.date),
    })
  }

  for (const row of rows) {
    if (row.sessao.arco_transicao_id == null) continue
    const primary = laneKeyFor(row.sessao.arco_id)
    const transition = String(row.sessao.arco_transicao_id)
    if (visibleLaneKeys != null && (!visibleLaneKeys.has(primary) || !visibleLaneKeys.has(transition))) {
      continue
    }
    const host = placedById.get(row.sessao.id)
    if (!host) continue
    const transitionColumn = placed.find((item) => item.arcKey === transition)?.column
    if (transitionColumn == null || transitionColumn === host.column) continue
    const fromX = columnX(host.column)
    const toX = columnX(transitionColumn)
    const dir = Math.sign(toX - fromX) || 1
    const y = rowCenter(row.y)
    connectors.push({
      orientation: 'curve',
      colorKey: transition,
      x1: fromX + dir * DOT_RADIUS,
      y1: y,
      x2: toX - dir * DOT_RADIUS,
      y2: y,
      dashed: false,
      years: null,
      months: null,
    })
    dotsByLane.get(transition)?.push({ sessaoId: row.sessao.id, y: row.y, x: toX })
  }

  const width = columnX(Math.max(columnCount, 1))
  const height = Math.max(ROW_HEIGHT, rows.length * ROW_HEIGHT)

  return { lanes, columns, rows, rowByNumero, dotsByLane, connectors, width, height }
}
