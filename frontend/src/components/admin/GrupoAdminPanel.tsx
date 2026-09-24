import type { GrupoFormato } from '../../types'
import { Button, Card, CardMeta, SegmentedControl } from '../ui'

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
      <Card>
        <CardMeta>
          Posição atual: x {x.toFixed(2)} · y {y.toFixed(2)}
        </CardMeta>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Formato do ícone</label>
          <SegmentedControl
            name="grupo-formato"
            aria-label="Formato do ícone"
            className="ui-seg--full"
            value={formato}
            onChange={(v) => onFormatoChange(v as GrupoFormato)}
            options={[
              { value: 'bandeira', label: 'Bandeira' },
              { value: 'brasao', label: 'Brasão' },
            ]}
          />
        </div>
        {!moving ? (
          <Button variant="primary" block type="button" onClick={onStartMove}>
            Mover ícone no mapa
          </Button>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--color-accent-300)' }}>
            Clique no mapa para reposicionar.{' '}
            <Button variant="ghost" type="button" onClick={onCancelMove}>
              Cancelar
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
