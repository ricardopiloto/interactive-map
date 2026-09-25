# Backlog — Campaign Codex

Este backlog acompanha melhorias, funcionalidades, design e decisões de produto, inclusive itens que já ganharam spec e aguardam planejamento ou implementação. Bugs são registrados separadamente em [docs/bugs/bugs.md](../bugs/bugs.md). Não confundir com [`proxima-fase-speckit-prompts.md`](../v2/proxima-fase-speckit-prompts.md) (specs 114–121) nem com as specs [112-cronica-sessoes](../../specs/112-cronica-sessoes/spec.md) e [113-revelacao-progressiva](../../specs/113-revelacao-progressiva/spec.md). O status de cada item indica se ainda é ideia, se já foi especificado ou se saiu do backlog.

Cada item tem um ID único (`BKLG-NNN`) no título, na ordem em que foi registrado — usa esse ID pra referenciar o item numa conversa ou spec, em vez do título inteiro. IDs não são reciclados: se um item sair daqui (virou spec ou foi descartado), o número fica aposentado.

---

## [BKLG-001] Gap — Gestão de Arcos não foi desenhada no `frontend-next`

**Status:** Spec e plano criados — [123-gestao-arcos](../../specs/123-gestao-arcos/spec.md) (`Draft`; pronta para `speckit-tasks`).

**Registrado em:** 2026-09-23.

**Não é a mesma coisa que "Sessões" — são dois conceitos diferentes:**

- **Arco** (`Arco`, PRD real): agrupamento de Locais em um arco narrativo, com resumo, ordem de exibição e um toggle `visivel_para_todos` (o mestre pode esconder um arco inteiro dos jogadores). Hoje é uma funcionalidade real, funcionando, gerida a partir do menu-GM do Mapa — [`frontend/src/pages/MapPage.tsx`](../../frontend/src/pages/MapPage.tsx) (botão "novo arco") → [`ArcoFormDialog`/`ArcoAdminList`](../../frontend/src/components/admin/ArcoAdminList.tsx) — criar, editar, apagar, reordenar arcos, e atribuir cada Local a um deles.
- **Sessões / Crônica de sessões**: um resumo cronológico do que aconteceu em cada sessão de jogo, pra jogador lembrar "o que rolou da última vez" sem perguntar ao mestre. É uma feature **nova**, ainda não implementada de verdade — existe só como especificação em draft ([`specs/112-cronica-sessoes/spec.md`](../../specs/112-cronica-sessoes/spec.md), [`specs/113-revelacao-progressiva/spec.md`](../../specs/113-revelacao-progressiva/spec.md), `Status: Draft`) e como prévia mockada em [`frontend-next/src/pages/SessoesPage.tsx`](../../frontend-next/src/pages/SessoesPage.tsx) (o próprio comentário no arquivo diz "próxima fronteira do roadmap, pesquisa de mercado").

**O que aconteceu de fato:** ao desenhar o `frontend-next`, a gestão de Arcos foi esquecida — não foi portada. O protótipo só trata Arco como uma etiqueta somente-leitura: [`LocalFormModal.tsx`](../../frontend-next/src/components/map/LocalFormModal.tsx) tem um `<select>` pra escolher um arco já existente pra um Local, e os arcos em si vêm pré-semeados em `data/mock.ts`, mas não existe em lugar nenhum do `frontend-next` um botão ou tela de "criar/editar/apagar arco" — o equivalente ao `ArcoAdminList`/`ArcoFormDialog` do PRD simplesmente não tem versão nova desenhada.

**Por isso não entrou nas specs 114–121** (que assumem "frontend-next é fonte da verdade, portar 1:1"): não tem o que portar, porque o design novo dessa tela nunca foi feito. Precisa de uma passada de design própria no `frontend-next` primeiro — nos moldes do que foi feito pra "Rede de rotas" (que também estava faltando e ganhou tela nova, `RouteDigitizer.tsx`, antes de virar spec) — e só depois virar spec pra aplicar em `frontend/`.

**Hipótese inicial de onde entra (não é decisão):** provavelmente no mesmo menu-GM do Mapa onde já está hoje — não parece um recurso pra virar aba própria de navegação, é apoio ao Mapa, diferente de Sessões (que seria mesmo uma aba/seção principal, por ser algo que o jogador consulta direto). Vale confirmar com o mestre usuário-teste antes de desenhar.

---

## [BKLG-002] Gap — Mover o marcador do grupo (e trocar formato bandeira/brasão) não existe no `frontend-next`

**Status:** Spec e plano criados — [124-marcador-grupo-mapa](../../specs/124-marcador-grupo-mapa/spec.md) (`Draft`; depende do menu do mestre definido em 123; pronta para `speckit-tasks`).

**Registrado em:** 2026-09-23.

**No PRD, é uma funcionalidade real:** o menu do mestre no Mapa tem "Mover grupo" — [`frontend/src/pages/MapPage.tsx:527-551`](../../frontend/src/pages/MapPage.tsx) — que ativa um modo de posicionamento (`placement: 'move-group'`); o próximo clique no mapa chama `adminApi.updateGrupo({ x, y, formato })` (linhas ~610-617) e reposiciona o marcador do grupo pro Local clicado. O mesmo menu também tem um toggle de formato do marcador (bandeira ⇄ brasão).

**No `frontend-next`, o marcador do grupo é só exibição.** [`MapCanvas.tsx:148-158`](../../frontend-next/src/components/map/MapCanvas.tsx) desenha o pino pulsante (`group-marker`) na posição do mock e tem um botão "ir para o grupo" que só recentraliza a câmera nele — não existe nenhum clique, arrasto ou menu que permita movê-lo, e não existe o toggle de formato (bandeira/brasão não aparece em nenhum lugar do protótipo).

**Causa raiz é mais ampla que só esse item:** o `frontend-next` nunca desenhou um menu do mestre pro Mapa. O FAB de edição que existe hoje só cobre "adicionar local" ([`MapPage.tsx:93-104`](../../frontend-next/src/pages/MapPage.tsx)) — o dropdown do PRD que reunia "novo local" + "novo NPC" + "novo arco" + "mover grupo" + "trocar formato" não tem equivalente novo nenhum. Ou seja: este item e o de "Gestão de Arcos" (acima) são sintomas do mesmo buraco de design — falta desenhar o menu do mestre do Mapa no protótipo antes de portar qualquer um dos dois pro PRD.

**Ideia:** ao desenhar esse menu no `frontend-next`, cobrir de uma vez as três ações que hoje só existem no PRD: novo arco, mover grupo, trocar formato do marcador — todas dependem da mesma peça de UI que está faltando.

---

## [BKLG-003] Débito técnico — escala de espaço fora de ordem em `tokens.css`

**Status:** Spec e plano criados — [125-escala-tokens-espacamento](../../specs/125-escala-tokens-espacamento/spec.md) (`Draft`; pronta para `speckit-tasks`).

**Registrado em:** 2026-09-23, ao investigar a sobreposição em `/explorar`.

