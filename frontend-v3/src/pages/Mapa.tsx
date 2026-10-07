import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconMapPin } from '@tabler/icons-react'
import { locais, arcos } from '../data/mock'
import { WikiText } from '../components/WikiText'
import { Badge, EmptyState } from '../components/ui'

export function Mapa({ gmMode }: { gmMode: boolean }) {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(locais[0]?.id ?? null)
  const pontos = gmMode ? locais : locais.filter((l) => l.visivelParaTodos)
  const selecionado = pontos.find((l) => l.id === selecionadoId) ?? null

  return (
    <div className="page page--mapa">
      <div className="mapa-canvas">
        <svg className="mapa-canvas__bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <radialGradient id="mapaGlow" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="var(--bg-elevated)" />
              <stop offset="100%" stopColor="var(--bg-sunken)" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#mapaGlow)" />
          <path
            d="M10,70 Q30,55 45,62 T75,58 T95,68"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M15,20 Q35,35 40,55 T48,68"
            stroke="var(--accent)"
            strokeWidth="0.3"
            fill="none"
            opacity="0.35"
            strokeDasharray="1.5 1.2"
          />
        </svg>

        {pontos.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`mapa-pin${selecionadoId === l.id ? ' mapa-pin--active' : ''}`}
            style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%`, color: l.corPin }}
            onClick={() => setSelecionadoId(l.id)}
            title={l.nome}
          >
            <IconMapPin size={l.tipo === 'cidade' ? 26 : 20} fill={l.corPin} stroke="var(--bg)" strokeWidth={1.2} />
            <span className="mapa-pin__label">{l.nome}</span>
          </button>
        ))}
      </div>

      <aside className="mapa-side">
        {!selecionado ? (
          <EmptyState title="Clique num ponto do mapa" />
        ) : (
          <article className="detail">
            <header className="detail__header">
              <div>
                <h2>{selecionado.nome}</h2>
                <Badge tone="neutral">{selecionado.tipo}</Badge>
                {selecionado.arcoId ? (
                  <Badge tone="accent">{arcos.find((a) => a.id === selecionado.arcoId)?.titulo}</Badge>
                ) : null}
              </div>
            </header>
            <section className="detail__section">
              <WikiText>{selecionado.descricao}</WikiText>
            </section>
            <Link to={`/codex/locais/${selecionado.id}`} className="link-quiet">
              Ver no Codex →
            </Link>
          </article>
        )}
      </aside>
    </div>
  )
}
