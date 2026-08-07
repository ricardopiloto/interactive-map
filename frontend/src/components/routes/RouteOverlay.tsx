import type { RoutePlanItem } from '../../types'

interface Props {
  rotas: RoutePlanItem[]
  selectedIndex: number
}

function toPoints(geom: { x: number; y: number }[]) {
  return geom.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')
}

function fatigueLevel(fadigaApos: number): number {
  return Math.min(6, Math.max(1, Math.floor(fadigaApos)))
}

export function RouteOverlay({ rotas, selectedIndex }: Props) {
  if (rotas.length === 0) return null
  const selected = rotas[selectedIndex]
  const diasVisuais = selected?.dias_visuais ?? []

  return (
    <svg
      className="campaign-map__travel-routes"
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {rotas.map((r, i) => {
        if (r.geometria.length < 2) return null
        const isSelected = i === selectedIndex
        if (!isSelected) {
          return (
            <polyline
              key={`travel-alt-${i}-${r.waypoint_ids.join('-')}`}
              className="campaign-map__travel-route campaign-map__travel-route--alt"
              points={toPoints(r.geometria)}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          )
        }

        const slices =
          diasVisuais.length > 0
            ? diasVisuais
            : [
                {
                  dia: 1,
                  residual: false,
                  fadiga_apos: 0,
                  geometria: r.geometria,
                },
              ]

        return slices.map((dia) => {
          if (dia.geometria.length < 2) return null
          const residualRed = dia.residual && dia.fadiga_apos >= 1
          const level = residualRed ? fatigueLevel(dia.fadiga_apos) : 0
          const visibleClass = residualRed
            ? `campaign-map__travel-route campaign-map__travel-route--fadiga campaign-map__travel-route--fadiga-${level}`
            : 'campaign-map__travel-route campaign-map__travel-route--selected'
          const title = residualRed
            ? `Ganho de fadiga — saldo ${dia.fadiga_apos}`
            : undefined
          const pts = toPoints(dia.geometria)
          return (
            <g key={`travel-day-${i}-${dia.dia}`}>
              {title ? (
                <polyline
                  className="campaign-map__travel-route-hit"
                  points={pts}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{title}</title>
                </polyline>
              ) : null}
              <polyline
                className={visibleClass}
                points={pts}
                fill="none"
                vectorEffect="non-scaling-stroke"
              >
                {title ? <title>{title}</title> : null}
              </polyline>
            </g>
          )
        })
      })}
    </svg>
  )
}
