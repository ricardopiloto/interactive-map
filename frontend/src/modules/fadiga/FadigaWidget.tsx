import type { ModuleWidgetProps } from '../registry'

export function FadigaWidget({ value, onChange }: ModuleWidgetProps) {
  const raw = value.fadiga
  const fadiga = typeof raw === 'number' ? raw : 0

  return (
    <div className="field">
      <label htmlFor="personagem-fadiga">Fadiga</label>
      <input
        id="personagem-fadiga"
        className="input"
        type="number"
        min={0}
        max={6}
        value={fadiga}
        onChange={(e) => {
          const next = Number.parseInt(e.target.value, 10)
          onChange({ fadiga: Number.isNaN(next) ? 0 : Math.min(6, Math.max(0, next)) })
        }}
      />
    </div>
  )
}
