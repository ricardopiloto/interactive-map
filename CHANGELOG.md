# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.22.1] — 2026-09-24

### Fixed

- Seleção de personagem no Mapa e em Relações: o rastreamento de foco passou do cabeçalho para toda a superfície do `MapSidePanel`, evitando que o painel recolhesse antes do clique na lista e impedisse abrir a ficha / selecionar o nó (BUG-001).

## [0.22.0] — 2026-09-24

### Changed

- Dono pode alterar o tema visual (gênero) de uma campanha existente no Painel; `PATCH /api/campanhas/{slug}/genero` grava a escolha e a mesa/cartões passam a refletir o tema salvo (antes imutável após a criação).

### Fixed

- Seleção de personagem no Mapa abre a ficha correspondente; em Relações, escolher pela lista ou pelo nó do grafo mantém o mesmo personagem selecionado e os detalhes no painel (BUG-001).

## [0.21.1] — 2026-09-24

### Changed

- Listas de personagens no Mapa e em Relações passam a mostrar o retrato cadastrado no avatar (fallback para iniciais se não houver imagem ou se o carregamento falhar), no mesmo padrão circular dos tokens do grafo.

## [0.21.0] — 2026-09-24

### Added

- Linha do Tempo da campanha: entidade Evento (ano, mês opcional numeral livre, era, descrição, vínculos a locais/personagens/sessão), menu ao lado de Sessões, consulta ordenada (`ano` → `mês` → sessão → `id`) e CRUD mestre; export ZIP de eventos fora de escopo nesta versão.

### Changed

- Linha do Tempo alinhada ao protótipo: subtítulos por papel, cards colapsáveis (resumo: ano/mês, era, título e sessão; detalhe: descrição e associações) com tokens `surface-2`/`accent`, nota de eventos não revelados para jogador, e mês oculto no formulário sem apagar valores legados.
- Filtros de tipo em Relações: uma seleção partilhada entre SidePanel (lista/detalhe) e Grafo; conjunto vazio = todos os tipos; status restringe personagens e busca destaca sem ocultar nós.
- Filtro de tipos no painel de detalhe de Relações agora usa o mesmo clique com atraso (280 ms) e duplo-clique para isolar/restaurar tipos que o filtro do grafo.
- Hover no token do personagem no grafo de Relações reutiliza o mesmo preview (`hoveredId`) da lista lateral, destacando os vínculos do personagem.
- Passar o mouse sobre a linha de vínculo no grafo de Relações já não mostra rótulo mid-edge; rótulos no foco (seleção/preview) e clique para editar permanecem.
- Retrato no painel de detalhe de Relações preenche a largura do painel com proporção preservada (max-height 140px), sem moldura dashed de placeholder.
- Distância entre tokens no grafo de Relações reduzida ~30% (overview 84, foco 168); factores compact/sparse 086–089 inalterados.
- Controlo de vista no grafo de Relações ajusta escala/pan para caber todos os tokens visíveis (ex-«1:1»; rótulo i18n «Ajustar»/«Fit»).
- Campo `sistema` da campanha aceita qualquer nome (criação e import); defaults de módulos `wfrp4e`/`wod` inalterados.

## [0.20.3] — 2026-09-23

### Fixed

- Adicionei SQLModel.metadata.create_all(conn, checkfirst=True) no início da ponte — cria qualquer tabela que esteja totalmente faltando (com o schema atual completo), sem tocar nas que já existem.
- Adicionei o ALTER TABLE local ADD COLUMN visivel_para_todos que faltava — mesmo padrão que já existia pra npc.
- Por precaução, adicionei o mesmo patch pra arco e sessao (mesma coluna, mesmo padrão) — já que esse exato bug já apareceu uma vez, é barato garantir que não se repete nas outras três tabelas que têm essa coluna.

## [0.20.2] — 2026-09-23

### Fixed

- O Dockerfile só copiava app ./app, mas nunca copiava as pastas alembic_control/ e alembic_campaign/ (onde vivem as migrações reais) — confirmei que _BACKEND_ROOT em backend/app/campaign_db.py#L20 resolve pra /app dentro do container, e o código espera /app/alembic_control existir ali. Provavelmente um esquecimento de quando essas pastas de migração foram adicionadas depois que o Dockerfile já existia.

## [0.20.1] — 2026-09-23

### Fixed

- Código incompleto em GraphStage.tsx, relacionado exatamente ao trabalho da spec 128 (auditoria de paridade de Relações, BKLG-018) — alguém começou a cablear um aria-label acessível pra GM identificar vínculos privados/secretos no grafo, mas a função nunca foi escrita, e sobrou um estado não utilizado.

## [0.20.0] — 2026-09-23

### Added

