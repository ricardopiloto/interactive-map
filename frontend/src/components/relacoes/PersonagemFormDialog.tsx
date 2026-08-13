import { useTranslation } from 'react-i18next'
import type { InstanceConfig, NPCStatus, PersonagemTipo } from '../../types'
import { ImageSlot } from '../media/ImageSlot'
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

  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog" aria-labelledby="personagem-form-title">
        <div className="dialog-title" id="personagem-form-title">
          {title}
        </div>
        <div className="dialog__body">
          {missing.length > 0 && (
            <p className="tag tag-accent" role="status">
              {t('personagemForm.moduloIndisponivel')} {missing.join(', ')}
            </p>
          )}

          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('personagemForm.identidade')}</h6>
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
              <input
                className="input"
                value={draft.nome}
                onChange={(e) => onChange({ nome: e.target.value })}
                autoFocus
              />
            </div>
            <div className="field">
              <label>{tc('tipo.pj')}/{tc('tipo.npc')}</label>
              <div className="seg" role="radiogroup" aria-label={t('personagemForm.tipoPersonagem')}>
                <label className="seg-opt">
                  <input
                    type="radio"
                    name="personagem-tipo"
                    checked={draft.tipo === 'pj'}
                    onChange={() => onChange({ tipo: 'pj' })}
                  />
                  {tc('tipo.pj')}
                </label>
                <label className="seg-opt">
                  <input
                    type="radio"
                    name="personagem-tipo"
                    checked={draft.tipo === 'npc'}
                    onChange={() => onChange({ tipo: 'npc' })}
                  />
                  {tc('tipo.npc')}
                </label>
              </div>
            </div>
            <div className="field">
              <label>{tc('form.papelOpcional')}</label>
              <input
                className="input"
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
          </div>

          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('personagemForm.atributos')}</h6>
            <div className="field">
              <label>{tc('form.faccaoOpcional')}</label>
              <input
                className="input"
                value={draft.faccao}
                onChange={(e) => onChange({ faccao: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{tc('form.status')}</label>
              <select
                className="input"
                value={draft.status}
                onChange={(e) => onChange({ status: e.target.value as NPCStatus })}
              >
                <option value="vivo">{tc('status.vivo')}</option>
                <option value="morto">{tc('status.morto')}</option>
                <option value="desaparecido">{tc('status.desaparecido')}</option>
                <option value="desconhecido">{tc('status.desconhecido')}</option>
              </select>
            </div>
          </div>

          {implemented.length > 0 && (
            <div className="dialog__group">
              <h6 className="dialog__group-title">{t('personagemForm.mecanicas')}</h6>
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
            </div>
          )}

          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('personagemForm.notas')}</h6>
            <div className="field">
              <label>{tc('form.descricao')}</label>
              <textarea
                className="input"
                rows={3}
                value={draft.descricao}
                onChange={(e) => onChange({ descricao: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {tc('buttons.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSave}
            disabled={!draft.nome.trim()}
          >
            {tc('buttons.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
