import type { RoutePlanItem } from '../../types'

interface Props {
  rotas: RoutePlanItem[]
  selectedIndex: number
}

function toPoints(geom: { x: number; y: number }[]) {
  return geom.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')
}

export function RouteOverlay({ rotas, selectedIndex }: Props) {
  if (rotas.length === 0) return null
  return (
    <svg
      className="campaign-map__travel-routes"
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {rotas.map((r, i) => {
        if (r.geometria.length < 2) return null
        const selected = i === selectedIndex
        return (
          <polyline
            key={`travel-${i}-${r.waypoint_ids.join('-')}`}
            className={
              selected
                ? 'campaign-map__travel-route campaign-map__travel-route--selected'
                : 'campaign-map__travel-route campaign-map__travel-route--alt'
            }
            points={toPoints(r.geometria)}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}