- Home marketing em `/`, catálogo público em `/explorar`, e `CampaignCard` partilhado no Painel (`/painel`) — mesmos cartões em Landing featured, Explorar e gestão GM; criar/importar preservados via `#criar` (spec 119)

### Changed

- Rede de rotas: entrada GM na página Rota (botão topo); removida do menu de ferramentas do Mapa; casca do digitalizador alinhada aos tokens pós-115 (zoom pílula/círculo, chips de modo, lista/escala) — comportamento de digitalização inalterado (spec 118)

### Removed

- `frontend/src/styles/nocturne.css` — controlos migrados para o kit `components/ui` (Button/Chip/SegmentedControl/Dialog/Field); tipografia/foco/`text-muted` e chrome de formulário absorvidos em `global.css` / `ImageSlot.css` (spec 117)

### Added

- Relações e Rota no painel flutuante partilhado (MapSidePanel 115): lista↔detalhe e planejador com cartões; destaque da rota com acento da campanha; FAB de edição em Relações; `/rota` canónico (spec 116)
- Mapa reconstruído: painel flutuante (busca pílula + chips Tudo/Locais/Personagens + lista ↔ detalhe), sem coluna SideMenu nem PinModal; zoom em botões circulares; FAB + em Modo edição; ferramentas GM (rede de rotas, NPC/arco, mover grupo) em menu compacto (spec 115)
- Cabeçalho da mesa reconstruído (paridade com protótipo): marca + seletor de campanha à esquerda, abas Mapa/Relações/Rota/Sessões centradas, Modo edição em pílula, tema Auto/Claro/Escuro, barra inferior com 4 abas; contentor mínimo `/c/:slug/rota` (spec 114)
- Revelação progressiva de Local e Arco: `visivel_para_todos` (default true); filtros públicos (mapa/lista/saídas/`arco_id`/`local_ids`/chips de sessão/media `locals/`/waypoints); Modo edição com toggle e badge oculto; sem ACL por jogador nem cascade ao ocultar arco (spec 113)
- Crônica de sessões: entidade `Sessao` em `campanha.db` (número único, título, rótulo de data, resumo Markdown, N:N locais/personagens, `visivel_para_todos`); API pública/admin; página `/c/:slug/sessoes` com chips deep-link; nav Sessões no chrome; export/import (spec 112)

### Changed

- Identidade da campanha: **género** (`fantasia|gotico|scifi|urbano`) obrigatório e imutável na criação substitui o acento solto (108); migração com backfill WFRP→fantasia / WoD→gótico; mesa via `data-genre`; Painel com 4 cards + pré-visualização ao vivo; capa via `PATCH …/capa`; export/import preserva `genero` (pacotes antigos com `acento_id` mapeados) (spec 111)
- Paridade visual com protótipo fantasia (`frontend-next`): paleta base claro/escuro, `--radius-full` + pílula em botões/chips/tags/busca, sombras suaves, `--space-7` 48px, Cormorant Garamond local em títulos display; contraste sem regressão vs baseline pré-110; baselines Playwright reaprovadas (spec 110)

### Added

