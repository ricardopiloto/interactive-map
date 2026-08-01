import type { GrupoFormato } from '../../types'

interface GrupoAdminPanelProps {
  x: number
  y: number
  formato: GrupoFormato
  moving: boolean
  onStartMove: () => void
  onCancelMove: () => void
  onFormatoChange: (formato: GrupoFormato) => void
}

export function GrupoAdminPanel({
  x,
  y,
  formato,
  moving,
  onStartMove,
  onCancelMove,
  onFormatoChange,
}: GrupoAdminPanelProps) {
  return (
    <div className="gm-section">
      <div className="card elev-sm">
        <div className="card-meta">
          Posição atual: x {x.toFixed(2)} · y {y.toFixed(2)}
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Formato do ícone</label>
          <div className="seg" style={{ width: '100%' }}>
            <label className="seg-opt" style={{ flex: 1, justifyContent: 'center' }}>
              <input
                type="radio"
                name="grupo-formato"
                checked={formato === 'bandeira'}
                onChange={() => onFormatoChange('bandeira')}
              />
              Bandeira
            </label>
            <label className="seg-opt" style={{ flex: 1, justifyContent: 'center' }}>
              <input
                type="radio"
                name="grupo-formato"
                checked={formato === 'brasao'}
                onChange={() => onFormatoChange('brasao')}
              />
              Brasão
            </label>
          </div>
        </div>
        {!moving ? (
          <button type="button" className="btn btn-primary btn-block" onClick={onStartMove}>
            Mover ícone no mapa
          </button>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--color-accent-300)' }}>
            Clique no mapa para reposicionar.{' '}
            <button type="button" className="btn btn-ghost" onClick={onCancelMove}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
