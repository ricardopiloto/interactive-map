# Review — Desenvolvedor Fullstack

**Change:** indexacao-buscadores
**Data:** 2026-10-28
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos relidos do disco e `review-architect.md`; `backend/app/{models/campanha.py, routers/campanhas.py, routers/contato.py, schemas/{campanhas,config}.py, services/{campanha_admin.py,admin_console.py}, campaign_db.py, main.py}`, `backend/alembic_control/versions/009_registo_cota.py`, `frontend-v2/{index.html, Dockerfile, nginx.conf, src/main.tsx, src/routes/{CampaignLayout.tsx,campaignRoutes.tsx,painel.tsx,not-found.tsx}, public/robots.txt}`, `deploy/Caddyfile`, `deploy/snippets/caddy.site.tpl`. Verificação local: `docker` e `podman` existem (dá para rodar `caddy validate` com a imagem `caddy:2.9-alpine`); não há `caddy` instalado; sem CI no repositório (verificação com `pytest`, `vitest`, `playwright`).

## 1. Desenvolvimento do backend
Veredito: OK
- Implementável com o que existe. `set_indexavel` copia o desenho de `set_visibilidade` (`campanha_admin.py`) e o PATCH copia `patch_visibilidade` (`require_dono`). A migração `010` é uma coluna `Boolean NOT NULL` com `server_default=sa.false()` em `batch_alter_table` (SQLite), na cadeia depois de `009_registo_cota`.
- `PainelItem` e `InstanceConfigRead` ganham o campo; atenção ao significado diferente (escolha no painel, efeito na config), como o design já diz. Dar nomes de teste que deixem isso explícito.
- O sitemap precisa de duas coisas que hoje estão em lugares errados para reuso: (a) a data de conteúdo (`_campaign_content_modified`, privada de `admin_console.py`) e (b) a disponibilidade do contato (`_sender()` privada de `routers/contato.py`). A tarefa 2.1 já prevê a extração da (a); acrescentar a da (b) (função pública em `services/` que o router de contato e o sitemap usem). Se o `lastmod` for omitido ou reduzido a data (A4 do arquiteto), a (a) fica só em `Campanha.modificado_em`, sem abrir o banco de cada campanha: bem mais simples.
- `has_map_image` é calculado ao montar a config da campanha; o sitemap deve usar o mesmo critério (`mapa_arquivo` preenchido) por uma função comum, para não divergir do que a página de mapa mostra.
- A importação de pacote cria a campanha pelo caminho padrão; confirmar com teste que a campanha importada nasce com `indexavel` falso (o manifesto não tem o campo).
- Handler do sitemap como `def` (leitura de banco) e `Response(media_type="application/xml")`.

## 2. Desenvolvimento do frontend
Veredito: Atenção
- **F1 (Atenção, forte): aplicar o hook página a página são mais de 20 arquivos.** As tarefas 3.2 e 3.3 pedem o hook em cada rota (início, explorar, termos, privacidade, contato, login, registo, esqueci-senha, convite, reset, painel, painel/novo, conta, admin, admin/convites, não encontrada e as sete da campanha). É muita superfície para esquecer uma e difícil de testar. Recomendo **centralizar**: um componente `SeoRouter` (ou hook `useRouteSeo`) montado uma vez dentro do `BrowserRouter`, que usa `useLocation` e uma tabela de rotas (chave i18n do título e da descrição, `index`/`noindex`) para as páginas estáticas, e deixa só o `CampaignLayout` completar o que depende da config (nome da campanha no título, id/slug no canônico, `indexavel`). Fica uma tabela testável (rota → meta) em vez de vinte chamadas, e o teste de sincronia 5.2 pode reutilizar a mesma lista.
- **F2 (Atenção): hoje nada atualiza `<html lang>`.** O `index.html` fixa `lang="pt-BR"` e não há código que o mude; a spec exige que acompanhe o idioma. Fazer isso uma vez, no módulo de i18n (evento `languageChanged`) e na inicialização, e não por página; testar a troca.
- **F3 (Atenção): canônico absoluto com `window.location.origin` assume um único host público.** Funciona para `campaign-codex.1nodado.com.br`, mas duplica o conteúdo se o app responder por outro nome (preview, domínio antigo `mapa.1nodado.com.br` do snippet). O sitemap usa `PUBLIC_BASE_URL` (servidor) e o canônico usaria o origin do navegador: duas fontes. Documentar a premissa no runbook (um só hostname público; outros hostnames devem redirecionar no Caddy) ou usar uma única fonte (por exemplo `VITE_PUBLIC_BASE_URL` no build, com o origin como alternativa). Decidir antes do apply; a opção do runbook é a mais barata.
- **F4 (menor): múltiplos donos da mesma tag.** Uma página que usa o hook dentro de `CampaignLayout` e outra no filho disputariam `canonical` e `robots`. Com a tabela central (F1) existe um só dono por rota; se o hook for mantido por página, precisa de regra de precedência (o mais interno vence) e de limpeza na desmontagem sem piscar entre páginas (React StrictMode executa o efeito duas vezes em desenvolvimento).
- **F5 (menor): o interruptor do Painel** segue o padrão do `Switch` de módulos em `painel.tsx` (estado local e `PATCH`); o estado desativado em "só com link" e o texto do aviso são triviais. Tela estreita: o texto é longo; usar a mesma linha de ajuda dos módulos.
- A página de "não encontrado" já existe e só precisa do `noindex`; a de falha de carregamento da campanha é o `<main role="alert">` do `CampaignLayout`.