`frontend/src/styles/tokens.css` tem `--space-6: 24px`, `--space-7: 48px`, `--space-8: 32px` — fora de ordem (7 é maior que 8). Faltava `--space-5` inteiramente (corrigido agora, ver changelog abaixo), mas a raiz do problema é mais funda: essa escala **não bate** com a do protótipo (`frontend-next`: 4/8/12/16/24/32/48 pra `--space-1..7`, sequencial, sem pular nada). Várias regras em `HomePage.css`/`ExplorarPage.css`/`SessoesPage.css` já usam fallback (`var(--space-6, 2rem)` etc.) — sinal de que quem escreveu essas regras assumiu a escala do protótipo, não a que de fato existe em produção.

**Não corrigi agora** porque alinhar de verdade (`--space-6` viraria 32px, não 24px) muda o valor de um token que várias regras já usam assumindo 24px — risco de regressão espalhada que exige auditar cada uso antes de mexer, não é uma correção pontual como a de `--space-5`. Vale entrar como item da spec 121 (auditoria final de paridade) ou como spec própria de limpeza de tokens.

## [BKLG-004] Design — MapSidePanel colapsável

**Status:** Implementado — [130-painel-colapsavel-mapa](../../specs/130-painel-colapsavel-mapa/spec.md) (10/10 tarefas). Regra de desktop nova em `MapSidePanel.css`; lógica de auto-colapsar (foco/seleção → expande, ação termina → colapsa) em `MapPage.tsx`/`RelacoesPage.tsx`/`RotaPage.tsx`; `RotaPage` passou a nascer colapsada (FR-006). `tsc --noEmit` limpo — não verificado em navegador real (sem stack completa rodando neste ambiente), só revisão de código + checagem de tipos.

**Registrado em:** 2026-09-23.

O `MapSidePanel` (painel flutuante de busca/lista/detalhe, compartilhado por Mapa, Relações e Rota desde as specs 115/116) hoje só tem dois estados no desktop: aberto com largura fixa, ou nada — não existe um jeito de recolher pra ver mais mapa. No protótipo ([`frontend-next/src/components/map/MapSidePanel.tsx`](../../frontend-next/src/components/map/MapSidePanel.tsx)) também não tem — é um gap dos dois lados, não só do PRD. Confirmado no CSS: a regra de desktop (`min-width: 861px`) é estática, `width: 372px` fixo, sem nenhuma referência ao estado `expanded` — só o mobile usa isso hoje (folha "peek" de 132px ⇄ 74dvh expandida).

**Direção fechada em BP (2026-09-23), ao estilo Google Maps:**
- Estado padrão = **colapsado**, mostrando só o campo de busca (o `head` que já existe no componente).
- **Gatilho de expansão = intenção de uso, não um botão manual**: focar o campo de busca **ou** selecionar qualquer coisa (pino no Mapa, nó/personagem em Relações, waypoint na Rota) expande o painel pra mostrar o `children` (lista/detalhe).
- **Vale pras três telas** que compartilham o componente (Mapa, Relações, Rota) — decisão explícita do usuário, não suposição.
- **Muda um comportamento atual, de propósito:** `RotaPage.tsx` hoje nasce com `useState(true)` (painel sempre aberto, por ser formulário De→Para dirigido). Com esta direção, a Rota também passa a nascer colapsada — é uma mudança deliberada, não uma regressão, e precisa estar explícita na spec.
- Estado não é "lembrado" entre visitas — é dirigido por interação (colapsa de novo quando a ação termina). Registrado como suposição razoável a confirmar na spec.

Detalhamento completo, com o raciocínio e as perguntas de fechamento, no documento de brainstorming linkado acima.

---

## [BKLG-005] Design — Rede de rotas (redesenho pendente)

**Status:** Direção definida em BP+TR curtos (2026-09-23). Pronta pra virar spec pequena.

**Registrado em:** 2026-09-23, depois de aplicar a spec 116-B (que só resolveu posição da entrada + forma dos controles de zoom — o resto ficou de fora de propósito, escopo pequeno de caso).

Confirmado por captura, depois da 116-B: a entrada mudou pra Rota e os controles de zoom já são círculo/pílula — só isso. O resto da tela ainda precisava de uma passada de design própria; sessão curta (2026-09-23) revisou os três pontos originais, corrigiu dois deles com evidência de código e fechou uma direção pro terceiro:

- **Painel esquerdo — Opção C escolhida: reestilizar no lugar + colapsar manual (grabber), sem virar `MapSidePanel`.** Descartada a opção de virar painel flutuante tipo `BKLG-004` (colapso automático por intenção de uso) — essa tela é modo-de-trabalho do mestre digitalizando a rede, ele provavelmente quer a lista aberta o tempo todo; colapso automático atrapalharia mais que ajudaria. Fica como painel fixo próprio, mas ganha um controle de colapsar manual (reaproveitar o padrão visual do `.map-panel__grabber`, hoje só usado no mobile do `MapSidePanel`), pro mestre esconder quando quiser ver mais mapa.
  - **Correção ao reconferir o CSS:** a alegação original de "flush, sem raio nem sombra" não procede — [`RouteDigitizer.css:271-283`](../../frontend/src/components/gm/RouteDigitizer.css) (`.digitizer-list--column`, da spec 079) já tem `border-radius` e `box-shadow`. O que realmente falta é só o colapsar manual (não existe hoje pra a variante desktop, só a `--sheet` do mobile tem grabber). O "campo de busca com texto cortado" não foi confirmado só pelo CSS — vale uma checagem visual rápida antes de escrever a spec, não assumir que ainda é bug.
- **Densidade de nós — corrigido o diagnóstico.** Não existe confusão entre nó de verdade e ponto de curvatura: `Waypoint` (nó real) e `RouteSegment.pontos_intermediarios` (pontos do traço) são estruturas **totalmente separadas** no modelo de dados — um ponto de curvatura nunca pode aparecer na lista de waypoints. A densidade real vem de outra causa, confirmada em [`DigitizerListPanel.tsx:78-113`](../../frontend/src/components/gm/DigitizerListPanel.tsx): cada waypoint, com ou sem nome, sempre renderiza uma linha cheia (rótulo + `<Select>` de vínculo + botão), nunca compacta. **Direção:** linha mais compacta por item — esconder o `<Select>` de vínculo atrás de hover/foco em vez de sempre visível, em vez de redesenhar a distinção nó/curva (que não existe de verdade).
- **"Altdorf → Altdorf" — não é dado corrompido nem resíduo de teste.** Confirmado em [`DigitizerListPanel.tsx:95-96`](../../frontend/src/components/gm/DigitizerListPanel.tsx): a linha renderiza `{nome do waypoint} → {nome do Local vinculado}`; "Altdorf → Altdorf" é um waypoint literalmente nomeado "Altdorf", vinculado a um Local também chamado Altdorf — caso legítimo (mestre nomeou o nó igual ao Local), só que a UI repete o nome à toa quando os dois batem. **Direção:** não mostrar a seta+nome do Local quando o texto for idêntico ao nome do waypoint.

