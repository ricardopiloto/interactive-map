import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Arco, Local, NPC, Waypoint } from '../../types'
import { formSnapshot, isFormDirty } from '../forms/dirty'
import { FormDrawer } from '../forms/FormDrawer'
import { MarkdownField } from '../forms/MarkdownField'
import { ImageSlot } from '../media/ImageSlot'
import { Button, Chip, Input, Select } from '../ui'

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
  visivel_para_todos: boolean
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
  const baseline = useRef(formSnapshot(draft))
  const [submitted, setSubmitted] = useState(false)
  const dirty = isFormDirty(baseline.current, draft)
  const colorOk = HEX_PIN.test(draft.cor_pin)
  const errors = useMemo(() => {
    if (!submitted) return {} as { nome?: string; cor_pin?: string }
    const e: { nome?: string; cor_pin?: string } = {}
    if (!draft.nome.trim()) e.nome = tc('form.required')
    if (!colorOk) e.cor_pin = tc('form.invalidColor')
    return e
  }, [submitted, draft.nome, colorOk, tc])

  const destinoOptions = locais.filter((l) => l.id !== draft.id)
  const waypointsElegiveis = waypoints.filter(
    (w) => w.local_id == null || w.local_id === draft.id,
  )
  const dialogTitle = draft.isNew ? t('localForm.new') : t('localForm.edit')

  function handleSave() {
    setSubmitted(true)
    if (!draft.nome.trim() || !colorOk) return
    onSave()
  }

  function patch(p: Partial<LocalFormDraft>) {
    if (submitted) {
      if (p.nome !== undefined || p.cor_pin !== undefined) {
        /* revalidate via submitted + draft */
      }
    }
    onChange(p)
  }

  return (
    <FormDrawer
      open
      title={dialogTitle}
      dirty={dirty}
      onClose={onCancel}
      onSave={handleSave}
    >
      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('localForm.identidade')}</h6>
        <div className="field">
          <label>{tc('form.nome')}</label>
          <Input
            value={draft.nome}
            onChange={(e) => patch({ nome: e.target.value })}
            aria-invalid={Boolean(errors.nome)}
          />
          {errors.nome ? <p className="field-error">{errors.nome}</p> : null}
        </div>
        <MarkdownField
          label={
            <>
              {tc('form.descricao')}{' '}
              <span className="text-muted">{t('localForm.descMarkdown')}</span>
            </>
          }
          value={draft.descricao}
          onChange={(descricao) => patch({ descricao })}
          placeholder={t('localForm.descPlaceholder')}
        />
        <div className="field">
          <label>{t('localForm.sessaoLabel')}</label>
          <Input
            value={draft.data_sessao}
            placeholder={t('localForm.sessaoPlaceholder')}
            onChange={(e) => patch({ data_sessao: e.target.value })}
          />
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={draft.visivel_para_todos}
              onChange={(e) => patch({ visivel_para_todos: e.target.checked })}
            />{' '}
            {t('localForm.visivelParaTodos')}
          </label>
          {!draft.visivel_para_todos ? (
            <p className="text-muted" role="status">
              {t('localForm.ocultoAosJogadores')}
            </p>
          ) : null}
        </div>
        <div className="field">
          <label>{t('localForm.arco')}</label>
          <Select
            value={draft.arco_id ?? ''}
            onChange={(e) =>
              patch({ arco_id: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">{t('localForm.nenhum')}</option>
            {arcos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.titulo}
              </option>
            ))}
          </Select>
        </div>
        <div className="field">
          <label htmlFor="local-cor-pin">{t('localForm.corPin')}</label>
          <div className="gm-row" style={{ alignItems: 'center', marginTop: 0 }}>
            <input
              id="local-cor-pin"
              type="color"
              value={colorOk ? draft.cor_pin : PIN_COLOR_KNOWN}
              onChange={(e) => patch({ cor_pin: e.target.value.toLowerCase() })}
              aria-label={t('localForm.corPinAria')}
            />
            <Button
              type="button"
              title={t('localForm.visitadoTitle')}
              onClick={() => patch({ cor_pin: PIN_COLOR_VISITED })}
            >
              {t('localForm.visitado')}
            </Button>
            <Button
              type="button"
              title={t('localForm.conhecidoTitle')}
              onClick={() => patch({ cor_pin: PIN_COLOR_KNOWN })}
            >
              {t('localForm.conhecido')}
            </Button>
          </div>
          {errors.cor_pin ? <p className="field-error">{errors.cor_pin}</p> : null}
        </div>
      </section>

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('localForm.imagem')}</h6>
        <ImageSlot
          src={draft.imagem_url}
          placeholder={t('localForm.imagemPlaceholder')}
          shape="rounded"
          editable
          category="locals"
          fit="contain"
          className={`local-form__image${draft.imagem_url ? '' : ' local-form__image--empty'}`}
          onUploaded={(url) => patch({ imagem_url: url })}
        />
      </section>

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('localForm.vinculos')}</h6>
        <div className="field">
          <label htmlFor="local-waypoint">{t('localForm.noRede')}</label>
          <Select
            id="local-waypoint"
            value={draft.waypoint_id ?? ''}
            onChange={(e) => {
              const wid = e.target.value ? Number(e.target.value) : null
              const wp = wid != null ? waypoints.find((w) => w.id === wid) : undefined
              patch({
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
          </Select>
        </div>
        <div className="field">
          <label>{t('localForm.npcsPresentes')}</label>
          <div className="gm-chips">
            {npcs.map((n) => {
              const on = draft.npc_ids.includes(n.id)
              return (
                <Chip
                  key={n.id}
                  variant={on ? 'accent' : 'outline'}
                  aria-pressed={on}
                  onClick={() =>
                    patch({
                      npc_ids: on
                        ? draft.npc_ids.filter((id) => id !== n.id)
                        : [...draft.npc_ids, n.id],
                    })
                  }
                >
                  {n.nome}
                </Chip>
              )
            })}
          </div>
        </div>
        <div className="field">
          <label>{t('localForm.saidas')}</label>
          <div className="gm-chips">
            {destinoOptions.length === 0 && (
              <span className="ui-card__meta">{t('localForm.cadastreLocais')}</span>
            )}
            {destinoOptions.map((loc) => {
              const on = draft.saida_ids.includes(loc.id)
              return (
                <Chip
                  key={loc.id}
                  variant={on ? 'accent' : 'outline'}
                  aria-pressed={on}
                  onClick={() =>
                    patch({
                      saida_ids: on
                        ? draft.saida_ids.filter((id) => id !== loc.id)
                        : [...draft.saida_ids, loc.id],
                    })
                  }
                >
                  {loc.nome}
                </Chip>
              )
            })}
          </div>
        </div>
      </section>

      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('localForm.posicao')}</h6>
        <p className="ui-card__meta">
          x {draft.x.toFixed(2)} · y {draft.y.toFixed(2)}{' '}
          {!draft.isNew && (
            <Button variant="ghost" type="button" onClick={onStartReposition}>
              {t('localForm.reposicionar')}
            </Button>
          )}
        </p>
      </section>
    </FormDrawer>
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
    visivel_para_todos: local.visivel_para_todos !== false,
    isNew: false,
  }
}
