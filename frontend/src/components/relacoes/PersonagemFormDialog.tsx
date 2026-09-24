import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { InstanceConfig, NPCStatus, PersonagemTipo } from '../../types'
import { formSnapshot, isFormDirty } from '../forms/dirty'
import { FormDrawer } from '../forms/FormDrawer'
import { MarkdownField } from '../forms/MarkdownField'
import { ImageSlot } from '../media/ImageSlot'
import { Input, Select, SegmentedControl } from '../ui'
import {
  activeImplementedModules,
  componentesPorModulo,
  unimplementedActiveModules,
} from '../../modules/registry'

export interface PersonagemDraft {
  id?: number
  nome: string
  tipo: PersonagemTipo
  papel: string
  faccao: string
  descricao: string
  status: NPCStatus
  retrato_url: string | null
  visivel_para_todos: boolean
  extensoes_mecanica: Record<string, unknown>
  isNew: boolean
}

interface PersonagemFormDialogProps {
  title: string
  draft: PersonagemDraft
  instanceConfig: InstanceConfig | null
  isGm: boolean
  onChange: (patch: Partial<PersonagemDraft>) => void
  onSave: () => void
  onCancel: () => void
}

export function PersonagemFormDialog({
  title,
  draft,
  instanceConfig,
  isGm,
  onChange,
  onSave,
  onCancel,
}: PersonagemFormDialogProps) {
  const { t } = useTranslation('relacoes')
  const { t: tc } = useTranslation('comum')
  const implemented = instanceConfig ? activeImplementedModules(instanceConfig) : []
  const missing = instanceConfig && isGm ? unimplementedActiveModules(instanceConfig) : []
  const baseline = useRef(formSnapshot(draft))
  const [submitted, setSubmitted] = useState(false)
  const dirty = isFormDirty(baseline.current, draft)
  const nomeError = submitted && !draft.nome.trim() ? tc('form.required') : undefined

  function handleSave() {
    setSubmitted(true)
    if (!draft.nome.trim()) return
    onSave()
  }

  return (
    <FormDrawer open title={title} dirty={dirty} onClose={onCancel} onSave={handleSave}>
      {missing.length > 0 && (
        <p className="ui-chip ui-chip--accent" role="status">
          {t('personagemForm.moduloIndisponivel')} {missing.join(', ')}
        </p>
      )}

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('personagemForm.identidade')}</h6>
        <ImageSlot
          src={draft.retrato_url}
          placeholder={t('personagemForm.retrato')}
          shape="rounded"
          editable
          category="portraits"
          fit="contain"
          className={`npc-form__portrait${draft.retrato_url ? '' : ' npc-form__portrait--empty'}`}
          onUploaded={(url) => onChange({ retrato_url: url })}
        />
        <div className="field">
          <label>{tc('form.nome')}</label>
          <Input
            value={draft.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            aria-invalid={Boolean(nomeError)}
          />
          {nomeError ? <p className="field-error">{nomeError}</p> : null}
        </div>
        <div className="field">
          <label>
            {tc('tipo.pj')}/{tc('tipo.npc')}
          </label>
          <SegmentedControl
            name="personagem-tipo"
            aria-label={t('personagemForm.tipoPersonagem')}
            value={draft.tipo}
            onChange={(v) => onChange({ tipo: v as PersonagemTipo })}
            options={[
              { value: 'pj', label: tc('tipo.pj') },
              { value: 'npc', label: tc('tipo.npc') },
            ]}
          />
        </div>
        <div className="field">
          <label>{tc('form.papelOpcional')}</label>
          <Input
            placeholder={t('personagemForm.papelExemplo')}
            value={draft.papel}
            onChange={(e) => onChange({ papel: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-check">
            <input
              type="checkbox"
              checked={draft.visivel_para_todos}
              onChange={(e) => onChange({ visivel_para_todos: e.target.checked })}
            />{' '}
            {t('personagemForm.visivelParaTodos')}
          </label>
          {!draft.visivel_para_todos && (
            <p className="text-muted" role="status">
              {t('personagemForm.ocultoAosJogadores')}
            </p>
          )}
        </div>
      </section>

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('personagemForm.atributos')}</h6>
        <div className="field">
          <label>{tc('form.faccaoOpcional')}</label>
          <Input
            value={draft.faccao}
            onChange={(e) => onChange({ faccao: e.target.value })}
          />
        </div>
        <div className="field">
          <label>{tc('form.status')}</label>
          <Select
            value={draft.status}
            onChange={(e) => onChange({ status: e.target.value as NPCStatus })}
          >
            <option value="vivo">{tc('status.vivo')}</option>
            <option value="morto">{tc('status.morto')}</option>
            <option value="desaparecido">{tc('status.desaparecido')}</option>
            <option value="desconhecido">{tc('status.desconhecido')}</option>
          </Select>
        </div>
      </section>

      {implemented.length > 0 && (
        <section className="form-drawer__section">
          <h6 className="form-drawer__section-title">{t('personagemForm.mecanicas')}</h6>
          {implemented.map((modulo) => {
            const Widget = componentesPorModulo[modulo]
            if (!Widget) return null
            return (
              <Widget
                key={modulo}
                value={draft.extensoes_mecanica}
                onChange={(patch) =>
                  onChange({
                    extensoes_mecanica: { ...draft.extensoes_mecanica, ...patch },
                  })
                }
              />
            )
          })}
        </section>
      )}

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('personagemForm.notas')}</h6>
        <MarkdownField
          label={tc('form.descricao')}
          value={draft.descricao}
          onChange={(descricao) => onChange({ descricao })}
        />
      </section>
    </FormDrawer>
  )
}
