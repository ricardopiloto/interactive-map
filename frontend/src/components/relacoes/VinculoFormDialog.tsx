import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Personagem, VinculoDirecao, VinculoTipo } from '../../types'
import { formSnapshot, isFormDirty } from '../forms/dirty'
import { FormDrawer } from '../forms/FormDrawer'
import { suggestionsForTipos } from './qualificadorSuggestions'
import { VINCULO_TIPOS, getVinculoTipoLabel } from './vinculoStyles'
import './VinculoFormDialog.css'
import { Input, Select, Textarea } from '../ui'

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
  qualificador_ab: string
  qualificador_ba: string
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
  const { t } = useTranslation('relacoes')
  const { t: tc } = useTranslation('comum')
  const sorted = [...personagens].sort((a, b) => a.nome.localeCompare(b.nome))
  const valid =
    draft.personagem_a_id != null &&
    draft.personagem_b_id != null &&
    draft.personagem_a_id !== draft.personagem_b_id
  const baseline = useRef(formSnapshot(draft))
  const [submitted, setSubmitted] = useState(false)
  const dirty = isFormDirty(baseline.current, draft)
  const samePerson =
    draft.personagem_a_id != null && draft.personagem_a_id === draft.personagem_b_id
  const aError =
    submitted && draft.personagem_a_id == null ? tc('form.required') : undefined
  const bError =
    submitted && draft.personagem_b_id == null
      ? tc('form.required')
      : submitted && samePerson
        ? t('vinculoForm.doisPersonagens')
        : undefined

  const nameA = nomeOf(personagens, draft.personagem_a_id)
  const nameB = nomeOf(personagens, draft.personagem_b_id)
  const duas = draft.modo === 'duas_vias'
  const suggestionsAb = suggestionsForTipos(draft.tipo_ab)
  const suggestionsBa = suggestionsForTipos(draft.tipo_ba)

  function handleSave() {
    setSubmitted(true)
    if (!valid) return
    onSave()
  }

  return (
    <FormDrawer open title={title} dirty={dirty} onClose={onCancel} onSave={handleSave}>
      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('vinculoForm.personagens')}</h6>
        <div className="vinculo-form__group-row">
          <div className="field">
            <label>{t('vinculoForm.personagemA')}</label>
            <Select
              value={draft.personagem_a_id ?? ''}
              onChange={(e) => onChange({ personagem_a_id: Number(e.target.value) || null })}
              aria-invalid={Boolean(aError)}
            >
              <option value="">{t('vinculoForm.selecione')}</option>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
            {aError ? <p className="field-error">{aError}</p> : null}
          </div>
          <div className="field">
            <label>{t('vinculoForm.personagemB')}</label>
            <Select
              value={draft.personagem_b_id ?? ''}
              onChange={(e) => onChange({ personagem_b_id: Number(e.target.value) || null })}
              aria-invalid={Boolean(bError)}
            >
              <option value="">{t('vinculoForm.selecione')}</option>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
            {bError ? <p className="field-error">{bError}</p> : null}
          </div>
        </div>
      </section>

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('vinculoForm.tipoDirecao')}</h6>
            <div className="field">
              <label>{t('vinculoForm.modo')}</label>
              <div className="vinculo-form__modo">
                <label className="vinculo-form__checkbox">
                  <input
                    type="radio"
                    name="vinculo-modo"
                    checked={!duas}
                    onChange={() =>
                      onChange({
                        modo: 'reciproco',
                        tipo_ba: draft.tipo_ab,
                        nota_ba: '',
                        qualificador_ba: '',
                      })
                    }
                  />
                  {t('vinculoForm.modoReciproco')}
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
                        qualificador_ba: '',
                      })
                    }
                  />
                  {t('vinculoForm.modoDuasVias')}
                </label>
              </div>
            </div>

            <div className="field">
              <label>
                {duas ? t('vinculoForm.veComo', { a: nameA, b: nameB }) : t('vinculoForm.tipoVinculo')}
              </label>
              <Select
                value={draft.tipo_ab}
                onChange={(e) => {
                  const tipo_ab = e.target.value as VinculoTipo
                  if (duas) {
                    onChange({ tipo_ab })
                    return
                  }
                  onChange(
                    tipo_ab === 'vinculo_sangue'
                      ? { tipo_ab, tipo_ba: tipo_ab, direcao: 'a_para_b' }
                      : { tipo_ab, tipo_ba: tipo_ab },
                  )
                }}
              >
                {VINCULO_TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {getVinculoTipoLabel(t, tipo)}
                  </option>
                ))}
              </Select>
            </div>

            {duas && (
              <div className="field">
                <label>{t('vinculoForm.qualificador', { a: nameA, b: nameB })}</label>
                <Input
                  list="vinculo-qualificador-ab"
                  maxLength={80}
                  placeholder={t('vinculoForm.qualExMedo')}
                  value={draft.qualificador_ab}
                  onChange={(e) => onChange({ qualificador_ab: e.target.value })}
                />
                <datalist id="vinculo-qualificador-ab">
                  {suggestionsAb.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            )}

            {duas && (
              <>
                <div className="field">
                  <label>{t('vinculoForm.veComo', { a: nameB, b: nameA })}</label>
                  <Select
                    value={draft.tipo_ba}
                    onChange={(e) => onChange({ tipo_ba: e.target.value as VinculoTipo })}
                  >
                    {VINCULO_TIPOS.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {getVinculoTipoLabel(t, tipo)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="field">
                  <label>{t('vinculoForm.qualificador', { a: nameB, b: nameA })}</label>
                  <Input
                    list="vinculo-qualificador-ba"
                    maxLength={80}
                    placeholder={t('vinculoForm.qualExAdmiracao')}
                    value={draft.qualificador_ba}
                    onChange={(e) => onChange({ qualificador_ba: e.target.value })}
                  />
                  <datalist id="vinculo-qualificador-ba">
                    {suggestionsBa.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <label className="vinculo-form__checkbox">
                  <input
                    type="checkbox"
                    checked={draft.conhecido_ab}
                    onChange={(e) => onChange({ conhecido_ab: e.target.checked })}
                  />
                  {t('vinculoForm.conhecidoJogadores', { a: nameA, b: nameB })}
                </label>

                <label className="vinculo-form__checkbox">
                  <input
                    type="checkbox"
                    checked={draft.conhecido_ba}
                    onChange={(e) => onChange({ conhecido_ba: e.target.checked })}
                  />
                  {t('vinculoForm.conhecidoJogadores', { a: nameB, b: nameA })}
                </label>
              </>
            )}

            {!duas && (
              <div className="field">
                <label>{t('vinculoForm.qualificadorOpcional')}</label>
                <Input
                  list="vinculo-qualificador-ab"
                  maxLength={80}
                  placeholder={t('vinculoForm.qualExMentor')}
                  value={draft.qualificador_ab}
                  onChange={(e) => onChange({ qualificador_ab: e.target.value })}
                />
                <datalist id="vinculo-qualificador-ab">
                  {suggestionsAb.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            )}

            <div className="field">
              <label>{t('vinculoForm.direcao')}</label>
              <div className="vinculo-form__modo">
                <label className="vinculo-form__checkbox">
                  <input
                    type="radio"
                    name="vinculo-direcao"
                    checked={draft.direcao == null}
                    onChange={() => onChange({ direcao: null })}
                  />
                  {t('vinculoForm.direcaoMutuo')}
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
              {t('vinculoForm.visivelJogadores')}
            </label>
      </section>

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('personagemForm.notas')}</h6>
          <div className="field">
            <label>
              {duas
                ? t('vinculoForm.notaDirecional', { a: nameA, b: nameB })
                : t('vinculoForm.notaOpcional')}
            </label>
            <Textarea
              rows={2}
              placeholder={t('vinculoForm.notaExSalvou')}
              value={draft.nota_ab}
              onChange={(e) => onChange({ nota_ab: e.target.value })}
            />
          </div>
          {duas && (
            <div className="field">
              <label>{t('vinculoForm.notaDirecional', { a: nameB, b: nameA })}</label>
              <Textarea
                rows={2}
                placeholder={t('vinculoForm.notaExSonha')}
                value={draft.nota_ba}
                onChange={(e) => onChange({ nota_ba: e.target.value })}
              />
            </div>
          )}
        </section>
    </FormDrawer>
  )
}
