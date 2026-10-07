import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { resolverWikilink } from '../data/mock'
import { IconLink, IconLinkOff } from '@tabler/icons-react'

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

/** Converte [[Nome]] / [[Nome|Rótulo]] em links markdown (wiki:Nome) antes do parse. */
function preprocess(src: string): string {
  return src.replace(WIKILINK_RE, (_m, nome: string, rotulo?: string) => {
    const label = (rotulo ?? nome).trim()
    const safeLabel = label.replace(/[[\]]/g, '')
    return `[${safeLabel}](wiki:${encodeURIComponent(nome.trim())})`
  })
}

export function WikiText({ children, className }: { children: string; className?: string }) {
  const processed = preprocess(children)
  return (
    <div className={`wiki-text ${className ?? ''}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children: linkChildren }) {
            if (href?.startsWith('wiki:')) {
              const nome = decodeURIComponent(href.slice('wiki:'.length))
              const ref = resolverWikilink(nome)
              if (ref) {
                return (
                  <Link to={ref.rota} className="wiki-link" title={`${labelTipo(ref.tipo)}: ${ref.nome}`}>
                    <IconLink size={12} aria-hidden className="wiki-link__icon" />
                    {linkChildren}
                  </Link>
                )
              }
              return (
                <span className="wiki-link wiki-link--broken" title="Referência não encontrada no codex">
                  <IconLinkOff size={12} aria-hidden className="wiki-link__icon" />
                  {linkChildren}
                </span>
              )
            }
            return (
              <a href={href} target="_blank" rel="noreferrer">
                {linkChildren}
              </a>
            )
          },
          blockquote({ children: bqChildren }) {
            return <CalloutOrQuote>{bqChildren}</CalloutOrQuote>
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

function labelTipo(tipo: string): string {
  const map: Record<string, string> = {
    personagem: 'Personagem',
    local: 'Local',
    faccao: 'Facção',
    item: 'Item',
    arco: 'Arco',
    capitulo: 'Capítulo',
    sessao: 'Sessão',
  }
  return map[tipo] ?? tipo
}

function CalloutOrQuote({ children }: { children: ReactNode }) {
  // react-markdown passa o texto como filhos de <p> dentro do blockquote;
  // numa prévia simples, apenas estilizamos como callout quando reconhecemos o padrão [!kind].
  return <blockquote className="wiki-callout">{children}</blockquote>
}