- Qualidade UX-10: teclado mapa/grafo via lista+controlos, Tab-trap no Drawer, aria-live no planejador, alvos ≥44px em móvel, reduced-motion; Playwright + axe (só `critical` falha) + capturas (desktop claro/escuro + mobile claro, pt-BR+en); CI `frontend-quality.yml` (spec 109)
- Identidade UX-9: paleta de 5 acentos AA, capa (`covers`), configuração no painel, token na mesa, cartões na home; export/import (spec 108)
- Formulários UX-8: Drawer (direita / bottom mobile) para local, NPC, arco, personagem e vínculo; validação inline; ConfirmDialog se sujo; Markdown com separadores Escrever/Pré-visualizar (spec 107)
- Planejador UX-7: chips de opções (todos os grupos), tempo dias+h, distância mi/km por campanha, meta Via/Fora da via + bp, timeline de pernoites na rota seleccionada; digitalizador com tokens (spec 106)
- Rede de Relações UX-6: 4 famílias de cor + estilos de linha, chips com amostra na coluna, arestas curvas, rótulos só hover/selecção, nós Tab/Enter, detalhe sem placeholder/«Sem descrição.» (spec 105)
- Listas UX-5: locais por arco (recolhíveis), linhas compactas, NPCs com avatar + status ponto/texto, EmptyState; listas admin Locais/NPCs/Arcos com hover+⋮ e ConfirmDialog (spec 104)
- Mapa UX-4: controlos translúcidos (canto inferior direito), pinos por forma (visitado/conhecido via `data_sessao` + cor do mestre), nomes no limiar/hover, popover sem dimming nem «Sem descrição.», legenda recolhível (spec 103)
- Chrome UX-3: barra de topo partilhada (marca «Campaign Codex» → `/`, tabs Mapa/Relações, nome da campanha, menu com tema Auto/Claro/Escuro em `localStorage`, «Modo edição» único), barra inferior móvel só Mapa/Relações; config pública inclui `slug`/`nome` (spec 102)
- Componentes base UX-2: kit `frontend/src/components/ui` (Button, Dialog, Drawer, ConfirmDialog, Toast imperativo, etc.), `@tabler/icons-react` (~+4 kB gzip no bundle JS vs UX-1), substituição dos 10 `window.confirm`/`alert` (spec 101)
- Fundações do sistema visual (UX-1): tokens RFC com `data-theme` dark/light (sync com `prefers-color-scheme`), Inter local, `/__styleguide` só em dev, gates `npm run lint:tokens` e `npm run test:contrast` (spec 100)
- Import legado de instância (`mapa.db` + `uploads/`): CLI `campanha importar-legado`, relatório de verificação, snippets `scripts/imprimir-snippets-codex.sh`; `nova-campanha.sh` / `migrar-wfrp.sh` aposentados (spec 099)
- Página inicial `/` (catálogo público `listada`) e painel `/painel` (minhas campanhas = dono): criar, visibilidade, cota, export/import UI; APIs `GET /api/campanhas/catalogo|minhas`, `POST /api/campanhas`, `PATCH …/visibilidade`; pós-login → `/painel` (spec 098)
- Exportar/importar campanha: zip (`manifest.json` + `content.json` + imagens), `GET …/admin/export` (só dono), `POST /api/campanhas/import`, CLI `campanha exportar|importar`, `require_dono` (spec 097)
- Mídia com ACL e cota: `GET /api/c/{slug}/media/…`, mapa versionado (`mapa_arquivo`), cota 10 GiB + `COTA_EXCEDIDA` / aviso 90%, CLI `campanha reconciliar-cota` (spec 096)
- Contas de mestre: CLI `usuario criar|reset|desactivar`, `campanha atribuir-dono`, sessão cookie `codex_session`, `/api/auth/*`, lockout 5/15 min, FE `/login` `/convite/:token` `/reset/:token` (spec 095)
- Roteamento por campanha: API `/api/c/{slug}/…`, frontend `/c/:slug` e `/c/:slug/relacoes`, config/cache por slug (spec 094)
- Multi-campanha por ficheiro: `control.db` + `data/campanhas/<uuid>/{campanha.db,uploads/}`, Alembic dual, CLI `campanha criar|listar` (spec 093)
- Suíte pytest do backend: caracterização 092 adaptada ao prefixo; isolamento HTTP A/B (spec 092–094)

### Changed

- Admin API: `require_membro` (cookie + membership) substitui HTTP Basic Auth; Caddy do repo sem `basicauth` GM (spec 095)
- Leitura de imagens: `/uploads/c/…` → **404**; cliente e API usam `/api/c/…/media/…` (spec 096)
- Deploy: uma instância Campaign Codex substitui `nova-campanha.sh` + hub 078 como procedimento corrente (spec 099)

## [0.19.1] — 2026-08-14

### Changed

- Rede de Relações: chave PJ/NPC e tipos de vínculo no canto inferior esquerdo do palco (como no mapa); lista vertical compacta, sem fundo; a coluna já não tem bloco de legenda (spec 091)

## [0.19.0] — 2026-08-14

### Added

- Rede de Relações: filtro de estado (Todos / Vivos / Mortos / Desconhecidos / Desaparecido) na coluna, junto a Isolar; palco e lista recalculam só com quem passa no filtro (spec 090)

## [0.18.3] — 2026-08-14

### Changed

- Rede de Relações: anel interior de foco com 3 ou menos conexões mais aberto (folga 240→312) para melhor leitura (spec 089)

## [0.18.2] — 2026-08-14

### Changed

- Rede de Relações: anel interior de foco com mais de 6 conexões ainda mais compacto (folga 160→112); textos dos vínculos nas linhas continuam legíveis (spec 088)

## [0.18.1] — 2026-08-14

### Changed

- Rede de Relações: vista geral (sem selecção) mais compacta — folga 240→120; discos e nomes não se sobrepõem; layout de foco inalterado (spec 087)

## [0.18.0] — 2026-08-14

### Added

- Rede de Relações: lista de personagens (PJ e NPC) na coluna, abaixo dos tipos de vínculo, com scroll e clique igual ao disco; hover no nome destaca o disco e as conexões directas visíveis; anel interior mais compacto só no foco com mais de 6 conexões (spec 086)

## [0.17.1] — 2026-08-13

### Changed

