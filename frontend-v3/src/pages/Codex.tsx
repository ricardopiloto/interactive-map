import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  IconUser,
  IconMapPin,
  IconFlag,
  IconBox,
  IconEyeOff,
  IconSearch,
} from '@tabler/icons-react'
import {
  personagens,
  locais,
  faccoes,
  itens,
  backlinksPara,
  vinculosDe,
  ROTULOS_VINCULO,
  type Personagem,
  type Local,
  type Faccao,
  type Item,
} from '../data/mock'
import { Avatar, Badge, EmptyState, StatTable } from '../components/ui'
import { WikiText } from '../components/WikiText'

type Tipo = 'personagens' | 'locais' | 'faccoes' | 'itens'

const TABS: { id: Tipo; label: string; icon: typeof IconUser }[] = [
  { id: 'personagens', label: 'Personagens', icon: IconUser },
  { id: 'locais', label: 'Locais', icon: IconMapPin },
  { id: 'faccoes', label: 'Facções', icon: IconFlag },
  { id: 'itens', label: 'Itens', icon: IconBox },
]

export function Codex({ gmMode }: { gmMode: boolean }) {
  const params = useParams<{ tipo?: string; id?: string }>()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const tipo: Tipo = (params.tipo as Tipo) ?? 'personagens'

  const listaBruta = useMemo(() => {
    switch (tipo) {
      case 'personagens':
        return personagens
      case 'locais':
        return locais
      case 'faccoes':
        return faccoes
      case 'itens':
        return itens
      default:
        return personagens
    }
  }, [tipo])

  const lista = useMemo(() => {
    const visivel = gmMode
      ? listaBruta
      : listaBruta.filter((item) => (item as { visivelParaTodos?: boolean }).visivelParaTodos !== false)
    const q = query.trim().toLowerCase()
    if (!q) return visivel
    return visivel.filter((item) => item.nome.toLowerCase().includes(q))
  }, [listaBruta, gmMode, query])

  const selecionado = params.id ? listaBruta.find((item) => item.id === params.id) : lista[0]

  return (
    <div className="page page--codex">
      <div className="codex-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`codex-tab${tipo === tab.id ? ' codex-tab--active' : ''}`}
            onClick={() => navigate(`/codex/${tab.id}`)}
          >
            <tab.icon size={16} aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="codex-layout">
        <div className="codex-list-panel">
          <div className="codex-search">
            <IconSearch size={14} aria-hidden />
            <input
              placeholder={`Buscar em ${TABS.find((t) => t.id === tipo)?.label.toLowerCase()}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="codex-list">
            {lista.length === 0 ? (
              <EmptyState title="Nada encontrado" />
            ) : (
              lista.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`codex-list__item${selecionado?.id === item.id ? ' codex-list__item--active' : ''}`}
                  onClick={() => navigate(`/codex/${tipo}/${item.id}`)}
                >
                  {tipo === 'personagens' ? (
                    <Avatar iniciais={(item as Personagem).iniciais} cor={(item as Personagem).corRetrato} size={28} />
                  ) : (
                    <span
                      className="codex-list__dot"
                      style={{ background: (item as Local).corPin ?? (item as Faccao).corAccent ?? '#888' }}
                    />
                  )}
                  <span className="codex-list__name">{item.nome}</span>
                  {(item as { visivelParaTodos?: boolean }).visivelParaTodos === false ? (
                    <IconEyeOff size={13} aria-hidden className="text-muted" />
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="codex-detail-panel">
          {!selecionado ? (
            <EmptyState title="Selecione um item" body="Escolha algo na lista à esquerda." />
          ) : tipo === 'personagens' ? (
            <PersonagemDetail item={selecionado as Personagem} gmMode={gmMode} />
          ) : tipo === 'locais' ? (
            <GenericDetail item={selecionado as Local} />
          ) : tipo === 'faccoes' ? (
            <GenericDetail item={selecionado as Faccao} />
          ) : (
            <GenericDetail item={selecionado as Item} />
          )}
        </div>
      </div>
    </div>
  )
}

function PersonagemDetail({ item, gmMode }: { item: Personagem; gmMode: boolean }) {
  const backlinks = backlinksPara(item.nome)
  const relacoes = vinculosDe(item.id)
  return (
    <article className="detail">
      <header className="detail__header">
        <Avatar iniciais={item.iniciais} cor={item.corRetrato} size={56} />
        <div>
          <h2>{item.nome}</h2>
          <p className="text-muted">{item.papel}</p>
          <div className="detail__badges">
            <Badge tone={item.tipo === 'pj' ? 'accent' : 'neutral'}>{item.tipo === 'pj' ? 'PJ' : 'NPC'}</Badge>
            <Badge tone={statusTone(item.status)}>{item.status}</Badge>
            {item.visivelParaTodos === false ? <Badge tone="warning">oculto dos jogadores</Badge> : null}
          </div>
        </div>
      </header>

      {gmMode && item.statBlock ? (
        <section className="detail__section">
          <h3>Ficha (WFRP)</h3>
          <StatTable
            fields={[
              { rotulo: 'CA', valor: item.statBlock.ca },
              { rotulo: 'HPr', valor: item.statBlock.hpr },
              { rotulo: 'FOR', valor: item.statBlock.for },
              { rotulo: 'RES', valor: item.statBlock.res },
              { rotulo: 'IN', valor: item.statBlock.ini },
              { rotulo: 'AG', valor: item.statBlock.ag },
              { rotulo: 'DES', valor: item.statBlock.des },
              { rotulo: 'INT', valor: item.statBlock.int },
              { rotulo: 'VON', valor: item.statBlock.von },
              { rotulo: 'CAM', valor: item.statBlock.cam },
            ]}
          />
          {item.statBlock.pericias?.length ? (
            <p>
              <strong>Perícias:</strong> {item.statBlock.pericias.join(', ')}
            </p>
          ) : null}
          {item.statBlock.talentos?.length ? (
            <p>
              <strong>Talentos:</strong> {item.statBlock.talentos.join(', ')}
            </p>
          ) : null}
          {item.statBlock.pertences?.length ? (
            <p>
              <strong>Pertences:</strong> {item.statBlock.pertences.join(', ')}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="detail__section">
        <h3>Narrativa</h3>
        <WikiText>{item.descricao}</WikiText>
      </section>

      {relacoes.length > 0 ? (
        <section className="detail__section">
          <h3>Relações</h3>
          <ul className="relation-list">
            {relacoes.map(({ vinculo, outro }) => (
              <li key={vinculo.id}>
                <Avatar iniciais={outro.iniciais} cor={outro.corRetrato} size={24} />
                <span>{outro.nome}</span>
                <Badge tone="neutral">{ROTULOS_VINCULO[vinculo.tipo]}</Badge>
                {vinculo.qualificador ? <span className="text-muted">{vinculo.qualificador}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {backlinks.length > 0 ? (
        <section className="detail__section">
          <h3>Mencionado em</h3>
          <ul className="backlink-list">
            {backlinks.map((b) => (
              <li key={`${b.origem.tipo}-${b.origem.id}`}>
                <Link to={b.origem.rota}>{b.origem.nome}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}

function GenericDetail({ item }: { item: Local | Faccao | Item }) {
  const backlinks = backlinksPara(item.nome)
  return (
    <article className="detail">
      <header className="detail__header">
        <div>
          <h2>{item.nome}</h2>
          {'tipo' in item ? <Badge tone="neutral">{item.tipo}</Badge> : null}
          {'visivelParaTodos' in item && item.visivelParaTodos === false ? (
            <Badge tone="warning">oculto dos jogadores</Badge>
          ) : null}
        </div>
      </header>
      <section className="detail__section">
        <WikiText>{item.descricao}</WikiText>
      </section>
      {backlinks.length > 0 ? (
        <section className="detail__section">
          <h3>Mencionado em</h3>
          <ul className="backlink-list">
            {backlinks.map((b) => (
              <li key={`${b.origem.tipo}-${b.origem.id}`}>
                <Link to={b.origem.rota}>{b.origem.nome}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}

function statusTone(status: Personagem['status']): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'vivo') return 'success'
  if (status === 'morto') return 'danger'
  if (status === 'desaparecido') return 'warning'
  return 'neutral'
}
