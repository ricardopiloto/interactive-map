import type { Personagem, VinculoTipo } from '../../types'
import { VINCULO_STYLES, VINCULO_TIPOS } from './vinculoStyles'
import './VinculoFormDialog.css'

export interface VinculoDraft {
  id?: number
  personagem_a_id: number | null
  personagem_b_id: number | null
  tipo: VinculoTipo
  nota: string
  publico: boolean
  isNew: boolean
}

interface VinculoFormDialogProps {
  title: string
  draft: VinculoDraft
  personagens: Personagem[]
  onChange: (patch: Partial<VinculoDraft>) => void
  onSave: () => void
  onCancel: () => void
}

export function VinculoFormDialog({
  title,
  draft,
  personagens,
  onChange,
  onSave,
  onCancel,
}: VinculoFormDialogProps) {
  const sorted = [...personagens].sort((a, b) => a.nome.localeCompare(b.nome))
  const valid =
    draft.personagem_a_id != null &&
    draft.personagem_b_id != null &&
    draft.personagem_a_id !== draft.personagem_b_id

  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog" aria-labelledby="vinculo-form-title">
        <div className="dialog-title" id="vinculo-form-title">
          {title}
        </div>
        <div className="dialog__body">
          <div className="field">
            <label>Personagem A</label>
            <select
              className="input"
              value={draft.personagem_a_id ?? ''}
              onChange={(e) => onChange({ personagem_a_id: Number(e.target.value) || null })}
            >
              <option value="">Selecione…</option>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Personagem B</label>
            <select
              className="input"
              value={draft.personagem_b_id ?? ''}
              onChange={(e) => onChange({ personagem_b_id: Number(e.target.value) || null })}
            >
              <option value="">Selecione…</option>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {draft.personagem_a_id != null &&
            draft.personagem_a_id === draft.personagem_b_id && (
              <p className="map-page__inline-error">Escolha dois personagens diferentes.</p>
            )}

          <div className="field">
            <label>Tipo de vínculo</label>
            <select
              className="input"
              value={draft.tipo}
              onChange={(e) => onChange({ tipo: e.target.value as VinculoTipo })}
            >
              {VINCULO_TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {VINCULO_STYLES[tipo].label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Nota (opcional)</label>
            <textarea
              className="input"
              rows={2}
              placeholder="ex: Salvou a vida dela em Bögenhafen"
              value={draft.nota}
              onChange={(e) => onChange({ nota: e.target.value })}
            />
          </div>

          <label className="vinculo-form__checkbox">
            <input
              type="checkbox"
              checked={draft.publico}
              onChange={(e) => onChange({ publico: e.target.checked })}
            />
            Visível para jogadores
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={!valid}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