- Paleta de vínculos: **Vínculo de Sangue** passa a borgonha `#9e2436`; **Inimizade** passa a magenta/fúcsia `#d12d9a`; **Adversário** mantém cobre `#c86b3c` (spec 085)

## [0.17.0] — 2026-08-13

### Added

- Personagens com **Visível para todos** (default ligado): desligado = só o GM vê o personagem e as suas conexões; distintivo no grafo + checkbox no formulário (spec 084)
- Listagens admin de personagens/NPCs/locais para o Modo GM incluir ocultos; APIs públicas filtram personagem, vínculos e `npc_ids` de locais

## [0.16.2] — 2026-08-13

### Fixed

- Sem imagem de mapa: jogadores vão para Relações e o botão «Mapa» fica oculto; o GM (após acesso restrito em Relações) continua a poder abrir o Mapa para enviar a imagem; sair do modo GM no Mapa sem imagem redirecciona para Relações (spec 083)

## [0.16.1] — 2026-08-13

### Changed

- Seletor de idioma: combo-box (sigla + chevron + lista) substitui o par de botões PT/EN na barra superior (spec 082)

## [0.16.0] — 2026-08-13

Rede de Relações: dois tipos de vínculo novos (spec 081).

### Added

- Tipos **Adversário** (`adversario`, cobre `#c86b3c`) e **Vínculo de Sangue** / **Blood Bond** (`vinculo_sangue`, violeta `#6a3d8c`) — formulário GM, grafo, filtros e legenda (8 tipos)
- Qualificador **Lacaio** nas sugestões de Aliado e Vínculo de Sangue; Adversário reutiliza as de Inimizade
- Ao seleccionar Vínculo de Sangue em modo recíproco, direcção pré-preenche A→B (editável)

### Changed

- Ordem canónica: Aliado → Vínculo de Sangue → Amizade → Inimizade → Adversário → Romance → Família → Conhecido

## [0.15.0] — 2026-08-13

Codex **v2.0.0 — Frente D**: internacionalização da interface (spec 080).

### Added

- **i18n**: PT-BR + EN via `react-i18next`; detecção por prefixo (`pt*` / `en*`); seletor PT/EN no `CodexHeader`
- **Locales**: namespaces `comum`, `mapa`, `relacoes`, `admin` (bundled no build)
- **Erros API**: códigos estruturados `{ erro, detalhes }` nos erros surfaced; frontend mapeia para `comum:errors.*`

### Changed

- Mapa, Relações, digitalização de rotas e diálogos GM traduzidos; conteúdo do mestre inalterado
- Hub estático (`hub/`) permanece PT-only (follow-up planeado)

## [0.14.0] — 2026-08-13

Codex **v2.0.0 — Frente C**: UX Nocturne e débitos (spec 079).

### Added

- **Digitalização**: coluna lateral (~236px) com busca, secções Waypoints/Arestas colapsáveis e clique para centrar no mapa; ≤800px vira bottom sheet retrátil
- **Rede**: pinch-zoom nativo (`usePinchZoom`) no palco do grafo, partilhando o mesmo `scale` que a roda
- **Nocturne**: tokens `--elevation-column`, `--elevation-panel`, `--elevation-modal`; agrupamento `.dialog__group` nos diálogos GM (personagem, vínculo, local, NPC, arco)

### Changed

- Colunas e painéis separam por elevação (sombra) em vez de borda pesada; accent blurple reservado a interactivos
- Backdrop de diálogos escurecido (~55% preto); Mapa confirma pinch via `react-zoom-pan-pinch`

## [0.13.0] — 2026-08-13

Codex **v2.0.0 — Frente B**: multi-deploy e hub índice (spec 078).

### Added

- **Scaffold** `scripts/nova-campanha.sh`: pasta `codex-<slug>`, `.env`, override Compose, snippets Caddy/cloudflared/hub (não aplica proxy nem sobe containers)
- **Hub** estático em `hub/` com fetch de `campanhas.json` em runtime
- **Migração WFRP** `scripts/migrar-wfrp.sh` → `codex-wfrp` (copia dados; não edita Caddy nem o JSON do hub)
- **Runbook** `docs/runbook-instancias.md` (`git pull` + rebuild por pasta)

## [0.12.0] — 2026-08-13

Codex **v2.0.0 — Frente A**: motor agnóstico de sistema (spec 077).

### Added

- **Config por deploy**: `SISTEMA` e `MODULOS_ATIVOS` (defaults por sistema; override explícito); `GET /api/config` público com `sistema`, `modulos_ativos`, `has_map_image`
- **Personagem**: `extensoes_mecanica` JSON (primeiro módulo: **fadiga** 0–6 na ficha GM); chaves inactivas ignoradas silenciosamente na API
- **Landing**: instância sem ficheiro de mapa abre em **Relações** (`has_map_image: false`)
- **GM**: aviso discreto quando módulo activo no `.env` ainda não tem widget

