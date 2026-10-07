import { Link } from 'react-router-dom'
import { IconArrowRight, IconAlertTriangle, IconCalendarEvent } from '@tabler/icons-react'
import { arcos, capitulos, sessoes, campanha, personagens } from '../data/mock'
import { Card, SectionTitle, Badge, Pill } from '../components/ui'

export function Dashboard() {
  const pendentes = capitulos.filter((c) => !c.preparado)
  const ultimasSessoes = [...sessoes].sort((a, b) => b.numero - a.numero).slice(0, 3)
  const pjs = personagens.filter((p) => p.tipo === 'pj')

  return (
    <div className="page page--dashboard">
      <section className="hero-card">
        <div>
          <p className="hero-card__eyebrow">
            <IconCalendarEvent size={14} aria-hidden /> Próxima sessão
          </p>
          <h2>
            Sessão {campanha.proximaSessao.numero} ·{' '}
            {new Date(campanha.proximaSessao.data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
            })}
          </h2>
          <p className="hero-card__body">
            {pendentes.length > 0
              ? `${pendentes.length} capítulo(s) ainda não preparados antes da próxima mesa.`
              : 'Tudo preparado para a próxima mesa.'}
          </p>
        </div>
        <Link to="/prep" className="hero-card__cta">
          Ir para preparação <IconArrowRight size={16} aria-hidden />
        </Link>
      </section>

      <div className="dashboard-grid">
        <Card className="dashboard-block">
          <SectionTitle
            action={
              <Link to="/prep" className="link-quiet">
                ver tudo
              </Link>
            }
          >
            Arcos em andamento
          </SectionTitle>
          <div className="arco-progress-list">
            {arcos.map((arco) => {
              const caps = capitulos.filter((c) => c.arcoId === arco.id)
              const feitos = caps.filter((c) => c.preparado).length
              const pct = caps.length ? Math.round((feitos / caps.length) * 100) : 0
              return (
                <Link to="/prep" key={arco.id} className="arco-progress">
                  <div className="arco-progress__head">
                    <Pill cor={arco.cor}>{arco.titulo}</Pill>
                    <span className="arco-progress__count">
                      {feitos}/{caps.length} capítulos
                    </span>
                  </div>
                  <div className="arco-progress__bar">
                    <div
                      className="arco-progress__fill"
                      style={{ width: `${pct}%`, background: arco.cor }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="dashboard-block">
          <SectionTitle>
            <IconAlertTriangle size={16} aria-hidden style={{ marginRight: 6, verticalAlign: -2 }} />
            Pendentes de preparo
          </SectionTitle>
          {pendentes.length === 0 ? (
            <p className="text-muted">Nenhum capítulo pendente — boa!</p>
          ) : (
            <ul className="pending-list">
              {pendentes.map((c) => (
                <li key={c.id}>
                  <Link to={`/prep/${c.id}`}>{c.titulo}</Link>
                  <Badge tone="warning">rascunho</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="dashboard-block">
          <SectionTitle
            action={
              <Link to="/sessoes" className="link-quiet">
                ver tudo
              </Link>
            }
          >
            Crônica recente
          </SectionTitle>
          <ul className="recent-list">
            {ultimasSessoes.map((s) => (
              <li key={s.id}>
                <Link to="/sessoes">
                  <strong>Sessão {s.numero}</strong> · {s.titulo}
                </Link>
                <span className="text-muted">
                  {new Date(s.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="dashboard-block">
          <SectionTitle
            action={
              <Link to="/codex" className="link-quiet">
                ver tudo
              </Link>
            }
          >
            Personagens jogadores
          </SectionTitle>
          <div className="pj-chip-list">
            {pjs.map((p) => (
              <Link to={`/codex/personagens/${p.id}`} key={p.id} className="pj-chip">
                <span className="pj-chip__dot" style={{ background: p.corRetrato }} />
                {p.nome}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
