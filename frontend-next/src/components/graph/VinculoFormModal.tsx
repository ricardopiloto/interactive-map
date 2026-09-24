import { useEffect, useState } from 'react'
import { Modal } from '../common/Modal'
import type { Personagem, Vinculo, VinculoFamilia, VinculoTipo } from '../../data/types'

interface VinculoFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Vinculo, 'id'>) => void
  personagens: Personagem[]
  defaultAId?: string | null
}

const TIPOS_BY_FAMILIA: Record<VinculoFamilia, { value: VinculoTipo; label: string }[]> = {
  afinidade: [{ value: 'aliado', label: 'Aliado' }, { value: 'amizade', label: 'Amizade' }],
  laco: [{ value: 'romance', label: 'Romance' }, { value: 'familia', label: 'Família' }, { value: 'vinculo_sangue', label: 'Vínculo de sangue' }],
  hostil: [{ value: 'inimizade', label: 'Inimizade' }, { value: 'adversario', label: 'Adversário' }],
  neutro: [{ value: 'conhecido', label: 'Conhecido' }],
}

export function VinculoFormModal({ open, onClose, onSave, personagens, defaultAId }: VinculoFormModalProps) {
  const [aId, setAId] = useState('')
  const [bId, setBId] = useState('')
  const [familia, setFamilia] = useState<VinculoFamilia>('afinidade')
  const [tipo, setTipo] = useState<VinculoTipo>('aliado')
  const [qualificador, setQualificador] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setAId(defaultAId ?? personagens[0]?.id ?? '')
    setBId(personagens.find((p) => p.id !== defaultAId)?.id ?? '')
    setFamilia('afinidade'); setTipo('aliado'); setQualificador(''); setNota(''); setError('')
  }, [open, defaultAId, personagens])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (aId === bId) { setError('Escolha dois personagens diferentes.'); return }
    onSave({ aId, bId, familia, tipo, qualificador: qualificador || undefined, nota: nota || undefined })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Novo vínculo"
      title="Conectar dois personagens"
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" form="vinculo-form" className="btn btn-primary">Salvar</button>
      </>}
    >
      <form id="vinculo-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>De</label>
            <select className="select" value={aId} onChange={(e) => setAId(e.target.value)}>
              {personagens.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Para</label>
            <select className="select" value={bId} onChange={(e) => setBId(e.target.value)}>
              {personagens.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
        </div>
        {error && <span className="field-hint" style={{ color: 'var(--color-danger)' }}>{error}</span>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
          <div className="field">
            <label>Família</label>
            <select
              className="select" value={familia}
              onChange={(e) => { const f = e.target.value as VinculoFamilia; setFamilia(f); setTipo(TIPOS_BY_FAMILIA[f][0].value) }}
            >
              <option value="afinidade">Afinidade</option>
              <option value="laco">Laço</option>
              <option value="hostil">Hostil</option>
              <option value="neutro">Neutro</option>
            </select>
          </div>
          <div className="field">
            <label>Tipo</label>
            <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value as VinculoTipo)}>
              {TIPOS_BY_FAMILIA[familia].map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="v-qual">Qualificador (opcional)</label>
          <input id="v-qual" className="input" value={qualificador} onChange={(e) => setQualificador(e.target.value)} placeholder="Ex.: Mentor, Dívida" />
        </div>
        <div className="field">
          <label htmlFor="v-nota">Nota (opcional)</label>
          <textarea id="v-nota" className="textarea" value={nota} onChange={(e) => setNota(e.target.value)} />
        </div>
      </form>
    </Modal>
  )
}