### Changed

- Migração deploy-1: coluna `extensoes_mecanica`; copia legado `npc.fadiga` se existir (deploy-2: `MIGRATE_DROP_LEGACY_FADIGA=true` após validação prod)

## [0.11.1] — 2026-08-13

### Changed

- **Relações**: qualificador **por sentido** (`qualificador_ab` / `qualificador_ba`); em duas vias cada extremo mostra `Tipo (Qual)` (ex. `Inimizade (Medo)` / `Romance (Admiração)`); formulário GM com um campo por sentido; seta de direção no meio sem qualificador órfão (spec 076)

## [0.11.0] — 2026-08-12

### Added

- **Relações**: **qualificador** opcional (autocomplete por tipo + Medo em todos) e **direção** opcional (mútuo / A→B / B→A) nos vínculos; etiquetas e ficha mostram `Tipo (Qual)` e seta quando aplicável; em duas vias, tipos nos extremos e qual/seta no meio (spec 075)

## [0.10.1] — 2026-08-12

### Changed

- **Relações**: duplo clique num chip de **Tipos de vínculo** isola só esse tipo; outro duplo clique no mesmo chip restaura todos (spec 074)

## [0.10.0] — 2026-08-12

### Added

- **Relações**: em vínculos **duas vias**, o GM marca cada sentido como **conhecido** pelos jogadores ou só para o mestre; o interruptor **público** do par continua a mandar; jogadores vêem 0/1/2 vias (uma via conhecida aparece como recíproco); a API pública omite tipos secretos (spec 073)

## [0.9.1] — 2026-08-12

### Changed

- **Relações**: lista de vínculos na ficha ordenada A→Z pelo nome do outro personagem (locale `pt`); personagens sem nome resolvido ficam no fim (spec 072)

## [0.9.0] — 2026-08-12

### Added

- **Relações**: vínculos de **duas vias** — cada personagem pode ver o outro com um tipo diferente (ex.: aliado vs romance); linha com fade entre as duas cores e etiquetas nos extremos; ficha mostra “eu vejo” e “vê-te como…”; formulário GM com modo Recíproco / Duas vias (spec 071)

## [0.8.4] — 2026-08-11

### Fixed

- **Relações**: descrição longa já não esmaga o retrato na ficha ao seleccionar um personagem; a folha faz scroll e a imagem mantém-se `contain` até 220px (spec 070)

## [0.8.3] — 2026-08-11

### Changed

- **Relações**: discos com retrato mostram a foto a preencher o círculo (recorte centrado); sem retrato ou imagem a falhar, mantêm-se as iniciais (spec 069)
- **Relações**: com um personagem seleccionado, as linhas que não são do foco descem de ~18% para ~8% de opacidade (as do foco mantêm ~90%)

## [0.8.2] — 2026-08-11

### Changed

- **Relações**: linhas da rede visíveis a ~18% sem selecção; após a animação de foco, arestas do personagem a ~90% e as restantes ténues (spec 068)

## [0.8.1] — 2026-08-11

### Fixed

- **Relações**: linhas de vínculo ancoram no centro do disco (não no bloco nome/papel); etiquetas no médio disco–disco (spec 067)

## [0.8.0] — 2026-08-11

Rede de Relações: segunda aba do Codex com grafo PJ/NPC, vínculos tipados e visibilidade pública controlada pelo GM (spec 066).

### Added

- **Relações** (`/relacoes`): anéis PJ/NPC, selecção com animação, linhas só após foco; filtros, isolar, painel de detalhe
- **Personagem** unificado (evolui NPC): `tipo` pj|npc, `papel`; APIs `/api/personagens` (+ aliases `/api/npcs`)
- **Vínculo**: tipos (aliado, amizade, inimizade, romance, família, conhecido), nota, flag `publico` (default false); jogadores só vêem públicos
- **GM**: + Personagem / + Conexão; editar linha/lista; apagar personagem com cascade de vínculos
- Nav partilhada **Mapa | Relações** (`CodexHeader`); seed Ubersreik (~4 PJs, ~7 NPCs, ~15 vínculos)

### Changed

- Formulário de NPC no mapa inclui **papel**; lista do mapa exclui personagens `tipo=pj`

## [0.7.0] — 2026-08-07

Planeamento de viagem com pernoites, fadiga no mapa e Calcular rota no menu lateral (specs 062–065). As notas intermédias 0.6.11–0.6.14 ficam documentadas nesta release.

### Added

