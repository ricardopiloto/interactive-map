import { useState } from 'react'
import type { Arco } from '../../data/types'
import { Modal } from '../common/Modal'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { arcoCopy as c } from './arcoCopy'

export function ArcoManagerPanel({ open, onClose, arcos, onChange }: {
  open: boolean; onClose: () => void; arcos: Arco[]; onChange: (arcos: Arco[]) => void
}) {
  const [draft, setDraft] = useState<Arco | null>(null)
  const [pending, setPending] = useState<Arco | null>(null)
  const sorted = [...arcos].sort((a, b) => a.ordem - b.ordem)
  function save() {
    if (!draft?.titulo.trim()) return
    onChange(draft.id ? arcos.map((a) => a.id === draft.id ? draft : a) : [...arcos, { ...draft, id: `arco-${Date.now()}`, ordem: arcos.length + 1 }])
    setDraft(null)
  }
  return <>
    <Modal open={open} onClose={onClose} title={c('title')}>
      <button className="btn btn-primary" onClick={() => setDraft({ id: '', titulo: '', resumo: '', ordem: arcos.length + 1, visivelParaTodos: true })}>{c('add')}</button>
      {sorted.length === 0 && <p>{c('empty')}</p>}
      <div className="stack gap-2" style={{ marginTop: 12 }}>
        {sorted.map((a) => <article key={a.id} className="card" style={{ padding: 12 }}>
          <strong>{a.titulo}</strong> {!a.visivelParaTodos && <span className="badge">{c('hidden')}</span>}
          <p className="text-3">{a.resumo}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setDraft(a)}>Editar</button>
          <button className="btn btn-ghost btn-sm" aria-label={`Mover ${a.titulo} para cima`} disabled={sorted.indexOf(a) === 0} onClick={() => {
            const index = sorted.indexOf(a)
            if (index < 1) return
            const previous = sorted[index - 1]
            onChange(arcos.map((item) => item.id === a.id ? { ...item, ordem: previous.ordem } : item.id === previous.id ? { ...item, ordem: a.ordem } : item))
          }}>↑</button>
          <button className="btn btn-ghost btn-sm" aria-label={`Mover ${a.titulo} para baixo`} disabled={sorted.indexOf(a) === sorted.length - 1} onClick={() => {
            const index = sorted.indexOf(a)
            const next = sorted[index + 1]
            if (!next) return
            onChange(arcos.map((item) => item.id === a.id ? { ...item, ordem: next.ordem } : item.id === next.id ? { ...item, ordem: a.ordem } : item))
          }}>↓</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPending(a)}>{c('delete')}</button>
        </article>)}
      </div>
    </Modal>
    <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? 'Editar arco' : c('add')} footer={<><button className="btn btn-ghost" onClick={() => setDraft(null)}>Cancelar</button><button className="btn btn-primary" onClick={save}>Salvar</button></>}>
      <label className="field">{c('name')}<input className="input" value={draft?.titulo ?? ''} onChange={(e) => setDraft(draft ? { ...draft, titulo: e.target.value } : null)} /></label>
      <label className="field">{c('summary')}<textarea className="textarea" value={draft?.resumo ?? ''} onChange={(e) => setDraft(draft ? { ...draft, resumo: e.target.value } : null)} /></label>
      <label><input type="checkbox" checked={draft?.visivelParaTodos ?? true} onChange={(e) => setDraft(draft ? { ...draft, visivelParaTodos: e.target.checked } : null)} /> {c('visible')}</label>
    </Modal>
    <ConfirmDialog open={pending !== null} title={c('delete')} message={c('warning')} danger onCancel={() => setPending(null)} onConfirm={() => { if (pending) onChange(arcos.filter((a) => a.id !== pending.id)); setPending(null) }} />
  </>
}
