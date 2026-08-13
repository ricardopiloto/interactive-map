import type { Personagem, VinculoDirecao, VinculoTipo } from '../../types'
import { suggestionsForTipos } from './qualificadorSuggestions'
import { VINCULO_STYLES, VINCULO_TIPOS } from './vinculoStyles'
import './VinculoFormDialog.css'

export type VinculoModo = 'reciproco' | 'duas_vias'

export interface VinculoDraft {
  id?: number
  personagem_a_id: number | null
  personagem_b_id: number | null
  modo: VinculoModo
  tipo_ab: VinculoTipo
  tipo_ba: VinculoTipo
  nota_ab: string
  nota_ba: string
  conhecido_ab: boolean
  conhecido_ba: boolean
  qualificador: string
  direcao: VinculoDirecao | null
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

function nomeOf(personagens: Personagem[], id: number | null): string {
  if (id == null) return 'A'
  return personagens.find((p) => p.id === id)?.nome ?? 'A'
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

  const nameA = nomeOf(personagens, draft.personagem_a_id)
  const nameB = nomeOf(personagens, draft.personagem_b_id)
  const duas = draft.modo === 'duas_vias'
  const suggestions = duas
    ? suggestionsForTipos(draft.tipo_ab, draft.tipo_ba)
    : suggestionsForTipos(draft.tipo_ab)
  const listId = 'vinculo-qualificador-suggestions'

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
            <label>Modo</label>
            <div className="vinculo-form__modo">
              <label className="vinculo-form__checkbox">
                <input
                  type="radio"
                  name="vinculo-modo"
                  checked={!duas}
                  onChange={() => onChange({ modo: 'reciproco', tipo_ba: draft.tipo_ab, nota_ba: '' })}
                />
                Recíproco
              </label>
              <label className="vinculo-form__checkbox">
                <input
                  type="radio"
                  name="vinculo-modo"
                  checked={duas}
                  onChange={() =>
                    onChange({
                      modo: 'duas_vias',
                      conhecido_ab: true,
                      conhecido_ba: true,
                    })
                  }
                />
                Duas vias
              </label>
            </div>
          </div>

          <div className="field">
            <label>{duas ? `${nameA} vê ${nameB} como` : 'Tipo de vínculo'}</label>
            <select
              className="input"
              value={draft.tipo_ab}
              onChange={(e) => {
                const tipo_ab = e.target.value as VinculoTipo
                onChange(duas ? { tipo_ab } : { tipo_ab, tipo_ba: tipo_ab })
              }}
            >
              {VINCULO_TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {VINCULO_STYLES[tipo].label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>{duas ? `Nota (${nameA} → ${nameB})` : 'Nota (opcional)'}</label>
            <textarea
              className="input"
              rows={2}
              placeholder="ex: Salvou a vida dela em Bögenhafen"
              value={draft.nota_ab}
              onChange={(e) => onChange({ nota_ab: e.target.value })}
            />
          </div>

          {duas && (
            <label className="vinculo-form__checkbox">
              <input
                type="checkbox"
                checked={draft.conhecido_ab}
                onChange={(e) => onChange({ conhecido_ab: e.target.checked })}
              />
              Conhecido pelos jogadores ({nameA} → {nameB})
            </label>
          )}

          {duas && (
            <>
              <div className="field">
                <label>
                  {nameB} vê {nameA} como
                </label>
                <select
                  className="input"
                  value={draft.tipo_ba}
                  onChange={(e) => onChange({ tipo_ba: e.target.value as VinculoTipo })}
                >
                  {VINCULO_TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {VINCULO_STYLES[tipo].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>
                  Nota ({nameB} → {nameA})
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="ex: Sonha com mais do que amizade"
                  value={draft.nota_ba}
                  onChange={(e) => onChange({ nota_ba: e.target.value })}
                />
              </div>

              <label className="vinculo-form__checkbox">
                <input
                  type="checkbox"
                  checked={draft.conhecido_ba}
                  onChange={(e) => onChange({ conhecido_ba: e.target.checked })}
                />
                Conhecido pelos jogadores ({nameB} → {nameA})
              </label>
            </>
          )}

          <div className="field">
            <label>Qualificador (opcional)</label>
            <input
              className="input"
              list={listId}
              maxLength={80}
              placeholder="ex: Mentor, Medo, Rival…"
              value={draft.qualificador}
              onChange={(e) => onChange({ qualificador: e.target.value })}
            />
            <datalist id={listId}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label>Direção</label>
            <div className="vinculo-form__modo">
              <label className="vinculo-form__checkbox">
                <input
                  type="radio"
                  name="vinculo-direcao"
                  checked={draft.direcao == null}
                  onChange={() => onChange({ direcao: null })}
                />
                Mútuo
              </label>
              <label className="vinculo-form__checkbox">
                <input
                  type="radio"
                  name="vinculo-direcao"
                  checked={draft.direcao === 'a_para_b'}
                  onChange={() => onChange({ direcao: 'a_para_b' })}
                />
                {nameA} → {nameB}
              </label>
              <label className="vinculo-form__checkbox">
                <input
                  type="radio"
                  name="vinculo-direcao"
                  checked={draft.direcao === 'b_para_a'}
                  onChange={() => onChange({ direcao: 'b_para_a' })}
                />
                {nameB} → {nameA}
              </label>
            </div>
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
