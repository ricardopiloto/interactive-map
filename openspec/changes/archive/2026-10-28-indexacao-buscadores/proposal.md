# Proposal

## Why

O Google consegue renderizar o JavaScript da SPA, mas hoje encontra: o mesmo `<title>` ("Campaign Codex") e nenhuma descrição em todas as páginas; nenhum sitemap (`/sitemap.xml` devolve a home com status 200); páginas inexistentes que respondem 200 (soft 404); páginas privadas (`/painel`, `/admin`, `/login`, `/convite/:token`, `/reset/:token`…) sem qualquer `noindex`; e nenhuma forma de o mestre decidir se o conteúdo público da sua campanha pode ir para um buscador. O risco mais sério não é aparecer pouco, é aparecer **por engano**: páginas de conta, URLs com token ou campanhas "só com link". Esta change faz o básico certo (SEO técnico) com um padrão seguro: nada de campanha é indexável sem o mestre ligar.

## What Changes

- **Caddy (snippets em `deploy/`, aplicados à mão no servidor):**
  - `X-Robots-Tag: noindex, nofollow` nas páginas privadas e `Referrer-Policy: no-referrer` nas páginas com token (`/convite/*`, `/reset/*`);
  - `X-Robots-Tag: noindex` em `/api/*` (sem `Disallow`, porque o Googlebot precisa buscar a API para renderizar);
  - `/sitemap.xml` vem da API; `index.html` sem cache; status `404` real para rotas desconhecidas.
- **Campanha indexável por escolha do mestre:** nova coluna `indexavel` (padrão **falso**, também para as campanhas existentes), `PATCH /api/campanhas/{slug}/indexacao` só para o dono, e um interruptor "Permitir indexação em buscadores" no Painel. Só tem efeito com campanha ativa e visibilidade "listada"; "só com link" nunca é indexável.
- **`GET /sitemap.xml`:** páginas institucionais (`/`, `/explorar`, `/termos`, `/privacidade`, `/contato`) e, para cada campanha indexável, as páginas públicas com conteúdo. Sem `lastmod`: a data de modificação revelaria quando o mestre edita conteúdo privado.
- **Frontend (`frontend-v2`):** um `SeoRouter` único com a tabela de rotas define título, descrição, canônico e `index`/`noindex` por página (pt-BR e en); o `lang` do documento acompanha o idioma; as páginas de campanha começam **sempre em `noindex`** e só passam a `index` quando a configuração da campanha confirma. O `index.html` estático continua indexável (nunca recebe `noindex`).
- **robots.txt:** acrescenta a linha `Sitemap:`.
- **Textos e documentação:** a política de privacidade avisa que campanhas marcadas como indexáveis podem aparecer em buscadores; novo runbook de SEO (blocos do Caddy, Google Search Console, como conferir e como remover URLs); README, `docs/api-contracts.md` e CHANGELOG.

## Capabilities

### New Capabilities
- `indexacao-buscadores`: regras de indexação do site (o que pode e o que não pode ser indexado), sitemap, metadados por página, e a escolha de indexação por campanha.

### Modified Capabilities
<!-- Nenhuma: as specs existentes não definem comportamento de indexação. -->

## Impact

- Backend: `app/models/campanha.py`, migração `010` em `alembic_control`, `app/services/campanha_admin.py` (`set_indexavel` e a regra de campanha indexável), `app/routers/campanhas.py` (PATCH), `app/schemas/{campanhas,config}.py`, novo `app/services/sitemap.py` e a rota `GET /sitemap.xml` em `app/main.py`.
- Frontend: novo hook de SEO e uso nas rotas, `index.html` (descrição padrão), `routes/painel.tsx` (interruptor), `routes/CampaignLayout.tsx` e páginas da campanha, `not-found.tsx`, locales pt-BR/en, textos legais.
- Operação: `deploy/Caddyfile` e `deploy/snippets/caddy.site.tpl` (o usuário cola no Caddy do host), `frontend-v2/public/robots.txt`, verificação do domínio no Google Search Console por registro TXT na Cloudflare.
- Fora de escopo: Open Graph, Twitter cards, JSON-LD, SSR/pré-renderização, `hreflang`, AMP, Analytics.
