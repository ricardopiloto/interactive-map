import type { NPCStatus, PersonagemTipo } from '../../types'
import { ImageSlot } from '../media/ImageSlot'

export interface PersonagemDraft {
  id?: number
  nome: string
  tipo: PersonagemTipo
  papel: string
  faccao: string
  descricao: string
  status: NPCStatus
  retrato_url: string | null
  isNew: boolean
}

interface PersonagemFormDialogProps {
  title: string
  draft: PersonagemDraft
  onChange: (patch: Partial<PersonagemDraft>) => void
  onSave: () => void
  onCancel: () => void
}

export function PersonagemFormDialog({
  title,
  draft,
  onChange,
  onSave,
  onCancel,
}: PersonagemFormDialogProps) {
  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog" aria-labelledby="personagem-form-title">
        <div className="dialog-title" id="personagem-form-title">
          {title}
        </div>
        <div className="dialog__body">
          <ImageSlot
            src={draft.retrato_url}
            placeholder="Retrato do personagem"
            shape="rounded"
            editable
            category="portraits"
            fit="contain"
            className={`npc-form__portrait${draft.retrato_url ? '' : ' npc-form__portrait--empty'}`}
            onUploaded={(url) => onChange({ retrato_url: url })}
          />

          <div className="field">
            <label>Nome</label>
            <input
              className="input"
              value={draft.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Tipo</label>
            <div className="seg" role="radiogroup" aria-label="Tipo de personagem">
              <label className="seg-opt">
                <input
                  type="radio"
                  name="personagem-tipo"
                  checked={draft.tipo === 'pj'}
                  onChange={() => onChange({ tipo: 'pj' })}
                />
                PJ
              </label>
              <label className="seg-opt">
                <input
                  type="radio"
                  name="personagem-tipo"
                  checked={draft.tipo === 'npc'}
                  onChange={() => onChange({ tipo: 'npc' })}
                />
                NPC
              </label>
            </div>
          </div>

          <div className="field">
            <label>Papel (opcional)</label>
            <input
              className="input"
              placeholder="ex: Caçadora de Recompensas"
              value={draft.papel}
              onChange={(e) => onChange({ papel: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Facção (opcional)</label>
            <input
              className="input"
              value={draft.faccao}
              onChange={(e) => onChange({ faccao: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Descrição</label>
            <textarea
              className="input"
              rows={3}
              value={draft.descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={draft.status}
              onChange={(e) => onChange({ status: e.target.value as NPCStatus })}
            >
              <option value="vivo">Vivo</option>
              <option value="morto">Morto</option>
              <option value="desaparecido">Desaparecido</option>
              <option value="desconhecido">Desconhecido</option>
            </select>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSave}
            disabled={!draft.nome.trim()}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
