# Design

## Context

O site é uma SPA React 19 (Vite) servida pelo contêiner `web` (nginx por dentro, só arquivos estáticos) atrás do **Caddy do host**, que também encaminha `/api/*` e `/uploads/*` para a API; a Cloudflare (túnel) fica na frente de tudo e serve o `robots.txt` com o seu bloco gerenciado seguido do `frontend-v2/public/robots.txt`. Os snippets do Caddy em `deploy/Caddyfile` (upstreams `api:8000` e `web:80`) e `deploy/snippets/caddy.site.tpl` (upstreams `127.0.0.1:__PORTA_API__` e `__PORTA_WEB__`) são colados à mão pelo usuário. Ver proposal.md para o diagnóstico.

O que o código mostra:
- `index.html` tem `<title>Campaign Codex</title>` e `lang="pt-BR"` fixos e nenhuma descrição; **nada atualiza `<html lang>`**; nenhuma página define título ou meta.
- Rotas da campanha em `campaignRoutes.tsx`: `mapa`, `relacoes`, `rota`, `sessoes`, `cronologia` **e** `linha-do-tempo` (alias duplicado), `itens`, `ferramentas` e `fios` (só do mestre). A raiz `/c/:id/:slug` é um `Navigate` do cliente. `/__styleguide` só existe em desenvolvimento.
- `Campanha` (control.db) tem `visibilidade`, `activa`, `modificado_em`, `mapa_arquivo`. `CampaignLayout` mostra um estado "carregando" enquanto `GET /api/c/{slug}/config` não responde.
- O contato tem uma verificação de disponibilidade privada em `routers/contato.py` (`_sender()`); `GET /api/c/{slug}/config` calcula `has_map_image`.

## Goals / Non-Goals

**Goals:**
- Metadados corretos por página e um sitemap real.
- Nada privado e nenhuma campanha não autorizada indexados, com padrão **fechado**.
- O mestre decide, campanha a campanha, e o padrão é "não".

**Non-Goals:**
- Open Graph, Twitter cards, JSON-LD, SSR/pré-renderização, `hreflang`, AMP, Analytics.
- Controlar o que o Google já indexou (isso é feito no Search Console; o runbook explica).

## Decisions

1. **Estratégia de robots: HTML estático indexável, `noindex` onde for preciso, padrão fechado nas campanhas.** O Google avisa que não deve haver `noindex` no HTML inicial para depois removê-lo por JavaScript (pode nem renderizar). Por isso o `index.html` nunca leva `noindex`; o `noindex` vem (a) por cabeçalho `X-Robots-Tag` do Caddy nas páginas privadas e na API e (b) por `<meta name="robots">` colocada pelo JavaScript. Nas páginas `/c/*` a meta começa **sempre em `noindex`** (primeiro render, enquanto a config carrega, e se a campanha falhar) e só vira `index` quando `config.indexavel` (efetivo) é verdadeiro e a página está na lista indexável. *Alternativas:* `noindex` estático no `index.html` (arrisca bloquear tudo); `Disallow` no `robots.txt` (o Google não vê o `noindex` e a API precisa ser buscável para renderizar); `forward_auth` do Caddy para um `X-Robots-Tag` por campanha — **descartado**: uma ida à API em cada carregamento de `/c/*`, e a página passa a depender da disponibilidade da API.

2. **Regra única "campanha indexável".** `campanha_indexavel(c) = c.activa and c.visibilidade == "listada" and c.indexavel`, numa função usada pelo sitemap e pela config. A coluna guarda a **escolha** do mestre (preservada se a visibilidade mudar); o efeito é calculado. `InstanceConfigRead.indexavel` devolve o valor **efetivo** (é o que o frontend usa para `index`/`noindex`); `PainelItem.indexavel` devolve a **escolha guardada** (para o interruptor), e o Painel desativa o interruptor quando a visibilidade é "só com link".

3. **Dado e API.** Coluna `indexavel BOOLEAN NOT NULL DEFAULT 0` em `campanha`, migração `010` do control DB (todas as existentes ficam falsas). `PATCH /api/campanhas/{slug}/indexacao` com `{indexavel: bool}`, exige o dono (`require_dono`), atualiza `modificado_em`, no mesmo desenho de `set_visibilidade`. A indexação não entra no pacote de exportação (é uma configuração da instância, como a visibilidade); uma campanha importada nasce com a indexação desligada.