**TR curto:** as três mudanças tocam só `DigitizerListPanel.tsx` + `RouteDigitizer.css`, sem mudança de backend, sem componente novo, sem dependência nova — reaproveita o padrão visual de grabber que já existe no `MapSidePanel` mobile. Risco baixo (código isolado, já em uso ativo); estimativa ~meio dia.

Fora do escopo de "portar `frontend-next`" (specs 114–121) porque o próprio protótipo simplificou essa tela — quando isso virar spec, precisa de discovery próprio, não é 1:1 com nada que já existe no protótipo.

---

## [BKLG-006] Produto — Administrador da aplicação e convites de novos mestres

**Status:** Implementado — [129-administrador-convites](../../specs/129-administrador-convites/spec.md) (18/18 tarefas). Migração `is_admin`, CLI `promover-admin`/`rebaixar-admin`, endpoint `POST /api/admin/convites`, tela `/admin/convites`, item de menu condicional. Suíte backend verde (157 passos, 1 falha pré-existente não relacionada em `test_visibility_relacoes.py`); `tsc --noEmit` limpo.

**Registrado em:** 2026-09-23.

**Pedido:** identificar quem é o administrador da aplicação; só ele pode criar convites pra novos mestres. Todo mestre pode criar campanhas e compartilhar o link delas — isso já funciona hoje sem restrição de papel —, mas só o administrador pode criar novos mestres.

**Isto reverte uma decisão explícita da spec 095.** Confirmado em [`specs/095-contas-sessao-permissoes/spec.md`](../../specs/095-contas-sessao-permissoes/spec.md): "Fora de escopo: cadastro aberto, **tela de super-admin**, co-mestre na interface" — a decisão foi deliberadamente manter o super-admin **só na CLI** (`app.cli`, comando `user criar`, que gera o link de convite de uso único). Confirmado no código: `Usuario` ([`backend/app/models/usuario.py`](../../backend/app/models/usuario.py)) não tem nenhum campo de papel/admin — todo usuário é simétrico —, e não existe endpoint nem chamada de API no frontend pra **criar** convite (só `aceitarConvite`, pra consumir um token já emitido pela CLI). Ou seja: hoje "administrador" não é um conceito da aplicação, é literalmente "quem tem acesso ao servidor".

**O que precisa de discovery antes de virar spec:**
- **Quem é o primeiro administrador?** Precisa de um mecanismo de bootstrap — ex.: flag na CLI que marca um usuário como admin, ou variável de ambiente com o email do administrador na primeira subida.
- **Schema:** provavelmente um campo `is_admin`/`papel` em `Usuario`, com migração Alembic.
- **API nova:** endpoint autenticado pra criar convite (hoje só existe via CLI), protegido por uma guarda equivalente a `require_membro` mas pra administrador.
- **UI nova:** uma tela (provavelmente em `/conta` ou uma rota própria, só visível pro admin) pra emitir convites — nome/email do novo mestre, gerar o link.

Isso é maior que um ajuste visual — é uma feature de permissões nova, com mudança de schema e de contrato de API. Vale um TR curto antes do `/speckit-specify`, até pra decidir o bootstrap do primeiro admin.

**TR feito:** [`docs/v2/tr-admin-convites.md`](../v2/tr-admin-convites.md) — recomenda campo `is_admin` em `Usuario` + bootstrap via CLI (não UI) + reaproveitar `create_usuario_with_invite` já existente; ~2,5–3 dias, sem dependência nova.

**Decisões confirmadas em 2026-09-23:** bootstrap **CLI-only**; administrador **único por enquanto**. Pronto pra virar `/speckit-specify` — falta só escrever o `spec.md`.

---

## [BKLG-007] Produto — Tela de solicitação de melhorias/correções (abre Issue no GitHub)

**Registrado em:** 2026-09-23.

**Pedido:** uma tela simples pra outros mestres enviarem solicitações de alteração (melhoria ou correção) direto pro repositório da aplicação, como Issue.

**Confirmado:** o remote do repositório é `https://github.com/ricardopiloto/interactive-map` (`.git/config`) — é pra onde as Issues iriam.

**Decisão em aberto, duas formas de fazer "enviar direto":**
- **Link pré-preenchido (sem backend novo):** botão que abre `https://github.com/ricardopiloto/interactive-map/issues/new?title=...&body=...` numa nova aba. Simples, sem segredo pra guardar, mas exige que o mestre tenha conta no GitHub e esteja autenticado lá — não é "enviado" de dentro do app, é só um atalho preenchido.
- **Criação real via API do GitHub (backend novo):** endpoint que recebe o formulário e cria a Issue de verdade usando um token (PAT ou GitHub App) guardado como segredo no backend. Aí sim "enviado direto", sem o mestre precisar de conta no GitHub — mas introduz gestão de segredo, risco de spam/abuso (qualquer mestre autenticado dispara Issues no repositório) e rate limit da API do GitHub pra decidir.

O pedido ("deve ser enviado diretamente") sugere a segunda opção, mas isso é uma decisão de arquitetura (segredo, abuso, rate limit) que vale confirmar antes de especificar.

**TR feito:** [`docs/v2/tr-solicitacoes-github-issues.md`](../v2/tr-solicitacoes-github-issues.md) — recomenda endpoint backend com fine-grained PAT (escopo só `Issues: write` neste repo) + `httpx` (já dependência) + rate limit reaproveitando o `limiter` já existente; ~1–1,5 dia. **Achado importante:** o repositório é público (confirmado) — a tela precisa de aviso explícito de que o conteúdo fica visível publicamente. Falta confirmar o limite de rate-limit e gerar o token no GitHub antes de virar `/speckit-specify`.

---

## [BKLG-008] Design — Login em modal flutuante, em vez de página separada

**Status:** Spec e plano criados — [126-login-modal-rota](../../specs/126-login-modal-rota/spec.md) (`Draft`; incorpora o TR e está pronta para `speckit-tasks`).

**Registrado em:** 2026-09-23.

**Pedido:** ao invés de navegar pra uma página de autenticação separada, abrir um modal flutuante sobre a tela atual — simples.

**Confirmado no código:** hoje, tanto o PRD quanto o protótipo navegam pra uma rota cheia. PRD: `UserMenu.tsx` faz `window.location.href = /login?next=...`, rota registrada em [`App.tsx:79`](../../frontend/src/App.tsx) (`<Route path="/login" element={<LoginPage />} />`), e o guard de rota protegida usa esse mesmo `?next=` pra voltar de onde o usuário saiu (ex.: `/painel/novo` redireciona pra `/login?next=/painel/novo`, ver `App.tsx:66`). `frontend-next` faz o mesmo com `/entrar` (`Link to="/entrar"` em `UserMenu.tsx`).

**Existe precedente reaproveitável:** já tem um `Dialog` genérico em [`frontend/src/components/ui/Dialog.tsx`](../../frontend/src/components/ui/Dialog.tsx), e um caso parecido (mais simples — só senha, não email+senha) já resolvido como modal em [`AdminGateDialog.tsx`](../../frontend/src/components/gm/AdminGateDialog.tsx) (o gate de modo-mestre). Dá pra seguir o mesmo padrão pro login de verdade.