- **Pernoites**: simulação alinhada ao tempo publicado da rota (dias de marcha M a partir de D/R; orçamento diário = milhas ÷ M; no máximo M−1 paragens); Local dentro de ±20% do orçamento diário ou ao relento; chegada não conta como pernoite
- **Fadiga (ritmo intenso)**: +1 por dia de marcha, −1 com noite em Local; saldo/pico na API; no mapa, trechos residuais em vermelho mais escuro conforme o saldo (até o máximo da escala); hover no segmento indica ganho de fadiga
- **API**: `pernoites`, campos de fadiga e `dias_visuais` (geometria por dia, `residual`, `fadiga_apos`) em cada item do plano
- **Mapa**: pin azul pequeno ao relento; badge de pernoite no pin de Local existente (sem segundo pin)
- **UI**: separador **Rota** no menu lateral (paridade com Locais/NPCs/História); mapa-pick De/Para e overlay de viagem só com Rota activo
- `Settings.tolerancia_pernoite_pct` (default 0.20)

### Changed

- **Calcular rota**: painel flutuante removido; lista sem resumos textuais de pernoite/fadiga (só meta de viagem — distância/tempo/custos)
- **Mapa**: rota seleccionada em vermelho base; alternativas tracejadas/mais claras; fadiga escurece o vermelho nos dias residuais

## [0.6.10.1] — 2026-08-06

Correcção do versionamento e do build Docker do mapa → Calcular rota (060/061).

### Fixed

- **Versionamento**: specs 060 e 061 ficam documentadas e publicadas como **0.6.10** (sem release intermédia 0.6.11); manifests alinhados a **0.6.10.1**
- **Build frontend**: erro TypeScript em `RoutePlannerPanel` (comparação `number` vs `''`) que quebrava `npm run build` no Docker

## [0.6.10] — 2026-08-06

Calcular rota: seleccionar origem/destino no mapa (estilo Directions) e calcular automaticamente.

### Added

- **Calcular rota**: com o painel aberto, clicar num pin de Local preenche De (se vazio) ou Para; ao completar ambos, o cálculo corre automaticamente; pin sem nó correspondente no combobox abre o detalhe como antes; sem zonas clicáveis novas; combobox e botão Calcular continuam disponíveis

### Fixed

- **Calcular rota**: o pin resolve o nó também por nome (além de local_id), para cidades que já aparecem no combobox — deixa de abrir só o modal sem preencher De/Para

## [0.6.9.1] — 2026-08-05

Imagens de Locais no pin modal e no formulário GM sem corte fixo (mesma política dos retratos de NPC).

### Fixed

- **Locais (pin modal)**: imagem do local acompanha a proporção (shrink-to-fit), com altura máxima ~50% da viewport; sem imagem não mostra caixa vazia
- **Locais (modo GM)**: caixa da imagem no formulário criar/editar com o mesmo sizing; upload continua editável; placeholder vazio mantém zona de drop utilizável

## [0.6.9] — 2026-08-05

Calcular rota com preferência de via, painel mais limpo e cobertura de tipos puros; retratos de NPC no menu e na edição sem corte fixo.

### Added

- **Calcular rota**: preferência de via Sem preferência (default) / Por rio / Por estrada — enviesamento suave (rotas mistas permitidas); abrir o painel repõe Sem preferência; mudar a preferência recalcula
- **Calcular rota**: bloco Opções de viagem colapsável (recolhido por omissão) com resumo só de não-defaults; ordem De → Para → Calcular → Opções → Resultados

### Changed

- **Calcular rota**: resultados em título + linha de meta; rótulos Pago/Próprio e Normal/Intenso (h/dia como apoio)

### Fixed

- **Calcular rota**: se a rede tem um caminho contínuo só de um tipo (ex. Estrada Altdorf→Ubersreik), essa alternativa pura entra na lista de até 6 mesmo sob Mais rápida; preferência de via não suprime tipos puros opostos
- **NPCs (menu lateral)**: retrato no cartão expandido acompanha a proporção da imagem (shrink-to-fit), com altura máxima ~50% da viewport; miniatura circular inalterada
- **NPCs (modo GM)**: caixa do retrato no formulário criar/editar com o mesmo sizing; upload continua editável; placeholder vazio mantém zona de drop utilizável

## [0.6.8] — 2026-08-05

Rede de rotas com traços mais finos; Calcular rota com transporte pago vs próprio. Tentativas de realinhar pins no móvel (que partiam o desktop) foram revertidas — o mapa da campanha mantém o alinhamento estável anterior.

### Added

- **Calcular rota**: escolha Transporte pago (tabela de velocidades/custos) ou Transporte próprio (velocidade desejada default 4 mi/h, custos Dentro/Fora 0); abrir o painel volta a pago; mudar o modo recalcula; editar só a velocidade não recalcula sozinho