4. **Sitemap sem `lastmod`.** `GET /sitemap.xml` na raiz do app (como as rotas `/uploads` legadas), handler `def`, sem autenticação, XML com `xml.etree.ElementTree` (escape correto), `Cache-Control: public, max-age=3600`, base absoluta de `PUBLIC_BASE_URL` (com ou sem barra final). Conteúdo: institucionais fixas (`/`, `/explorar`, `/termos`, `/privacidade`) e `/contato` quando o contato está disponível; **sem `/registo`** (formulário de conta, vai `noindex`). Por campanha indexável: `/c/{id}/{slug}/relacoes`, `/sessoes`, `/linha-do-tempo`, `/itens` e `/mapa` quando há imagem de mapa; `/rota`, `/ferramentas` e `/fios` ficam de fora. **Não há `lastmod`**: `campaign_state.modificado_em` muda a cada gravação, inclusive de notas e sessões ocultas, e publicá-lo exporia quando o mestre trabalha em conteúdo privado; o Google já ignora `lastmod` pouco confiável e o ganho seria pequeno. Sem `lastmod`, o sitemap lê só a tabela `campanha` do control.db (sem abrir o banco de cada campanha), então a rota é barata e não precisa de cache em processo. Para o `/contato` e o `has_map_image`, usam-se funções públicas em `services/` extraídas de onde hoje vivem (a disponibilidade do contato, em `routers/contato.py`, e o critério de `mapa_arquivo`), para o sitemap e as páginas não divergirem. Registra um log INFO com o número de campanhas listadas. Limite do protocolo: 50 000 URLs por arquivo (5 por campanha); ponto de revisão nas dezenas de milhares de campanhas.

5. **SEO centralizado no frontend.** Um componente `SeoRouter`, montado uma vez dentro do `BrowserRouter`, usa `useLocation` e uma **tabela de rotas** (rota → chave i18n do título e da descrição, e `index`/`noindex`) para todas as páginas que não são de campanha. O `CampaignLayout` completa o que depende da config (nome da campanha no título, `id`/`slug` no canônico, `indexavel` efetivo, estado carregando/falha). Cada rota tem **um só dono** dos metadados (ou o `SeoRouter` ou o `CampaignLayout`), o que evita disputa de `canonical` e `robots`. A primitiva é o hook imperativo `useSeo({title, description, canonical, robots})`: atualiza `document.title`, cria/atualiza (com `data-seo`) `meta[name=description]`, `link[rel=canonical]` e `meta[name=robots]` e remove o que criou ao desmontar, de forma idempotente sob o `React.StrictMode` (efeito executado duas vezes em desenvolvimento) e sem piscar entre páginas. Motivo do hook imperativo em vez dos `<title>`/`<meta>` do React 19: o `index.html` já tem um `<title>` estático e o React 19 só **acrescenta** outro ao `<head>`; `document.title` devolve o primeiro, então o título não mudaria. O `index.html` ganha uma descrição padrão (para quem não executa JavaScript) e mantém o título estático. **`<html lang>`** é atualizado uma vez no módulo de i18n (inicialização e evento `languageChanged`), não por página. O canônico absoluto usa `window.location.origin`, com a **premissa de um só hostname público** (`campaign-codex.1nodado.com.br`): outros nomes que sirvam o app devem redirecionar para ele no Caddy (anotado no runbook). A mesma lista de rotas da tabela alimenta o teste de sincronia com o Caddy (decisão 7).

6. **Política por rota.**

   | Página | Indexação | Quem decide |
   |---|---|---|
   | `/`, `/explorar`, `/termos`, `/privacidade` | indexável | meta (SeoRouter) |
   | `/contato` | indexável (quando disponível) | meta (SeoRouter) |
   | `/login`, `/registo`, `/esqueci-senha`, `/painel`, `/painel/novo`, `/conta`, `/admin`, `/admin/convites` | `noindex` | cabeçalho do Caddy e meta |
   | `/convite/:token`, `/reset/:token` | `noindex` + `Referrer-Policy: no-referrer` | cabeçalho do Caddy e meta |
   | rota desconhecida / página de "não encontrado" | `noindex` (e 404 no Caddy) | meta e Caddy |
   | `/c/{id}/{slug}/mapa`, `relacoes`, `sessoes`, `linha-do-tempo`, `itens` | `index` só se a campanha é indexável; senão `noindex` | meta (CampaignLayout), fechada por padrão |
   | `/c/{id}/{slug}/rota`, `ferramentas`, `fios` | sempre `noindex` | meta (CampaignLayout) |
   | `/c/…` carregando, inexistente ou com erro | `noindex` | meta (CampaignLayout) |
   | `cronologia` | canônico aponta para `linha-do-tempo` | meta (CampaignLayout) |
   | `/api/*` | `noindex` (também as imagens de `/api/c/{slug}/media`, que ficam fora do Google Imagens: coerente com o padrão seguro) | cabeçalho do Caddy |

