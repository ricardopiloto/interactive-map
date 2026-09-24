import type { RouteEdge, WaypointNode } from './types'

export interface RouteOption {
  key: string
  path: string[] // waypoint ids
  distanciaMi: number
  tipoDominante: RouteEdge['tipo']
  viaEdges: RouteEdge[]
}

interface Adj {
  [nodeId: string]: { to: string; edge: RouteEdge }[]
}

function buildAdjacency(edges: RouteEdge[]): Adj {
  const adj: Adj = {}
  for (const e of edges) {
    ;(adj[e.a] ??= []).push({ to: e.b, edge: e })
    ;(adj[e.b] ??= []).push({ to: e.a, edge: e })
  }
  return adj
}

/** Dijkstra simples; `avoid` permite calcular uma rota alternativa evitando um nó. */
function shortestPath(
  edges: RouteEdge[],
  from: string,
  to: string,
  opts: { avoidTipo?: RouteEdge['tipo']; preferTipo?: RouteEdge['tipo'] } = {},
): { path: string[]; edgesUsed: RouteEdge[]; distanciaMi: number } | null {
  const adj = buildAdjacency(edges)
  const dist: Record<string, number> = { [from]: 0 }
  const prev: Record<string, { node: string; edge: RouteEdge } | undefined> = {}
  const visited = new Set<string>()
  const queue = new Set<string>([from])

  while (queue.size > 0) {
    let u: string | null = null
    let best = Infinity
    for (const n of queue) {
      if ((dist[n] ?? Infinity) < best) { best = dist[n]; u = n }
    }
    if (u === null) break
    queue.delete(u)
    if (visited.has(u)) continue
    visited.add(u)
    if (u === to) break

    for (const { to: v, edge } of adj[u] ?? []) {
      if (opts.avoidTipo && edge.tipo === opts.avoidTipo) continue
      let weight = edge.distanciaMi
      if (opts.preferTipo && edge.tipo === opts.preferTipo) weight *= 0.72
      const nd = (dist[u] ?? Infinity) + weight
      if (nd < (dist[v] ?? Infinity)) {
        dist[v] = nd
        prev[v] = { node: u, edge }
        queue.add(v)
      }
    }
  }

  if (dist[to] === undefined) return null
  const path: string[] = [to]
  const edgesUsed: RouteEdge[] = []
  let cur = to
  while (cur !== from) {
    const p = prev[cur]
    if (!p) break
    edgesUsed.unshift(p.edge)
    path.unshift(p.node)
    cur = p.node
  }
  const realDistance = edgesUsed.reduce((s, e) => s + e.distanciaMi, 0)
  return { path, edgesUsed, distanciaMi: realDistance }
}

function dominantTipo(edges: RouteEdge[]): RouteEdge['tipo'] {
  const counts: Record<string, number> = {}
  for (const e of edges) counts[e.tipo] = (counts[e.tipo] ?? 0) + e.distanciaMi
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as RouteEdge['tipo']) ?? 'estrada'
}

/** Calcula até 3 alternativas: mais direta, preferindo estrada e preferindo rio. */
export function computeRoutes(edges: RouteEdge[], fromId: string, toId: string): RouteOption[] {
  if (fromId === toId || edges.length === 0) return []
  const attempts: { key: string; opts: Parameters<typeof shortestPath>[3] }[] = [
    { key: 'direta', opts: {} },
    { key: 'por-estrada', opts: { preferTipo: 'estrada' } },
    { key: 'por-rio', opts: { preferTipo: 'rio' } },
  ]

  const seen = new Set<string>()
  const options: RouteOption[] = []
  for (const attempt of attempts) {
    const result = shortestPath(edges, fromId, toId, attempt.opts)
    if (!result) continue
    const sig = result.path.join('>')
    if (seen.has(sig)) continue
    seen.add(sig)
    options.push({
      key: attempt.key,
      path: result.path,
      distanciaMi: Math.round(result.distanciaMi * 10) / 10,
      tipoDominante: dominantTipo(result.edgesUsed),
      viaEdges: result.edgesUsed,
    })
  }
  return options.sort((a, b) => a.distanciaMi - b.distanciaMi)
}

export function nodeLabel(waypoints: WaypointNode[], id: string): string {
  return waypoints.find((w) => w.id === id)?.nome ?? id
}

/** Custo mocado em PO — só pra ordenar "mais barata"; sem pretensão de bater com o motor real do backend. */
export function estimateCustoPo(distanciaMi: number, transporte: 'pago' | 'proprio'): number {
  return Math.round((transporte === 'pago' ? distanciaMi * 0.6 : distanciaMi * 0.08) * 10) / 10
}

export function sortRouteOptions(
  options: RouteOption[],
  ordenacao: 'mais_rapida' | 'mais_barata',
  preferenciaVia: 'nenhuma' | 'rio' | 'estrada',
  transporte: 'pago' | 'proprio',
): RouteOption[] {
  const sorted = [...options].sort((a, b) => {
    if (ordenacao === 'mais_barata') {
      return estimateCustoPo(a.distanciaMi, transporte) - estimateCustoPo(b.distanciaMi, transporte)
    }
    return a.distanciaMi - b.distanciaMi
  })
  if (preferenciaVia === 'nenhuma') return sorted
  const matching = sorted.filter((o) => o.tipoDominante === preferenciaVia)
  const rest = sorted.filter((o) => o.tipoDominante !== preferenciaVia)
  return [...matching, ...rest]
}