### Changed

- **Rede de rotas**: stroke normal/draft ~1.0 e hover ~2.3 (antes 1.5 / 3.5); hit-area de hover inalterada; mapa da campanha e overlay de rota sem mudança

## [0.6.7] — 2026-08-04

Calcular rota: ordenar por mais rápida ou mais barata (até 6 alternativas).

### Added

- **Calcular rota**: opção Ordenar por Mais rápida / Mais barata (default rápida); até 6 rotas para o critério; mais barata usa custo Dentro; mudar a preferência recalcula automaticamente

## [0.6.6] — 2026-08-04

Rede de rotas: segment-hover só em idle — desligado ao colocar nó ou traçar segmento.

### Changed

- Rede de rotas: em **Novo nó** e **Traçar segmento**, o hover de segmento (tooltip, destaque na lista e hit largo) fica desligado para não interferir com colocação/desenho; em idle o comportamento de 0.6.5 mantém-se

## [0.6.5] — 2026-08-04

Rede de rotas: aura/snap dos nós, traços mais finos, fecho mais apertado e hover com identidade do segmento.

### Added

- Rede de rotas: aura visível em cada nó (zona clicável); origem activa continua distinta
- Rede de rotas: ao passar o rato sobre um segmento gravado, tooltip com extremos/tipo/distância e destaque (com scroll) da linha correspondente em Segmentos; traço enfatizado; hover não apaga

### Changed

- Rede de rotas: snap de origem mantém folga útil; snap de fecho ~metade — com draft aberto a aura encolhe para coincidir com a zona de fecho; sem draft, aura de origem
- Rede de rotas: linhas de segmento (gravadas e rascunho) mais finas (~60% da espessura anterior) para alinhar melhor ao mapa

## [0.6.3] — 2026-08-04

Menu lateral (scroll e busca), marcadores mais compactos com tamanho fixo no zoom, botão para ir ao grupo, e De/Para só com nós nomeados.

### Added

- Menu lateral: filtro de busca em Locais, NPCs e História (jogador e GM; case/accent-insensitive); História casa título do arco ou nome de local ligado; busca oculta na aba Grupo
- Controlo “Ir ao grupo” no cluster de zoom (+/−/1:1): recentra o pin do grupo no viewport; oculto quando não há posição de grupo

### Fixed

- Menu lateral: scroll do corpo das abas (cadeia de altura flex/grid) para listas longas não ficarem cortadas

### Changed

- Mapa e Rede de rotas: pins, grupo e nós mais compactos (~60% da área anterior); tamanho aparente no ecrã fixo face ao zoom; ênfase de selecção/hover mantida a partir do novo tamanho base
- **Calcular rota**: listas De/Para omitem nós sem nome (sem rótulo `Nó {id}`); nós sem nome continuam a servir de passagem no caminho

## [0.6.2] — 2026-08-03

Pesquisa com autocomplete nas listas De/Para do Calcular rota.

### Added

- **Calcular rota**: comboboxes De/Para com filtragem ao digitar (case- e accent-insensitive); reeditar limpa a seleção até nova escolha

## [0.6.1] — 2026-08-03

Correção do desalinhamento dos nós na Rede de rotas.

### Fixed

- Rede de rotas (digitizer): stage guiado pela imagem (sem `aspect-ratio` fixo + `object-fit: cover`), para nós e cliques alinharem ao mapa

## [0.6.0] — 2026-08-03

Rede de vias e cálculo de rotas (De/Para entre nós), refinamentos do digitizer, e vínculo nó↔Local depois da criação.

### Added

- Rede de viagem: waypoints, segmentos (estrada/rio/trilha), escala mi/unidade; vista GM **Rede de rotas** para digitalizar sem pins de lore
- **Calcular rota**: origem/destino entre **qualquer nó** da rede (com ou sem Local); ritmo de viagem; várias rotas por tempo (mais rápida destacada; alternativas tracejadas)
- Título da rota derivado do tipo de via dominante no percurso
- Vincular nó ↔ Local **depois** da criação: select na lista de nós (Rede) e campo “Nó da rede” no formulário de Local; ao vincular, o pin do Local move para as coordenadas do nó; desvincular não reverte a posição
- Zoom máximo maior na digitalização; zona de fecho de segmento mais apertada; botão direito desfaz o último ponto (ou a origem) ao traçar

### Changed

- Zoom com a roda do mouse mais suave no mapa da campanha e na Rede de rotas (step alinhado aos botões +/−)

### Deferred

- Ajuste de tamanho/âncora dos pins no móvel (spec 030) — revertido do produto; ver `specs/030-pin-size-offset` (Deferred / Staged)

