import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconCheck, IconExternalLink, IconSparkles } from '@tabler/icons-react'
import { useCampaigns } from '../data/CampaignsStore'
import { CURRENT_MESTRE } from '../data/mock'
import type { Campaign } from '../data/types'
import { GENRES, type GenreId } from '../theme/genres'
import { useTheme } from '../theme/ThemeContext'
import './NovoCodexWizard.css'

const GENRE_GRADIENT: Record<GenreId, string> = {
  fantasia: 'linear-gradient(135deg, #2c2415 0%, #191610 60%, #0f0d09 100%)',
  gotico: 'linear-gradient(135deg, #2c1417 0%, #191011 60%, #0d0809 100%)',
  scifi: 'linear-gradient(135deg, #142a2d 0%, #101719 60%, #090e10 100%)',
  urbano: 'linear-gradient(135deg, #1a2530 0%, #101419 60%, #0a0d10 100%)',
}

function slugify(v: string) {
  return v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const STEPS = ['Identidade', 'Sistema e gênero', 'Visibilidade', 'Revisão'] as const

export function NovoCodexWizard() {
  const navigate = useNavigate()
  const { addCampaign, getBySlug } = useCampaigns()
  const { genre, setGenre } = useTheme()
  const previousGenre = genre

  const [step, setStep] = useState(0)
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [resumo, setResumo] = useState('')
  const [sistema, setSistema] = useState('')
  const [genero, setGenero] = useState<GenreId>('fantasia')
  const [visibilidade, setVisibilidade] = useState<'listada' | 'so_link'>('listada')
  const [created, setCreated] = useState<Campaign | null>(null)
  const [slugError, setSlugError] = useState('')

  useEffect(() => { setGenre(genero) }, [genero, setGenre])
  useEffect(() => () => { setGenre(previousGenre) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function onNomeChange(v: string) {
    setNome(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  function canAdvance(): boolean {
    if (step === 0) return nome.trim().length > 1 && slug.trim().length > 1
    if (step === 1) return sistema.trim().length > 1
    return true
  }

  function next() {
    if (step === 0 && getBySlug(slug)) { setSlugError('Já existe um codex com esse endereço. Escolha outro.'); return }
    setSlugError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function handleCreate() {
    const c: Campaign = {
      slug, nome: nome.trim(), sistema: sistema.trim(), genero, mestre: CURRENT_MESTRE.nome, visibilidade,
      capaGradient: GENRE_GRADIENT[genero], resumo: resumo.trim() || 'Uma nova campanha, pronta para o primeiro capítulo.',
      jogadores: 0, ultimaSessao: 'ainda não começou', cotaUsadaGb: 0, cotaTotalGb: 10,
      arcos: [{ id: 'arco-1', titulo: 'Primeiro arco', resumo: '', ordem: 1, visivelParaTodos: true }],
      locais: [], personagens: [], vinculos: [], waypoints: [], edges: [], sessoes: [],
      grupo: { x: 0.5, y: 0.5 },
    }
    addCampaign(c)
    setCreated(c)
  }

  if (created) {
    return (
      <div className="wizard-page">
        <div className="wizard-page__success card">
          <div className="icon-btn icon-btn-accent" style={{ width: 56, height: 56, pointerEvents: 'none', margin: '0 auto 14px' }}>
            <IconCheck size={26} aria-hidden />
          </div>
          <h1 style={{ textAlign: 'center', margin: '0 0 6px' }}>{created.nome} está no ar</h1>
          <p className="text-2" style={{ textAlign: 'center' }}>
            Jogadores já podem abrir <code>/c/{created.slug}</code>. Comece adicionando o primeiro local ou personagem.
          </p>
          <div className="row gap-2" style={{ justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <Link to={`/c/${created.slug}`} className="btn btn-primary btn-lg">
              Abrir campanha <IconExternalLink size={16} aria-hidden />
            </Link>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/painel')}>Ir para o painel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wizard-page">
      <div className="wizard-page__shell">
        <div className="wizard-page__steps">
          {STEPS.map((label, i) => (
            <div key={label} className={`wizard-page__step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}>
              <span className="wizard-page__step-dot">{i < step ? <IconCheck size={12} aria-hidden /> : i + 1}</span>
              {label}
            </div>
          ))}
        </div>

        <div className="card wizard-page__card">
          {step === 0 && (
            <div className="stack gap-1">
              <h2 style={{ margin: 0 }}>Como sua campanha se chama?</h2>
              <p className="text-2">Isso vira o nome do codex e o endereço que você compartilha com o grupo.</p>
              <div className="field" style={{ marginTop: 8 }}>
                <label htmlFor="w-nome">Nome da campanha</label>
                <input id="w-nome" className="input" value={nome} onChange={(e) => onNomeChange(e.target.value)} placeholder="Ex.: As Crônicas de Aldenor" autoFocus />
              </div>
              <div className="field">
                <label htmlFor="w-slug">Endereço (não pode ser alterado depois)</label>
                <div className="row gap-1" style={{ alignItems: 'center' }}>
                  <span className="text-3">/c/</span>
                  <input
                    id="w-slug" className="input" value={slug}
                    onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); setSlugError('') }}
                  />
                </div>
                {slugError && <span className="field-hint" style={{ color: 'var(--color-danger)' }}>{slugError}</span>}
              </div>
              <div className="field">
                <label htmlFor="w-resumo">Resumo curto (opcional)</label>
                <textarea id="w-resumo" className="textarea" value={resumo} onChange={(e) => setResumo(e.target.value)} placeholder="Uma frase para os jogadores entenderem do que se trata." />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="stack gap-1">
              <h2 style={{ margin: 0 }}>Sistema e gênero</h2>
              <p className="text-2">O gênero define as cores e a sensação de toda a interface desta campanha — mude e veja em tempo real.</p>
              <div className="field" style={{ marginTop: 8 }}>
                <label htmlFor="w-sistema">Sistema de RPG</label>
                <input id="w-sistema" className="input" list="sistemas-sugeridos" value={sistema} onChange={(e) => setSistema(e.target.value)} placeholder="Ex.: WFRP 4e, D&D 5e, Vampiro…" />
                <datalist id="sistemas-sugeridos">
                  {GENRES.flatMap((g) => g.suggestedSystems).map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="field">
                <label>Gênero</label>
                <div className="wizard-page__genre-grid">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`wizard-page__genre-card${genero === g.id ? ' is-active' : ''}`}
                      onClick={() => setGenero(g.id)}
                    >
                      <span className="wizard-page__genre-swatch" style={{ background: g.swatch }} />
                      <span style={{ fontWeight: 700, fontSize: 13.5 }}>{g.label}</span>
                      <span className="text-3" style={{ fontSize: 11.5 }}>{g.tagline}</span>
                    </button>
                  ))}
                </div>
                <span className="field-hint row gap-1" style={{ marginTop: 8 }}><IconSparkles size={13} aria-hidden /> A tela inteira já está usando o tema escolhido.</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stack gap-1">
              <h2 style={{ margin: 0 }}>Quem pode ver esta campanha?</h2>
              <p className="text-2">Você pode mudar isso depois, a qualquer momento.</p>
              <div className="stack gap-2" style={{ marginTop: 8 }}>
                <label className={`wizard-page__radio-card${visibilidade === 'listada' ? ' is-active' : ''}`}>
                  <input type="radio" name="vis" checked={visibilidade === 'listada'} onChange={() => setVisibilidade('listada')} />
                  <div>
                    <strong>Listada</strong>
                    <p className="text-3" style={{ margin: '2px 0 0' }}>Aparece em /explorar para qualquer jogador encontrar.</p>
                  </div>
                </label>
                <label className={`wizard-page__radio-card${visibilidade === 'so_link' ? ' is-active' : ''}`}>
                  <input type="radio" name="vis" checked={visibilidade === 'so_link'} onChange={() => setVisibilidade('so_link')} />
                  <div>
                    <strong>Só por link</strong>
                    <p className="text-3" style={{ margin: '2px 0 0' }}>Só quem recebe o link direto consegue abrir.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="stack gap-1">
              <h2 style={{ margin: 0 }}>Revise antes de criar</h2>
              <div className="card" style={{ padding: 14, marginTop: 8, background: 'var(--color-surface-2)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="badge badge-accent">{sistema || 'Sistema não definido'}</span>
                  <span className="badge">{visibilidade === 'listada' ? 'Listada' : 'Só por link'}</span>
                </div>
                <h3 style={{ margin: '8px 0 2px' }}>{nome || 'Sem nome'}</h3>
                <p className="text-3" style={{ margin: 0 }}>/c/{slug || 'sem-endereco'}</p>
                {resumo && <p className="text-2" style={{ marginTop: 8 }}>{resumo}</p>}
                <div className="row gap-2" style={{ marginTop: 10 }}>
                  <span className="wizard-page__genre-swatch" style={{ background: GENRES.find((g) => g.id === genero)?.swatch }} />
                  <span className="text-2">{GENRES.find((g) => g.id === genero)?.label}</span>
                </div>
              </div>
            </div>
          )}

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={() => (step === 0 ? navigate('/painel') : setStep((s) => s - 1))}>
              <IconArrowLeft size={15} aria-hidden /> {step === 0 ? 'Cancelar' : 'Voltar'}
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" disabled={!canAdvance()} onClick={next}>
                Continuar <IconArrowRight size={15} aria-hidden />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Criar codex</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