**Ponto que precisa de atenção no desenho:** o comportamento de "voltar pra onde eu estava" (`?next=`) precisa de um equivalente sem navegação de página — abrir o modal sobre a rota atual e, no sucesso, só fechar o modal e deixar a ação original prosseguir (ex.: o guard de `/painel/novo` abriria o modal ali mesmo, em vez de redirecionar).

**Escopo:** o pedido fala de "autenticar" — dá pra entender que é só o Login. `Convite`/`Reset` de senha (acessados por link de email) provavelmente continuam como página própria, já que chegam por um link externo, não por uma ação dentro do app — mas vale confirmar isso quando a spec for escrita.

**TR feito:** [`docs/v2/tr-login-modal.md`](../v2/tr-login-modal.md) — recomenda o padrão nativo do `react-router-dom` (já instalado, v7.18) de "rota-modal com background location": `/login` continua endereçável direto (refresh/bookmark), mas abre como overlay quando disparada de dentro do app. Achado-chave: são **9 pontos espalhados** no código hoje disparando login de formas diferentes (um deles, `UserMenu.tsx`, ainda recarrega a página inteira via `window.location.href`) — a migração já está listada ponto a ponto no TR. ~1,5 dia, zero dependência nova. Achado incidental: `AdminGateDialog.tsx` é código morto (zero uso hoje), não deve ser citado como precedente na spec.

---

## [BKLG-009] Design — Botão de tema só com ícone (três estados)

**Status:** Spec e plano criados — [127-seletor-tema-icone](../../specs/127-seletor-tema-icone/spec.md) (pronta para `speckit-tasks`).

**Registrado em:** 2026-09-23.

**Pedido:** o botão de alternância de tema não deve mostrar texto, só o ícone, com três estados (auto, dark, light).

**Confirmado no código — é uma divergência entre PRD e `frontend-next`:** o gatilho do `ThemeSelector` do PRD ([`frontend/src/components/layout/ThemeSelector.tsx`](../../frontend/src/components/layout/ThemeSelector.tsx)) mostra ícone **+ texto** (`<span className="theme-selector__label">{t(\`theme.${theme}\`)}</span>`) **+ seta**. O `frontend-next` ([`frontend-next/src/components/layout/ThemeSelector.tsx`](../../frontend-next/src/components/layout/ThemeSelector.tsx)) já resolve exatamente como pedido: o botão-gatilho é só o ícone (muda entre sol/lua conforme o modo resolvido), sem texto nem seta — o texto só aparece dentro do menu suspenso, quando aberto, ao lado de cada uma das três opções (Automático/Claro/Escuro).

**Ideia:** portar o gatilho do `frontend-next` pro PRD — remover o `<span>` de texto e a seta do botão, manter só o ícone; o menu suspenso com os três estados nomeados continua igual. Já que `frontend-next` é a fonte da verdade, isto é uma correção pontual de paridade, não precisa de desenho novo.

---

## [BKLG-016] Produto/Design — Unificar Mapa e Rota numa única tela

**Status:** Modelo de interação fechado + TR feito — [`docs/v2/tr-mapa-rota-unificado.md`](../v2/tr-mapa-rota-unificado.md). Pronta pra virar spec, depois de decidir ordem com `BKLG-002`/`BKLG-004`.

**Registrado em:** 2026-09-23.

**Pedido:** em vez de duas telas separadas (Mapa e Rota), unificar as duas — o usuário seleciona um Local no mapa e, a partir dessa seleção, aparece a opção "Rotas".

**Confirmado no código — as duas telas já compartilham boa parte da estrutura hoje, nos dois lados:**
- Rotas: PRD em `/c/:slug` (Mapa, [`MapPage.tsx`](../../frontend/src/pages/MapPage.tsx)) e `/c/:slug/rota` (Rota, [`RotaPage.tsx`](../../frontend/src/pages/RotaPage.tsx)); mesma separação existe no `frontend-next` (`MapPage.tsx`/`RotaPage.tsx` próprios).
- `RotaPage.tsx` já renderiza o **mesmo** `CampaignMap` em tela cheia + o **mesmo** `MapSidePanel` que o Mapa usa (comentário no próprio arquivo: "Canonical route planner: full-bleed map + shared floating panel (spec 116)") — a diferença entre as duas telas hoje é só **o que entra dentro do painel** (lista/detalhe de Local no Mapa vs. formulário De→Para do `RoutePlannerPanel` na Rota), não o esqueleto visual.
- **Achado que mudou o problema:** `RoutePlannerPanel` já tem um prop `mapPick` documentado no código como "Map pin pick while panel open (spec 060)" — clicar um pino do mapa pra preencher De/Para **já é uma funcionalidade real**, só que `RotaPage.tsx` hoje passa `mapPick={null}` e `interactivePins={false}` — o fio existe mas está desconectado em produção.

**Modelo de interação fechado (discussão + TR curtos, 2026-09-23), estilo Google Maps:**
- Sem navegação de página — o usuário nunca sai da tela do Mapa pra planejar rota.
- Selecionar um Local mostra a ficha dele (já existe); um botão **"Rota"** no painel de detalhe inicia o planejamento com esse Local como origem.
- Também dá pra iniciar por um **botão dedicado** no painel, que troca a busca única por dois campos De/Para (decisão explícita: não é busca-única-inteligente com parsing de texto — evita NLP que não existe hoje).
- `/c/:slug/rota` **continua existindo como atalho**, só abre o Mapa já em modo-rota, sem tela própria por trás.

**Nuance técnica ainda em aberto pra spec:** Local e Waypoint continuam entidades distintas (`Local.waypoint_id` opcional) — o botão "Rota" de um Local **sem** waypoint vinculado precisa de uma regra (desabilitar com dica? oferecer vincular ali mesmo?). Não resolvida neste TR, fica pra spec.

**Arquitetura recomendada no TR:** `MapPage.tsx` ganha um modo interno (`explorar`/`rota`) e absorve o estado de `RotaPage.tsx`; `RotaPage.tsx` é removido, `/c/:slug/rota` vira só uma rota que monta `MapPage` com modo inicial `rota`. `CampaignMap` não muda (já aceita as duas famílias de props simultaneamente). ~2,5–3 dias. Depende de `BKLG-002` (o botão do digitalizador de rede migra pro menu do mestre do Mapa) e de `BKLG-004` (o botão "Rota" mora no painel que já herda o comportamento de expandir por seleção) — a ordem de implementação entre os três importa, decidir antes de especificar.

---

## [BKLG-018] Auditoria de paridade — critérios técnicos e visuais de Relações

**Status:** Spec criada — [128-paridade-rede-relacoes](../../specs/128-paridade-rede-relacoes/spec.md) (pronta para `speckit-plan`).

**Registrado em:** 2026-09-23.

