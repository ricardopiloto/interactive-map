import type { Local, Waypoint } from '../../types'
import { foldText } from '../../utils/textMatch'

/** FR-002 / combobox: own trimmed name, or linked Local with trimmed name. */
export function isNamedWaypoint(wp: Waypoint, locaisById: Map<number, string>): boolean {
  if (wp.nome?.trim()) return true
  if (wp.local_id != null) {
    const localNome = locaisById.get(wp.local_id)?.trim()
    if (localNome) return true
  }
  return false
}

/** nome do nó → nome do Local (named options only; `Nó {id}` is defensive). */
export function waypointOptionLabel(wp: Waypoint, locaisById: Map<number, string>): string {
  const nome = wp.nome?.trim()
  if (nome) return nome
  if (wp.local_id != null) {
    const localNome = locaisById.get(wp.local_id)?.trim()
    if (localNome) return localNome
  }
  return `Nó ${wp.id}`
}

function buildLocaisById(locais: Local[]): Map<number, string> {
  const m = new Map<number, string>()
  for (const l of locais) m.set(l.id, l.nome)
  return m
}

/**
 * Resolve a map Local pin to a named route waypoint usable as De/Para.
 * 1) waypoint.local_id  2) local.waypoint_id  3) fold-equal name vs combobox label
 */
export function resolveNamedWaypointForLocal(
  localId: number,
  waypoints: Waypoint[],
  locais: Local[],
): Waypoint | null {
  const locaisById = buildLocaisById(locais)
  const byLink = waypoints.find((w) => w.local_id === localId)
  if (byLink && isNamedWaypoint(byLink, locaisById)) return byLink

  const local = locais.find((l) => l.id === localId)
  if (local?.waypoint_id != null) {
    const byLocalField = waypoints.find((w) => w.id === local.waypoint_id)
    if (byLocalField && isNamedWaypoint(byLocalField, locaisById)) return byLocalField
  }

  const localNome = local?.nome?.trim()
  if (localNome) {
    const target = foldText(localNome)
    const named = waypoints
      .filter((w) => isNamedWaypoint(w, locaisById))
      .sort((a, b) => a.id - b.id)
    for (const w of named) {
      if (foldText(waypointOptionLabel(w, locaisById)) === target) return w
    }
  }

  return null
}

export type RouteMapPick = { waypointId: number; nonce: number }
