import type { Arco, Local } from '../../types'

interface LocalAdminListProps {
  locais: Local[]
  arcos: Arco[]
  adding: boolean
  onStartAdd: () => void
  onCancelAdd: () => void
  onEdit: (local: Local) => void
  onDelete: (id: number) => void
  onLocalHover?: (id: number | null) => void
}

export function LocalAdminList({
  locais,
  arcos,
  adding,
  onStartAdd,
  onCancelAdd,
  onEdit,
  onDelete,
  onLocalHover,
}: LocalAdminListProps) {
  return (
    <div className="gm-section">
      {!adding ? (
        <button type="button" className="btn btn-primary btn-block" onClick={onStartAdd}>
          + Novo local
        </button>
      ) : (
        <div className="text-muted" style={{ fontSize: 13 }}>
          Clique no mapa para posicionar o local.{' '}
          <button type="button" className="btn btn-ghost" onClick={onCancelAdd}>
            Cancelar
          </button>
        </div>
      )}
      <div className="gm-stack">
        {locais.length === 0 && <p className="text-muted">Nenhum item.</p>}
        {locais.map((loc) => {
          const arco = arcos.find((a) => a.id === loc.arco_id)
          return (
            <div
              key={loc.id}
              className="card elev-sm"
              onMouseEnter={() => onLocalHover?.(loc.id)}
              onMouseLeave={() => onLocalHover?.(null)}
            >
              {arco && <div className="card-kicker">{arco.titulo}</div>}
              <div className="card-title">{loc.nome}</div>
              <div className="gm-row">
                <button type="button" className="btn btn-secondary" onClick={() => onEdit(loc)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    if (window.confirm('Excluir este local?')) onDelete(loc.id)
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