## 3. Deploy e operação
Veredito: Atenção
- **D1 (Atenção): o 404 real é a tarefa de maior risco e precisa de teste de verdade.** `reverse_proxy` com `handle_response` e `copy_response 404` existe no Caddy, mas só se confirma validando e **rodando** o Caddy contra o contêiner `web` construído. O `docker` local permite isso fora do sandbox do codex: `docker run --rm -v $PWD/deploy:/etc/caddy caddy:2.9-alpine caddy validate …` e um `docker compose` curto (Caddy + `web`) com `curl -I` nos casos: rota válida (200), desconhecida (404, corpo HTML da aplicação), `/assets/…` (200), `/sitemap.xml` e `/api/…` (cabeçalho `noindex`). Manter o plano B do arquiteto (aceitar o soft 404 com `noindex` da página) como saída se a combinação não se comportar.
- **D2:** o teste de sincronia 5.2 compara as rotas de `main.tsx` com o matcher do snippet. Excluir `/__styleguide` (só em desenvolvimento) e incluir os arquivos estáticos reais (`/favicon.svg`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/assets/*`).
- Os dois snippets usam upstreams diferentes (`api:8000` e `web:80` no `Caddyfile`; `127.0.0.1:__PORTA_API__` no template): atualizar os dois de modo equivalente e validar ambos (o template precisa de valores de exemplo para `__HOSTNAME__`, `__PORTA_API__`, `__PORTA_WEB__`).
- Cloudflare (A1 do arquiteto): conferir que o Googlebot não recebe desafio; é verificação manual no Search Console, sem código.
- Sem variável de ambiente nova, sem script, sem migração além da `010`. Observabilidade: logar (INFO) a geração do sitemap com o número de campanhas listadas, sem dados pessoais.

## 4. Qualidade de código
Veredito: Atenção
- As tarefas têm verificação concreta. Faltam: teste de que a campanha importada nasce `indexavel` falso; teste de que o PATCH atualiza `modificado_em`; teste do sitemap com slug com caracteres especiais (escape) e com `PUBLIC_BASE_URL` com barra final; teste de que `/registo` e `/contato` indisponível não entram; teste da fail-closed (A3 do arquiteto): `noindex` já no primeiro render de `/c/*` e `index` só após a config.
- E2E (6.1): precisa marcar a campanha como indexável por uma sessão de dono (o seed do e2e já cria o dono e um helper de login); usar `page.request` para `PATCH …/indexacao` e depois ler `/sitemap.xml`; a leitura de `meta[name=robots]` com `page.locator` precisa esperar o carregamento da config (assertiva com polling).
- Divisão em execuções do codex: 1 (backend), 2 (sitemap), 3 (SEO central + campanha), 4 (painel e textos), 5 (Caddy e documentação, parte validada fora do sandbox), 6 (integração). A 5.1 não é verificável no sandbox do codex (precisa de `docker`); marcar como verificação do coordenador.

## 5. Execução das decisões arquiteturais
Veredito: OK
- `tasks.md` segue o design. Os ajustes do arquiteto (A3 fail-closed, A4 `lastmod`, A5 cache) e os de F1 a F3 são refinamentos de tarefa, não mudam as decisões.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- F1: centralizar o SEO numa tabela de rotas (`SeoRouter`) em vez de chamar o hook em 20 páginas.
- F3: premissa de um único hostname público para o canônico (ou fonte única de base).
- D1: o 404 real só se valida rodando o Caddy; o plano B deve constar do design.
- Extrair a disponibilidade do contato e o critério `has_map_image` para uso do sitemap.