**Direção confirmada:** manter o frontend e o modelo de interação desenvolvidos nesta branch. O item não pede restaurar a estrutura antiga de `main` (coluna fixa + painel de detalhe separado). Pede comparar os critérios funcionais/técnicos e os indicadores visuais da implementação anterior e do PRD — [`docs/manual-relacoes.md`](../../docs/manual-relacoes.md), specs da rede e implementação de `main` — para garantir que a reconstrução não perdeu nenhum deles. Atualizar documentação e/ou implementação só nos pontos em que a auditoria confirmar regressão ou divergência não intencional.

**Critérios explícitos para verificar:**
- O GM consegue identificar com facilidade vínculos privados/secretos no grafo, sem confundi-los com vínculos visíveis aos jogadores; confirmar também a exibição correta de vínculos conhecidos e desconhecidos em cada direção.
- As linhas de relacionamento são retas, com direção, tipos e estados legíveis.
- O posicionamento inicial separa PJs e NPCs de forma consistente e compreensível em relação ao centro/viewport do usuário; seleção, foco e anéis mantêm a orientação prevista.
- As cores dos tipos de relacionamento têm contraste suficiente entre si e são nitidamente distinguíveis; cor, padrão e espessura devem continuar comunicando o tipo mesmo em relações sobrepostas ou em duas vias.
- Permanecem os critérios funcionais do PRD para filtros, busca, isolamento, seleção/detalhe, zoom/pan, ocultação de personagens e edição de vínculos, incluindo a experiência do GM.

**Resultado esperado:** matriz de paridade PRD/`main`/branch com cada critério marcado como preservado, alterado intencionalmente ou regressão; corrigir apenas regressões confirmadas, preservando a casca e o frontend atuais. Registrar a decisão e atualizar [`docs/manual-relacoes.md`](../../docs/manual-relacoes.md) e/ou a spec pertinente para que descrevam o comportamento aprovado.

**Referências da comparação:** [`RelacoesPage.tsx`](../../frontend/src/pages/RelacoesPage.tsx), [`RelacoesPage.css`](../../frontend/src/pages/RelacoesPage.css), [`GraphStage.tsx`](../../frontend/src/components/relacoes/GraphStage.tsx), [`graphLayout.ts`](../../frontend/src/components/relacoes/graphLayout.ts), [`vinculoStyles.ts`](../../frontend/src/components/relacoes/vinculoStyles.ts), manual do PRD e spec 116.

**Achados da análise técnica inicial:** regras de servidor já filtram vínculos privados e redigem sentidos desconhecidos para jogadores; a resposta de GM conserva todos os dados. No grafo atual, porém, a apresentação não usa `publico` nem `conhecido_ab/ba` para marcar vínculos/sentidos secretos. A implementação desenha curvas, diferente das linhas retas de `main` e do critério agora solicitado. O estilo atual agrupa tipos em quatro cores familiares, enquanto `main` tinha oito cores; os chips atuais mostram bolinhas, sem amostra do padrão da linha exigido pela spec 105. O algoritmo de disposição radial permanece em relação ao código de `main` (PJs no anel interno, NPCs no externo; foco no centro e relações diretas no anel interno), mas precisa ser conferido com o painel flutuante cobrindo parte do palco em desktop e móvel.

---

## [BKLG-020] Segurança — Reduzir expiração do token de convite pra no máximo 1 hora

**Status:** Descartado — não será feito. Mantido em `INVITE_TTL_HOURS = 72` (3 dias) de propósito.

**Registrado em:** 2026-09-24. Descartado em 2026-09-24.

**Pergunta original:** o token de convite tem expiração? Sim — confirmado em [`auth_invite.py`](../../backend/app/services/auth_invite.py), `INVITE_TTL_HOURS = 72`, já aplicada de verdade (`CONVITE_EXPIRADO`). Chegou a se cogitar baixar pra 1h, mas o usuário decidiu manter como está.

---

## [BKLG-022] Design — Painel de detalhe de personagem (Relações) não tem filtro de tipo de vínculo

**Status:** Implementado — [133-filtro-vinculos-detalhe](../../specs/133-filtro-vinculos-detalhe/spec.md). Filtro **próprio** do painel de detalhe (`activeDetailTipos`, `useState` local em `PersonagemDetailBody`), independente do `activeTipos` do grafo geral. `key={personagem.id}` adicionado no call site pra resetar o filtro sozinho ao trocar de pessoa selecionada.

**Registrado em:** 2026-09-24.

**Pedido:** ao selecionar um personagem no grafo de Relações, o painel mostra a lista de vínculos dele, mas não oferece nenhuma forma de filtrar por tipo de vínculo (Aliado, Romance, Inimizade, etc.).

