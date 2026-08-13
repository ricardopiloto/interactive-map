import { useTranslation } from 'react-i18next'
import type { Arco, Local, NPC, Waypoint } from '../../types'
import { ImageSlot } from '../media/ImageSlot'

export const PIN_COLOR_VISITED = '#e5484d'
export const PIN_COLOR_KNOWN = '#c4b5fd'

const HEX_PIN = /^#[0-9a-fA-F]{6}$/

export interface LocalFormDraft {
  id?: number
  nome: string
  descricao: string
  data_sessao: string
  arco_id: number | null
  npc_ids: number[]
  saida_ids: number[]
  x: number
  y: number
  imagem_url: string | null
  cor_pin: string
  waypoint_id: number | null
  isNew: boolean
}

interface LocalFormDialogProps {
  draft: LocalFormDraft
  arcos: Arco[]
  npcs: NPC[]
  locais: Local[]
  waypoints: Waypoint[]
  onChange: (patch: Partial<LocalFormDraft>) => void
  onSave: () => void
  onCancel: () => void
  onStartReposition: () => void
}

export function LocalFormDialog({
  draft,
  arcos,
  npcs,
  locais,
  waypoints,
  onChange,
  onSave,
  onCancel,
  onStartReposition,
}: LocalFormDialogProps) {
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')
  const colorOk = HEX_PIN.test(draft.cor_pin)
  const canSave = Boolean(draft.nome.trim()) && colorOk
  const destinoOptions = locais.filter((l) => l.id !== draft.id)
  const waypointsElegiveis = waypoints.filter(
    (w) => w.local_id == null || w.local_id === draft.id,
  )
  const dialogTitle = draft.isNew ? t('localForm.new') : t('localForm.edit')

  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog" aria-label={dialogTitle}>
        <div className="dialog-title">{dialogTitle}</div>
        <div className="dialog__body">
          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('localForm.identidade')}</h6>
            <div className="field">
              <label>{tc('form.nome')}</label>
              <input
                className="input"
                value={draft.nome}
                onChange={(e) => onChange({ nome: e.target.value })}
              />
            </div>
            <div className="field">
              <label>
                {tc('form.descricao')}{' '}
                <span className="text-muted">{t('localForm.descMarkdown')}</span>
              </label>
              <textarea
                className="input"
                rows={3}
                value={draft.descricao}
                onChange={(e) => onChange({ descricao: e.target.value })}
                placeholder={t('localForm.descPlaceholder')}
              />
            </div>
            <div className="field">
              <label>{t('localForm.sessaoLabel')}</label>
              <input
                className="input"
                value={draft.data_sessao}
                placeholder={t('localForm.sessaoPlaceholder')}
                onChange={(e) => onChange({ data_sessao: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{t('localForm.arco')}</label>
              <select
                className="input"
                value={draft.arco_id ?? ''}
                onChange={(e) =>
                  onChange({ arco_id: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">{t('localForm.nenhum')}</option>
                {arcos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="local-cor-pin">{t('localForm.corPin')}</label>
              <div className="gm-row" style={{ alignItems: 'center', marginTop: 0 }}>
                <input
                  id="local-cor-pin"
                  type="color"
                  value={colorOk ? draft.cor_pin : PIN_COLOR_KNOWN}
                  onChange={(e) => onChange({ cor_pin: e.target.value.toLowerCase() })}
                  aria-label={t('localForm.corPinAria')}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  title={t('localForm.visitadoTitle')}
                  onClick={() => onChange({ cor_pin: PIN_COLOR_VISITED })}
                >
                  {t('localForm.visitado')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  title={t('localForm.conhecidoTitle')}
                  onClick={() => onChange({ cor_pin: PIN_COLOR_KNOWN })}
                >
                  {t('localForm.conhecido')}
                </button>
              </div>
              {!colorOk && (
                <p className="map-page__inline-error" role="alert">
                  {t('localForm.corInvalida')}
                </p>
              )}
            </div>
          </div>

          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('localForm.imagem')}</h6>
            <ImageSlot
              src={draft.imagem_url}
              placeholder={t('localForm.imagemPlaceholder')}
              shape="rounded"
              editable
              category="locals"
              fit="contain"
              className={`local-form__image${draft.imagem_url ? '' : ' local-form__image--empty'}`}
              onUploaded={(url) => onChange({ imagem_url: url })}
            />
          </div>

          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('localForm.vinculos')}</h6>
            <div className="field">
              <label htmlFor="local-waypoint">{t('localForm.noRede')}</label>
              <select
                id="local-waypoint"
                className="input"
                value={draft.waypoint_id ?? ''}
                onChange={(e) => {
                  const wid = e.target.value ? Number(e.target.value) : null
                  const wp = wid != null ? waypoints.find((w) => w.id === wid) : undefined
                  onChange({
                    waypoint_id: wid,
                    ...(wp ? { x: wp.x, y: wp.y } : {}),
                  })
                }}
              >
                <option value="">{t('localForm.semNo')}</option>
                {waypointsElegiveis.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nome?.trim() || t('localForm.noFallback', { id: w.id })}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t('localForm.npcsPresentes')}</label>
              <div className="gm-chips">
                {npcs.map((n) => {
                  const on = draft.npc_ids.includes(n.id)
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={on ? 'tag tag-accent' : 'tag tag-outline'}
                      onClick={() =>
                        onChange({
                          npc_ids: on
                            ? draft.npc_ids.filter((id) => id !== n.id)
                            : [...draft.npc_ids, n.id],
                        })
                      }
                    >
                      {n.nome}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="field">
              <label>{t('localForm.saidas')}</label>
              <div className="gm-chips">
                {destinoOptions.length === 0 && (
                  <span className="card-meta">{t('localForm.cadastreLocais')}</span>
                )}
                {destinoOptions.map((loc) => {
                  const on = draft.saida_ids.includes(loc.id)
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      className={on ? 'tag tag-accent' : 'tag tag-outline'}
                      onClick={() =>
                        onChange({
                          saida_ids: on
                            ? draft.saida_ids.filter((id) => id !== loc.id)
                            : [...draft.saida_ids, loc.id],
                        })
                      }
                    >
                      {loc.nome}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('localForm.posicao')}</h6>
            <p className="card-meta">
              x {draft.x.toFixed(2)} · y {draft.y.toFixed(2)}{' '}
              {!draft.isNew && (
                <button type="button" className="btn btn-ghost" onClick={onStartReposition}>
                  {t('localForm.reposicionar')}
                </button>
              )}
            </p>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {tc('buttons.cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={!canSave}>
            {tc('buttons.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function localToDraft(local: Local): LocalFormDraft {
  return {
    id: local.id,
    nome: local.nome,
    descricao: local.descricao,
    data_sessao: local.data_sessao ?? '',
    arco_id: local.arco_id,
    npc_ids: [...local.npc_ids],
    saida_ids: [...(local.saida_ids ?? [])],
    x: local.x,
    y: local.y,
    imagem_url: local.imagem_url,
    cor_pin: local.cor_pin || PIN_COLOR_KNOWN,
    waypoint_id: local.waypoint_id ?? null,
    isNew: false,
  }
}