7. **Caddy: o que entra nos snippets.**
   - `@privadas path /painel* /admin* /conta* /login* /registo* /esqueci-senha* /convite/* /reset/*` com `header X-Robots-Tag "noindex, nofollow"`; `@tokens path /convite/* /reset/*` com `header Referrer-Policy "no-referrer"`; `header /api/* X-Robots-Tag "noindex"`.
   - `handle /sitemap.xml { reverse_proxy <api> }` antes do `handle` genérico; o `robots.txt` continua vindo da Cloudflare/estático.
   - `Cache-Control: no-cache` para `/` e `/index.html` (os arquivos de `/assets` têm hash e já usam `expires 7d` no contêiner).
   - **404 real:** um matcher `@spa` com as rotas válidas (`/`, `/explorar`, `/login`, `/registo`, `/esqueci-senha`, `/contato`, `/termos`, `/privacidade`, `/conta`, `/painel*`, `/admin*`, `/convite/*`, `/reset/*`, `/c/*`, `/assets/*`, `/favicon.svg`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`; **sem** `/__styleguide`, que é só de desenvolvimento); o que não casar passa por `rewrite * /index.html` e `reverse_proxy { @ok status 2xx; handle_response @ok { copy_response 404 } }`, servindo a página de "não encontrado" com estado 404. Para `/c/*` inexistentes a distinção só é possível depois da API, então ficam com `noindex` no cliente (limitação documentada). **Plano B:** se `copy_response 404` não se comportar como esperado no Caddy 2.9, aceita-se o soft 404 para rotas desconhecidas, apoiado no `noindex` da página de "não encontrado", que o Google já respeita. *Risco:* esquecer uma rota nova no matcher faz a página responder 404 ao Google (o navegador ainda a mostra). Mitigação: um teste que compara as rotas de topo da tabela do `SeoRouter`/`main.tsx` com o matcher do snippet.
   - **Validação:** `docker run caddy:2.9-alpine caddy validate` para os dois snippets (com valores de exemplo para `__HOSTNAME__`, `__PORTA_API__`, `__PORTA_WEB__`) e um `docker compose` curto (Caddy + `web` construído) com `curl -I`. Isso exige docker e **não roda no sandbox do codex**: é verificação do coordenador.

8. **`robots.txt`.** Só acrescenta `Sitemap: https://campaign-codex.1nodado.com.br/sitemap.xml` ao arquivo do repositório (a Cloudflare mantém o bloco gerenciado antes do nosso). Sem `Disallow` novo.

9. **Painel e textos.** Interruptor "Permitir indexação em buscadores" por campanha no card de configurações (`painel.tsx`), com o `Switch` já usado nos módulos, o texto de ajuda na mesma linha de ajuda dos módulos e bom comportamento em tela estreita; desativado e explicado em campanhas "só com link"; com o aviso de exposição e de que a retirada de URLs já indexadas leva tempo. A política de privacidade ganha uma frase sobre campanhas indexáveis.

## Risks / Trade-offs

- [O Google vê o HTML inicial sem `noindex` e só depois o `noindex` posto por JavaScript] → O conteúdo vem da API por JavaScript, então o HTML inicial não expõe conteúdo de campanha; nas páginas `/c/*` o `noindex` é posto no primeiro render, e o Google renderiza antes de indexar. Buscadores que não executam JavaScript só veem a casca (título genérico).
- [Mestre liga a indexação e expõe spoilers] → Padrão desligado, aviso no Painel, e só o que o mestre já tornou visível aos jogadores sai na API.
- [Remover da busca algo já indexado demora] → Documentado no runbook (ferramenta de remoção do Search Console); o `noindex` vale no próximo rastreio.
- [Esquecer rota nova no matcher do Caddy] → Teste de sincronia e nota no runbook; plano B do soft 404.
- [Cloudflare (Bot Fight Mode, WAF) devolver desafio ao Googlebot] → Conferir em "Inspecionar URL" (200 e renderização) e liberar o Googlebot verificado, se preciso (runbook).
- [O sitemap público lê a tabela `campanha` a cada pedido] → Consulta única e barata, sem abrir o banco de cada campanha; `Cache-Control` de 1 hora; sem cache em processo por ser desnecessário.
- [Imagens de `/api/c/{slug}/media` fora do Google Imagens] → Aceito: coerente com o padrão seguro; documentado.
- [Canônico com `window.location.origin` duplica conteúdo se outro hostname servir o app] → Premissa de um só hostname público; outros nomes redirecionam no Caddy (runbook).

## Migration Plan

1. Deploy do código (migração `010` automática no arranque; campanhas existentes ficam com a indexação desligada).
2. Atualizar o Caddy do host com os blocos novos de `deploy/`, rodar `caddy validate` e `caddy reload`; conferir com `curl -I` (`X-Robots-Tag` no painel e na API, `404` numa rota inexistente, `/sitemap.xml` com `Content-Type: application/xml`).
3. Cadastrar o domínio no Google Search Console (registro TXT na Cloudflare), enviar `https://campaign-codex.1nodado.com.br/sitemap.xml` e usar "Inspecionar URL" em `/`, `/explorar` e numa campanha autorizada, conferindo que o Googlebot recebe 200 e renderiza.
4. Opcionalmente ligar a indexação das campanhas que o mestre quiser.
- Rollback: desligar a indexação nas campanhas e remover os blocos do Caddy; a coluna nova é inócua.

## Open Questions

- Nenhuma que bloqueie; a lista exata de páginas por campanha no sitemap pode ser ajustada depois de ver o relatório de cobertura do Search Console. Como as campanhas começam desligadas e o HTML inicial é uma casca, o ganho imediato é o site institucional e o catálogo (anotado no runbook).