**Confirmado no código:** [`RelacoesPage.tsx:717`](../../frontend/src/pages/RelacoesPage.tsx#L717) — `sortedVinculos = sortVinculosByNeighbourName(vinculos, personagem.id, personagemById)` usa a lista **crua** de vínculos do personagem (só ordenada), sem cruzar com `activeTipos` — o estado do filtro por tipo que já existe e já funciona pros chips/legenda do grafo geral ([`RelacoesPage.tsx:88`](../../frontend/src/pages/RelacoesPage.tsx#L88), usado em `GraphStage` via prop `activeTipos`). Ou seja: o filtro de tipo já existe na aplicação, só não chega nessa lista específica — são dois estados desconectados hoje.

**Ideia:** a lista do painel de detalhe passa a respeitar o mesmo `activeTipos` já usado no grafo (reaproveitar o estado existente, sem inventar um filtro novo e separado só pra essa lista) — ou, se fizer mais sentido de UX, um filtro próprio dentro do painel de detalhe, independente do filtro do grafo geral (a decidir: um mestre pode querer ver o grafo filtrado só por "Inimizade" mas ainda ver TODOS os vínculos de uma pessoa específica ao selecioná-la — os dois comportamentos são defensáveis, vale confirmar qual o usuário quer antes de implementar).

**Não decidido ainda** — depende dessa escolha de UX (filtro compartilhado com o grafo vs. filtro próprio do painel); sem TR necessário de qualquer forma, é reaproveitar um `Set<VinculoTipo>` que já existe ou adicionar um `SegmentedControl`/checkboxes simples — baixa complexidade técnica nas duas opções.

---

## [BKLG-024] Design — Hover no token do personagem (grafo de Relações) não destaca os vínculos dele

**Status:** Spec criada — [135-hover-token-destaca-vinculos](../../specs/135-hover-token-destaca-vinculos/spec.md) (`Draft`; pronta para `speckit-plan`).

**Registrado em:** 2026-09-24.

**Pedido:** ao passar o mouse sobre o token de um personagem no mapa de relações, destacar brevemente todos os vínculos (bonds) que ele tem.

**Confirmado no código:** a infraestrutura de destaque por hover **já existe e já funciona** — só falta o gatilho no lugar certo. `RelacoesPage.tsx` já tem um estado `hoveredId` ([`RelacoesPage.tsx:99`](../../frontend/src/pages/RelacoesPage.tsx#L99)) passado pro `GraphStage` como prop ([`:620`](../../frontend/src/pages/RelacoesPage.tsx#L620)), e o `GraphStage` já usa esse `hoveredId` pra calcular `previewId` ([`GraphStage.tsx:275`](../../frontend/src/components/relacoes/GraphStage.tsx#L275)) e destacar as arestas/nó correspondentes (`isPreviewEdge`, classe `graph-node--preview` em `:678`). O problema: `setHoveredId` só é chamado a partir do hover na **lista lateral** de personagens (`relacoes-page__row`, [`RelacoesPage.tsx:551-552`](../../frontend/src/pages/RelacoesPage.tsx#L551-L552)) — o token em si, renderizado no canvas do grafo (`.graph-node`, [`GraphStage.tsx:685`](../../frontend/src/components/relacoes/GraphStage.tsx#L685)), não tem nenhum `onPointerEnter`/`onPointerLeave`.

**Ideia:** adicionar `onPointerEnter`/`onPointerLeave` no `.graph-node` (dentro de `GraphStage.tsx`) disparando um novo callback prop (ex. `onHoverPersonagem`), que o `RelacoesPage` já pode plugar direto no `setHoveredId` existente — reaproveita 100% do destaque já implementado, só adiciona o gatilho que falta.

**Baixo risco, sem TR necessário** — a mecânica de destaque já está pronta e testada (usada hoje pela lista lateral); é só espelhar o mesmo gatilho no canvas.

---

## [BKLG-025] Design — Remover destaque ao passar o mouse sobre uma linha de vínculo (grafo de Relações)

**Status:** Spec criada — [136-remover-hover-linha-vinculo](../../specs/136-remover-hover-linha-vinculo/spec.md) (`Draft`; pronta para `speckit-plan`).

**Registrado em:** 2026-09-24.

**Pedido:** remover o efeito de mouse hover ao passar sobre uma linha de relacionamento no grafo.

**Confirmado no código:** o path invisível de hit-test de cada aresta (`graph-stage__edge-hit`, [`GraphStage.tsx:510-517`](../../frontend/src/components/relacoes/GraphStage.tsx#L510-L517)) tem `onPointerEnter`/`onPointerLeave` setando `hoveredEdgeId`, que controla só uma coisa: `midLabelVisible` ([`:460`](../../frontend/src/components/relacoes/GraphStage.tsx#L460)) — mostra o rótulo do tipo de vínculo no meio da linha enquanto o mouse está em cima. O clique (que abre edição do vínculo) está no mesmo elemento mas é um handler separado (`onClick`, `:518`), então não é afetado por essa mudança.

**Ideia:** remover o estado `hoveredEdgeId` e os handlers `onPointerEnter`/`onPointerLeave` do hit-path; `midLabelVisible` passa a depender só de `highlighted` (seleção/foco), sem reagir a hover.

**Baixo risco, sem TR necessário** — é só remover um comportamento existente e isolado, sem tocar no clique.

---

## [BKLG-027] Design — Diminuir a distância entre os tokens no grafo de Relações em 30%

**Status:** Spec criada — [138-diminuir-distancia-tokens](../../specs/138-diminuir-distancia-tokens/spec.md) (`Draft`; pronta para `speckit-plan`).

**Registrado em:** 2026-09-24.

**Pedido:** diminuir a distância entre os tokens (personagens) no mapa de relações em 30%.

**Confirmado no código:** o espaçamento-base entre tokens vem de `OVERVIEW_SPACING`/`COMPACT_INNER_SPACING_MIN` (=120, [`graphLayout.ts:27,31`](../../frontend/src/components/relacoes/graphLayout.ts#L27)), usado tanto na visão geral (`computeInitialLayout`, chamado em [`GraphStage.tsx:235`](../../frontend/src/components/relacoes/GraphStage.tsx#L235)) quanto na visão de foco (`computeFocusLayout`, `:224`). Esse valor alimenta `ringMinRadius`/`layoutRings` (`graphLayout.ts:69-97`), que determinam o raio de cada anel de tokens — reduzir a constante-base reduz a distância em todos os anéis. Existem fatores derivados já ajustados em specs anteriores (`COMPACT_INNER_FACTOR`, `COMPACT_INNER_TIGHTEN`, `SPARSE_INNER_FACTOR` — specs 086-089), que devem continuar relativos à nova base.

**Ideia:** reduzir `OVERVIEW_SPACING`/`COMPACT_INNER_SPACING_MIN` em ~30% (ou o valor que a validação visual indicar), mantendo os fatores relativos já existentes intactos — evitar recalcular manualmente um novo valor fixo sem checar visualmente o resultado com listas grandes de personagens/vínculos (casos de anel compacto/esparso já cobertos pelas specs 086-089).

**Não totalmente decidido** — o valor exato de redução (30% flat na constante-base vs. ajuste visual fino) vale confirmar durante o `/speckit-plan` com uma checagem visual; baixo risco técnico, é uma mudança puramente numérica sem TR necessário.

---

## [BKLG-029] Produto — Sistema de RPG deveria ser system agnostic (aceitar qualquer nome)

**Status:** Spec criada — [140-sistema-agnostico](../../specs/140-sistema-agnostico/spec.md) (`Draft`; pronta para `speckit-plan`).

**Registrado em:** 2026-09-24.

**Pedido:** quando o usuário digita um nome de sistema que não é reconhecido, aparece a mensagem "Sistema desconhecido" — a aplicação deveria aceitar qualquer sistema (system agnostic), não só uma lista fechada.

**Confirmado no código:** hoje só existem **dois** sistemas de verdade aceitos: `KNOWN_SISTEMAS = frozenset(DEFAULT_MODULOS_BY_SISTEMA.keys()) | {"wfrp4e", "wod"}` ([`campanha_admin.py:50`](../../backend/app/services/campanha_admin.py#L50), com `DEFAULT_MODULOS_BY_SISTEMA` = `{"wfrp4e": [...], "wod": []}` em [`config.py:6-9`](../../backend/app/config.py#L6-L9)) — ou seja, o `frozenset` é redundante, só `wfrp4e`/`wod` existem. `create_campanha` rejeita qualquer outro valor com `SISTEMA_INVALIDO` ([`campanha_admin.py:89-90`](../../backend/app/services/campanha_admin.py#L89-L90)), traduzido pro usuário como "Sistema desconhecido"/"Unknown system" ([`comum.json:250`](../../frontend/src/locales/pt-BR/comum.json#L250) em pt-BR e en). O mesmo gate existe de novo na importação de pacotes de campanha ([`campaign_import.py:227-228`](../../backend/app/services/campaign_import.py#L227-L228), erro `SISTEMA_DESCONHECIDO`). Curiosamente, o **frontend já finge ser system-agnostic**: o campo de sistema em `NovoCodexPage.tsx` é um `<input>` de texto livre com `<datalist>` de sugestões ([`NovoCodexPage.tsx:140-142`](../../frontend/src/pages/NovoCodexPage.tsx#L140-L142)), não um `<select>` fechado — o usuário pode digitar qualquer coisa, só descobre a restrição depois, ao submeter.

**Ideia:** remover a validação de allowlist (`SISTEMA_INVALIDO`/`SISTEMA_DESCONHECIDO`) tanto na criação de campanha quanto na importação de pacote — qualquer string não vazia (dentro de um limite de tamanho razoável) passa a ser aceita como nome de sistema. `default_modulos(sistema)` já é seguro pra sistema desconhecido (`dict.get(sistema, [])` retorna lista vazia — sem módulos padrão, o que é o comportamento correto pra um sistema não mapeado). Vale confirmar se `wfrp4e` continua precisando de tratamento especial em algum lugar (módulo de fadiga) mesmo sem a allowlist bloqueando os outros.

**Baixo risco, sem TR necessário** — é remover uma validação restritiva, não adicionar comportamento novo; os dois sistemas com módulos especiais (`wfrp4e`/`wod`) continuam funcionando exatamente como hoje.

---

## [BKLG-030] Produto — Linha do Tempo vertical da campanha (novo menu, ao lado de Sessões)

**Status:** Implementado — [141-linha-tempo-eventos](../../specs/141-linha-tempo-eventos/spec.md) (33/33 tarefas). Direção definida em BP curto (2026-09-24, via `po-virtual`/Mary — [sessão completa](../brainstorming/brainstorming-session-2026-09-24-1154.md)). Entidade `Evento` (backend: model/schema/service/routers admin+público), tela `/c/:slug/linha-do-tempo` (frontend), item de menu ao lado de Sessões. Alinhamento adicional de UX feito em [144-alinhamento-prototipo-timeline](../../specs/144-alinhamento-prototipo-timeline/spec.md) (10/10).

**Registrado em:** 2026-09-24.

**Pedido original:** além das Sessões, o usuário quer uma tela de "Linha do Tempo" — um novo item de menu ao lado de Sessões — com uma timeline **vertical**, "scrollável", mostrando os acontecimentos da mesa: locais visitados e NPCs/PJs conhecidos em cada local/momento. Pedido explícito do usuário: "vamos montar um protótipo sobre como podemos ter essa tela no sistema".

**Correção feita durante o brainstorm:** o pedido original dizia "o início da timeline (ano/mês) deve ser definido pelo mestre" — isso foi revisto na sessão: **não há configuração de início separada**; a timeline se ordena automaticamente do evento mais antigo cadastrado pro mais recente.

**Decisões fechadas no BP (ver sessão completa pro raciocínio):**
1. **Entidade nova, não derivada:** `Evento`, cadastrado manualmente pelo mestre — não é uma view automática sobre Sessão/Local/NPC.
2. **Data:** sem config de calendário/início separada. `Evento.ano` (int, obrigatório, usado pra ordenar) + `Evento.rotulo_era` (texto livre, opcional, só decorativo — ex. "Ano 3, Era do Lobo"). Ordenação sempre automática: mais antigo → mais recente.
3. **Campos do `Evento`:** `titulo` (obrigatório), `ano`+`rotulo_era`, `descricao` (texto livre), `locais` (0+, vínculo com `Local` já existente), `personagens` (0+, vínculo com `NPC`/PJ já existente), `sessao_id` (opcional, vínculo com `Sessao` já existente). **Sem categorização/tipo de evento** nesta primeira versão (fica pra uma extensão futura).
4. **Visibilidade:** `Evento.visivel_para_todos`, mesmo padrão já usado em `Sessao`/`Local`/`NPC`; referências a locais/personagens ocultos dentro de um evento visível são redigidas (mesmo tratamento já usado em Relações), não escondem o evento inteiro.

**Direção de tela (protótipo lógico, do BP):**
- Novo item de menu "Linha do Tempo", ao lado de Sessões.
- Coluna vertical central, scrollável, um marcador por `Evento` (mais antigo no topo, mais recente embaixo).
- Card expansível por evento: título, ano/era, descrição, chips de locais, retratos/nomes de personagens vinculados.
- Mestre: botão "+ Novo Evento" sempre visível — é tela de documentação viva da campanha, não só consulta.
- Jogador: mesma tela, somente leitura (sem botão de criar); clicar num Local/Personagem citado navega direto pro perfil dele (mesmo padrão de navegação cruzada já usado em Relações/Mapa).

**Próximo passo:** `/speckit-specify` — este item já tem escopo fechado o suficiente pra virar spec formal.

---

## [BKLG-033] Design — Campos de texto de Sessões e Linha do Tempo divergem do padrão visual

**Status:** Implementado — [143-campos-texto-sessoes-linha-tempo](../../specs/143-campos-texto-sessoes-linha-tempo/spec.md) (5/5 tarefas). Nova variante `ui-input--new-codex` em `ui.css` (44px altura mín., padding 10/12px, borda sutil, raio médio, fundo `--color-surface-2`, outline de foco 2px/2px), já usada em Novo Codex, aplicada também aos campos de título/rótulo de `SessoesPage.tsx` e `LinhaTempoPage.tsx`; `MarkdownField` ganhou `controlClassName` opcional, repassada aos dois formulários. `npm run build` limpo.

**Registrado em:** 2026-09-24.

**Pedido:** alinhar as caixas de texto usadas para criar e editar Sessões e eventos da Linha do Tempo ao padrão visual de campos da aplicação. Hoje elas estão visualmente diferentes dos demais campos.

**Confirmado no código:** [`SessoesPage.tsx`](../../frontend/src/pages/SessoesPage.tsx) e [`LinhaTempoPage.tsx`](../../frontend/src/pages/LinhaTempoPage.tsx) renderizam inputs de texto nativos para título, rótulo de data e rótulo de era sem a classe/componente visual padrão de campo (`ui-input`). Os campos de resumo e descrição usam `MarkdownField`, que já utiliza o componente `Textarea` compartilhado. O estilo base da aplicação para inputs/textareas está definido em [`ui.css`](../../frontend/src/components/ui/ui.css) e é aplicado pelos componentes `Input`/`Textarea`.

**Ideia:** aplicar o padrão visual compartilhado a todos os campos de entrada textual dos formulários de Sessões e Linha do Tempo, incluindo estados de foco, borda, fundo, tipografia e dimensões consistentes, sem alterar a estrutura dos formulários ou o comportamento de gravação. Preservar a experiência Markdown já existente em resumo/descrição.

**Escopo:** somente os campos textuais dos formulários de criar/editar Sessão e evento (título, rótulos de data/era e resumo/descrição). Campos numéricos, seletores, checkboxes, conteúdo exibido nos cards e layout geral das telas ficam fora do escopo. Sem mudanças de API ou modelo de dados.

**Próximo passo:** SPEC criada — [143-campos-texto-sessoes-linha-tempo](../../specs/143-campos-texto-sessoes-linha-tempo/spec.md).

---

## [BKLG-034] Produto — Dono pode alterar o tema visual da campanha depois da criação

**Registrado em:** 2026-09-24.

**Pedido:** permitir que o mestre altere o tema visual de uma campanha já criada.

**Contexto confirmado:** o gênero visual da campanha (`fantasia`, `gotico`, `scifi` ou `urbano`) é escolhido na criação e foi definido como imutável pela spec 111. O seletor atual de Automático/Claro/Escuro controla a preferência pessoal do usuário, não o gênero da campanha. As paletas e regras de aplicação do gênero já existem; campanhas góticas, sci-fi e urbanas forçam o modo escuro, enquanto fantasia respeita a preferência pessoal.

**Ideia:** oferecer ao dono da campanha uma forma de trocar seu gênero visual entre as quatro opções existentes. A mudança deve ser persistida na campanha e refletir para todos que a acessarem, mantendo separada a preferência pessoal Claro/Escuro/Automático. A regra de imutabilidade pós-criação da spec 111 será substituída somente para permitir esta alteração; regras de paleta, suporte a claro e sistema de jogo permanecem.

**Escopo e acesso:** atualização restrita ao dono da campanha, seguindo o padrão atual de gestão. A alteração deve respeitar isolamento entre campanhas e não pode mudar o tema de outra campanha ou a preferência pessoal do mestre/jogador. Não incluir gêneros novos, temas personalizados ou edição do sistema de jogo.

**Próximo passo:** SPEC criada — [146-tema-campanha-editavel](../../specs/146-tema-campanha-editavel/spec.md).

---

## [BKLG-035] Produto — Tela de administração de usuários e mesas

**Status:** Spec criada — [148-administracao-usuarios-mesas](../../specs/148-administracao-usuarios-mesas/spec.md) (`Draft`; pronta para `speckit-plan`).

**Registrado em:** 2026-09-24.

**Pedido:** criar uma tela completa para administração de usuários e das mesas (campanhas) da aplicação, reunindo operações e informações administrativas em um só lugar.

**Capacidades desejadas:**
- Consultar usuários e administrar suas contas, incluindo exclusão de usuário e redefinição de senha.
- Criar convites para novos usuários, integrando a funcionalidade de convites administrativos já existente.
- Consultar as mesas/campanhas e seus status, incluindo a data da última modificação de cada mesa.
- Administrar mesas, incluindo sua exclusão.
- Exibir informações suficientes para o administrador localizar usuários e mesas e entender seu estado atual.

**Direção inicial:** ampliar a experiência administrativa atual, hoje focada em convites, para oferecer uma visão centralizada da operação de usuários e campanhas. A tela deve ser restrita ao administrador da aplicação; as ações destrutivas e de credenciais precisam deixar claro qual conta ou mesa será afetada e exigir confirmação apropriada. Detalhes de estados disponíveis, efeitos da exclusão e fluxo de redefinição de senha serão definidos na SPEC.

**Escopo:** gestão administrativa de contas de usuário, convites e mesas/campanhas, com consulta de status e última modificação. Não implica conceder acesso administrativo a donos de campanhas nem alterar as permissões que eles têm dentro de suas próprias mesas.

**Próximo passo:** `/speckit-specify` — definir os dados exibidos, as operações permitidas, os efeitos de exclusão e a experiência de redefinição de senha.

---

## [BKLG-036] Produto — Alternância entre tema claro e escuro em todos os temas de campanha

**Registrado em:** 2026-09-24.

**Pedido:** permitir alternar entre tema claro e escuro quando a campanha usa qualquer gênero visual, não apenas Fantasia medieval.

**Problema observado:** campanhas Góticas, Sci-Fi e Urbanas aplicam o modo escuro de forma obrigatória, enquanto Fantasia medieval permite alternância. Assim, usuários dos outros gêneros não conseguem escolher o modo de leitura que preferem.

**Ideia:** disponibilizar a preferência Claro/Escuro (e preservar o modo Automático, caso continue oferecido pelo seletor) em todos os gêneros de campanha. O gênero ainda define sua paleta e identidade visual; a preferência individual escolhe o modo claro ou escuro dessa paleta e não altera as preferências dos demais membros.

**Escopo:** revisar a regra que força modo escuro para gêneros diferentes de Fantasia e fazer o seletor respeitar a preferência individual em todos os temas existentes. Não inclui criar gêneros ou paletas novas, nem alterar a identidade cromática de cada gênero.

**Próximo passo:** `/speckit-specify` — definir como o modo Automático interage com gêneros cuja implementação hoje força o modo escuro e como migrar preferências previamente salvas.

---

## [BKLG-037] Produto — Associar qualquer personagem a um local

**Registrado em:** 2026-09-24.

**Pedido:** permitir que o usuário associe qualquer tipo de personagem — PJ ou NPC — a um Local.

**Contexto:** a associação atual de personagens a Locais não contempla todos os tipos de personagem. Este pedido também esclarece a dúvida registrada em [BKLG-017](../bugs/bugs.md): PJs devem poder participar dos vínculos entre personagens e Locais, assim como NPCs.

**Ideia:** ampliar a associação entre Local e personagem para aceitar PJs e NPCs, preservando a identificação do tipo de personagem nas interfaces que exibem essas associações.

**Escopo:** permitir criar e manter a associação de qualquer personagem da campanha a um ou mais Locais. O comportamento visual e as operações disponíveis para jogadores e mestres serão definidos na SPEC.

**Próximo passo:** `/speckit-specify` — definir os fluxos de associação e remoção, permissões e como os personagens associados aparecem no Mapa e nos detalhes do Local.

---

## Roadmap de mercado — "Próximo" (precisa de TR antes do `/speckit-specify`)

- **[BKLG-010] Sincronização ao vivo.** Hoje o jogador só vê mudanças ao recarregar. SSE (mais simples de operar atrás do Caddy atual) ou polling curto — decidir custo de servidor por campanha simultânea antes de comprometer a spec.
- **[BKLG-011] Múltiplos mapas aninhados.** Região → cidade → prédio, cada nível com seus próprios pinos e zoom. Mexe em `Local`, no digitalizador de rotas e na navegação do Mapa — o tipo de mudança que merece um desenho de dados revisado antes de virar tarefa.
- **[BKLG-012] Missões, fios abertos e relógios do mestre.** Entidade sem precedente no schema atual (diferente da Sessão, que reusa o padrão de NPC). Vale um brainstorm curto (BP) antes da TR, pra não desenhar às cegas.

## Roadmap de mercado — "Depois" (só com sinal real de demanda)

- **[BKLG-013] Módulos por sistema além da fadiga** (ex.: dívidas de sangue em WoD como qualificador de vínculo, ou política de facção). O motor (spec 077) já suporta; falta um mestre pedindo de verdade.
- **[BKLG-014] PWA / offline no celular** — só se a experiência em mesa presencial sem sinal virar reclamação recorrente.
- **[BKLG-015] IA/MCP somente leitura sobre a campanha** — decisão de custo/privacidade antes de qualquer código; ver a skill `eber-saltbock` como precedente de caso de uso real.

## Como seguir

Quando um item daqui ganhar prioridade: discovery rápido se for preciso (BP/TR/DR, via `po-virtual`), depois `/speckit-specify` — aí sim ele sai daqui e vira uma spec de verdade, como aconteceu com Crônica de sessões e Revelação progressiva.
