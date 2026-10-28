# Review — Arquiteto de Soluções

**Change:** indexacao-buscadores
**Data:** 2026-10-28
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos da change relidos do disco; `deploy/Caddyfile`, `deploy/snippets/caddy.site.tpl`, `frontend-v2/{index.html, nginx.conf, public/robots.txt, src/main.tsx, src/routes/{CampaignLayout.tsx, campaignRoutes.tsx, not-found.tsx}}`, `backend/app/{models/campanha.py, campaign_db.py, services/admin_console.py, routers/campanhas.py, schemas/config.py}`, a resposta real de `https://campaign-codex.1nodado.com.br` (cabeçalhos, `robots.txt`, `/sitemap.xml`, uma rota inexistente). Topologia: Cloudflare (túnel) → Caddy do host → `web` (nginx só com estáticos) e `api` (FastAPI, 1 worker).

## 1. Definição da arquitetura técnica
Veredito: OK
- A estratégia é a certa para uma SPA sem SSR: HTML inicial indexável (nunca `noindex` estático, para o Google renderizar), cabeçalhos `X-Robots-Tag` do Caddy para o que o servidor sabe sem consultar dados (privadas e API), `meta robots` posta por JavaScript para o que depende da campanha, e o sitemap como mecanismo de descoberta só das campanhas autorizadas.
- Sem dependência nova (hook próprio em vez de biblioteca de `<head>`), sem tabela, sem serviço: uma coluna, uma rota PATCH, uma rota de XML. Coerente com a equipe e a stack.
- A decisão de não usar `forward_auth` está justificada (latência e acoplamento do carregamento da página à API).

## 2. Integração com a infraestrutura existente
Veredito: Atenção
- **A1 (Atenção): a Cloudflare na frente pode atrapalhar o Googlebot.** O `robots.txt` já passa por ela (bloco gerenciado). Recursos como Bot Fight Mode, "Block AI bots" ou desafios de WAF podem devolver desafio ao Googlebot e fazer o Search Console mostrar "não foi possível buscar". O padrão libera "verified bots", mas vale conferir. Acrescentar ao runbook e à tarefa 5.4: conferir, em **Inspecionar URL**, que o Googlebot recebe a página (200) e a renderiza; e, se houver regra de WAF/bot, liberar o Googlebot verificado.
- **A2 (Atenção, menor): `noindex` em `/api/*` inclui as imagens** servidas por `/api/c/{slug}/media/…` (mapa, retratos, capa): elas não entrarão no Google Imagens. É coerente com o padrão "seguro por omissão" e simplifica; registrar a consequência no design e no runbook, em vez de deixá-la implícita.
- O 404 real no Caddy é a parte mais frágil (lista de rotas válidas), mas está bem mitigada: teste de sincronia (5.2), validação com `caddy validate` e a limitação de `/c/*` documentada. O design deve manter o plano B explícito, caso `copy_response 404` não se comporte como esperado em produção: aceitar o soft 404 para rotas desconhecidas, apoiado no `noindex` da página de "não encontrado", que o Google já respeita.
- `/__styleguide` só existe em desenvolvimento (`import.meta.env.DEV`); o matcher de produção e o teste de sincronia 5.2 não devem exigi-lo.
- Dados: migração aditiva `010` (`NOT NULL DEFAULT 0`), sem impacto em backup; sem porta, serviço ou variável nova.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **A3 (Atenção, forte): janela de exposição enquanto a campanha carrega.** O design põe `noindex` nas campanhas não indexáveis **depois** que `GET /config` responde; durante o carregamento (`CampaignLayout` mostra "carregando" sem hook de SEO) a página não tem `meta robots` e é, por padrão, indexável. Se o Google tirar o instantâneo da renderização cedo, ou a API falhar, a campanha não autorizada pode ficar sem `noindex`. Para um produto cujo valor é controlar o que se vê, o padrão deve ser **fechado**: ao montar qualquer página `/c/*`, aplicar `noindex` já no primeiro render; só trocar para `index` quando `config.indexavel` for verdadeiro e a página estiver na lista indexável. Atualizar a decisão 6, a tarefa 3.3 e a spec ("campanha que ainda não carregou declara `noindex`").
- **A4 (Atenção): o `lastmod` do sitemap vaza quando o mestre edita.** `campaign_state.modificado_em` muda a cada gravação de conteúdo, inclusive de notas de preparo e sessões ocultas. Publicar a data exata no sitemap revela publicamente a atividade do mestre sobre conteúdo privado. Mitigação simples: só a **data** (sem hora) ou nem emitir `lastmod` (o Google ignora `lastmod` pouco confiável e o conteúdo vem por JavaScript, então o ganho é pequeno). Recomendo omitir ou usar granularidade de dia, e registrar a razão.
- **A5 (Atenção): custo do sitemap sem cache no processo.** Cada pedido abre o banco de cada campanha indexável para ler o `lastmod`, e `get_campaign_engine` guarda um motor SQLite por campanha para sempre. A rota é pública e sem autenticação; `Cache-Control: public, max-age=3600` só ajuda se a Cloudflare cachear XML, o que não é garantido (o `cf-cache-status` de `/` foi `DYNAMIC`). Se A4 eliminar o `lastmod`, o custo some; caso contrário, cache em memória com TTL (por exemplo 10 minutos) e handler `def`.
- Segurança: o PATCH exige dono, a escolha é por campanha e começa desligada; a API continua filtrando por visibilidade; a regra efetiva (ativa + listada + escolha) numa só função evita divergência entre sitemap e meta. Nenhuma garantia existente é enfraquecida. Um admin da plataforma desativa uma campanha abusiva e ela sai do sitemap.
- Manutenibilidade: a duplicação entre `main.tsx` e o matcher do Caddy é o ponto de manutenção; o teste de sincronia é a resposta certa.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- O design traz as alternativas relevantes (noindex estático, `Disallow`, `forward_auth`, hook vs. elementos do React 19) com o motivo. Vale uma tabela de política por rota (indexável ou `noindex`, por cabeçalho ou meta) no design ou no runbook, porque a lista está espalhada entre a decisão 6 e a decisão 7.

## 5. Ponte entre produto e técnico
Veredito: OK
- Traduz o pedido (indexar corretamente, sem Open Graph, padrão "não indexar campanhas") sem inventar escopo. A decisão de produto (opt-in por campanha, desligado por padrão) está na spec e no Painel, com aviso de exposição e de que a retirada demora.
- Expectativa a registrar no runbook: como as campanhas começam desligadas e o HTML inicial é uma casca, **o ganho no curto prazo é o site institucional e o catálogo**; o conteúdo das campanhas só entra se os mestres ligarem a opção.

## Bloqueantes antes de implementar
- nenhum (A3 e A4 convém decidir antes do apply, pois mudam spec e testes)

## Ressalvas a incorporar
- A3 → decisão 6, tarefa 3.3 e spec: `noindex` desde o primeiro render nas páginas `/c/*`, `index` só depois de a config confirmar.
- A4/A5 → decisão 4 e tarefa 2.1: `lastmod` só com a data (ou omitido) e, se mantido, cache em memória.
- A1/A2 → runbook (5.4) e design: Googlebot na Cloudflare, e `noindex` em `/api` também para imagens.
- Plano B do 404 e `/__styleguide` fora do matcher → decisão 7 e tarefa 5.2.