## [0.5.0] — 2026-08-03

Conexões entre locais no mapa, estilo das linhas, pré-visualização no hover do menu e modais que cabem na viewport.

### Added

- Saídas dirigidas entre locais (`saida_ids` / `local_conexao`): cadastro no formulário GM; linhas no mapa ligando origem → destinos
- Pré-visualização das linhas ao passar o mouse sobre um local na aba Locais (ou lista GM), **somente** quando nenhum pin está selecionado
- Diálogos (local, NPC, arco, gate, pin) com altura máxima na viewport: corpo rolável e ações fixas no rodapé

### Changed

- Linhas de conexão usam vermelho claro da família “visitado”, opacidade moderada e sombra suave (em vez do accent roxo)
- Com um local selecionado/aberto, hover na lista só destaca o pin — as linhas permanecem as da seleção

## [0.4.0] — 2026-08-03

Foco no pin a partir do menu/mapa, modal ao lado do pin e refinamentos de hover na sidebar.

### Added

- Clique no local no menu (jogador) anima pan/zoom até o pin correspondente no mapa
- Clique no pin no mapa (jogador) também foca a vista no pin; no Modo GM o clique só seleciona (sem foco automático)
- Modal de leitura do pin abre ao lado do pin na tela (não centrado genérico)
- Hover no cartão da aba Locais com tint sutil; campo de busca com largura ajustada ao layout

### Fixed

- Hover na lista de Locais não re-dispara pan/zoom da vista após um foco anterior (a vista permanece onde o jogador deixou; o destaque local do pin continua)

### Changed

- Destaque de pin no hover do menu permanece só visual (escala/brilho), sem mover a câmera do mapa

## [0.3.1] — 2026-08-03

Ajuste nas legendas

### Changed

- Ajustado o tamanho das legendas para ficar mais em linha com o design da aplicação

## [0.3.0] — 2026-08-03

Descrição do pin com Markdown opcional na leitura.

### Added

- Descrição do local aceita texto livre ou Markdown no mesmo campo (Modo GM); hint “Markdown opcional” no formulário
- Leitura do pin (jogador) renderiza Markdown seguro: ênfase, listas, títulos e links `http`/`https` (nova aba)

### Security

- Renderização sanitizada: sem execução de HTML/script; imagens Markdown não são carregadas; esquemas de link inseguros (ex.: `javascript:`) não são navegáveis

## [0.2.0] — 2026-08-03

Melhorias de interação no mapa e cores de pin por local (Modo GM).

### Added

- Campo `cor_pin` nos locais (hex `#RRGGBB`): seletor livre no formulário GM, swatches sugeridos Visitado (`#e5484d`) / Conhecido (`#c4b5fd`), legenda do mapa com a convenção sugerida
- Migração SQLite automática para `cor_pin` (default lilás em locais existentes)
- Em Modo GM, clique na área vazia do mapa deseleciona o pin destacado (sem cancelar formulários de edição abertos)
- Controles de zoom/pan mantidos visíveis no layout fullscreen (slot flex do mapa)
- Botão explícito **Mapa** para substituir a imagem da campanha (GM), em vez de abrir o seletor de arquivo em qualquer clique

### Fixed

- Clique genérico no mapa em Modo GM não abre mais o diálogo de arquivo (regressão do slot editável cobrindo o stage)
- Controles de zoom deixavam de aparecer / ficavam fora da área útil em layouts altos

### Changed

- Pin de local no mapa usa a cor persistida (`cor_pin`); marcador do grupo permanece independente
- Clique no ícone do grupo não limpa a seleção de pin do local

## [0.1.0] — 2026-08-01

Primeira entrega do Codex da campanha (mapa.1nodado.com.br).

### Added

- Mapa interativo com pins de locais, zoom/pan e posição do grupo (bandeira ou brasão)
- Menu lateral: Locais, História e NPCs; modal de leitura ao clicar no pin
- Modo GM in-page (gate de senha + Basic Auth em `/api/admin/*`): CRUD de locais, NPCs, arcos, upload de mapa/imagens, mover grupo
- Destacar pin no mapa ao passar o mouse sobre o nome na aba Locais (jogador e lista GM)
- UI alinhada ao protótipo Nocturne (`prototype/`)
- Deploy com Docker Compose e Caddy opcional
- Pin do grupo: borda preta mais legível (bandeira via camadas CSS; brasão via `border`) e sombra suave para destaque no mapa
- Legenda do mapa alinhada ao estilo do pin do grupo

### Security

- Escrita admin fail-closed sem `ADMIN_USER` / `ADMIN_PASSWORD`
- Leitura pública; jogadores veem alterações ao recarregar (sem sync ao vivo)
