/** Layout math for the "Por arcos" vertical timeline — git-log style lanes.
 *  Pure functions, no React, so dots and connector lines always derive their
 *  position from the exact same coordinate values (see linha-tempo-por-arcos
 *  design.md — this is the fix for the dot/line disconnection bug already
 *  seen in the prototype). */

import type { Arco, Sessao } from '../../types'

export const ROW_HEIGHT = 64
export const LANE_WIDTH = 56
export const DOT_RADIUS = 7
/** Left margin before the first lane. */
export const LANES_LEFT = 28

export const SEM_ARCO_KEY = '__sem_arco__'

export interface Lane {
  key: string
  arco: Arco | null
  x: number
}

export interface Row {
  sessao: Sessao
  y: number
}

export interface LaneDot {
  sessaoId: number
  y: number
}

export interface Connector {
  laneKey: string
  y1: number
  y2: number
  /** Number of other rows skipped between the two dots — 0 means immediately consecutive. */
  gap: number
}

export interface ArcosLayout {
  lanes: Lane[]
  rows: Row[]
  rowByNumero: Map<number, Row>
  dotsByLane: Map<string, LaneDot[]>
  connectors: Connector[]
  width: number
  height: number
}

function laneKeyFor(arcoId: number | null | undefined): string {
  return arcoId == null ? SEM_ARCO_KEY : String(arcoId)
}

/** Sessions belong, for layout purposes, to the arc they're a normal member of
 *  (Sessao.arco_id) and — for the transition exception (FR-004) — also to the
 *  arc they open (Sessao.arco_transicao_id), without being duplicated as rows. */
function laneKeysForSessao(s: Sessao): string[] {
  const keys = [laneKeyFor(s.arco_id)]
  if (s.arco_transicao_id != null) keys.push(String(s.arco_transicao_id))
  return keys
}

export function computeArcosLayout(arcos: Arco[], sessoes: Sessao[]): ArcosLayout {
  const arcosSorted = [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id)
  const lanes: Lane[] = arcosSorted.map((arco, i) => ({
    key: String(arco.id),
    arco,
    x: LANES_LEFT + i * LANE_WIDTH,
  }))
  const semArcoLane: Lane = {
    key: SEM_ARCO_KEY,
    arco: null,
    x: LANES_LEFT + arcosSorted.length * LANE_WIDTH,
  }
  lanes.push(semArcoLane)

  // Rows: every session gets exactly one row, newest numero first (top).
  const rowsSorted = [...sessoes].sort((a, b) => b.numero - a.numero)
  const rows: Row[] = rowsSorted.map((sessao, i) => ({ sessao, y: i * ROW_HEIGHT }))
  const rowByNumero = new Map(rows.map((r) => [r.sessao.numero, r]))

  const dotsByLane = new Map<string, LaneDot[]>()
  for (const lane of lanes) dotsByLane.set(lane.key, [])
  for (const row of rows) {
    for (const key of laneKeysForSessao(row.sessao)) {
      dotsByLane.get(key)?.push({ sessaoId: row.sessao.id, y: row.y })
    }
  }

  const connectors: Connector[] = []
  for (const [laneKey, dots] of dotsByLane) {
    const sorted = [...dots].sort((a, b) => a.y - b.y)
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i]
      const b = sorted[i + 1]
      const rowsBetween = Math.round((b.y - a.y) / ROW_HEIGHT) - 1
      connectors.push({ laneKey, y1: a.y, y2: b.y, gap: Math.max(0, rowsBetween) })
    }
  }

  const width = semArcoLane.x + LANE_WIDTH
  const height = Math.max(ROW_HEIGHT, rows.length * ROW_HEIGHT)

  return { lanes, rows, rowByNumero, dotsByLane, connectors, width, height }
}
