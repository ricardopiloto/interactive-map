# Feature Specification: Página inicial e painel do mestre

**Feature Branch**: `098-home-painel-mestre`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Página inicial e painel do mestre. Página inicial pública em / listando as campanhas com visibilidade \"listada\" (nome, sistema); jogador escolhe e vai para /c/<slug>; campanhas \"so_link\" não aparecem. Painel do mestre autenticado: \"minhas campanhas\" (só as suas), criar campanha (nome, slug, sistema, visibilidade; slug e sistema ficam imutáveis depois), alterar visibilidade, botões de exportar e importar (spec 097) e indicador de uso da cota. PT-BR e EN, design Nocturne, funcional em celular, com estados vazios. Fora de escopo: tela de super-admin para criar contas, co-mestre. Depende de: 094, 095, 096, 097. Critério-chave: mestre A nunca vê nem lista campanhas do mestre B no painel; um jogador chega a uma campanha listada em até dois cliques."

**Depends on**: [094-roteamento-campanha](../094-roteamento-campanha/spec.md) (Implemented); [095-contas-sessao-permissoes](../095-contas-sessao-permissoes/spec.md) (Implemented); [096-uploads-cota](../096-uploads-cota/spec.md) (Implemented); [097-exportar-importar](../097-exportar-importar/spec.md) (Implemented); Campaign Codex brief ([docs/v2/product-brief-campaign-codex.md](../../docs/v2/product-brief-campaign-codex.md) fase 098); constituição v1.0.0 (I, II, III, IV, V, VI); visual Nocturne ([079-ux-nocturne](../079-ux-nocturne/spec.md))

## Constitution

- Isolamento (I): a listagem **pública** MUST NOT expor campanhas `so_link` nem inactivas. A listagem do **painel** MUST devolver só campanhas **activas** de que o mestre autenticado é **dono**; mestre A MUST NOT ver nome, slug, cota nem existência das mesas de que só B é dono. Rotas novas (catálogo público, «minhas campanhas», criar, alterar visibilidade) MUST entrar na matriz de isolamento (anónimo vs A vs B).
- Testes primeiro (II): listagem pública vs `so_link`, isolamento A/B do painel, criar campanha e alteração de visibilidade MUST ter testes a falhar **antes** da implementação correspondente. Export/import na UI reutilizam 097 (já cobertos na API); esta fase testa que os botões chamam essas operações e respeitam dono vs não-dono.
- Produção legada (III): MUST NOT exigir alteração das instâncias WFRP/WoD nem `git pull` em `/opt/codex-*` até 099.
- Simplicidade (IV): reutilizar Campanha / Membro (093–095), cota (096) e pacote zip (097). Sem painel de super-admin, sem gestão de co-mestre, sem catálogo extra de sistemas. Sem dependência de UI nova além do stack React já usado.
- i18n (V): toda a copy nova (home, painel, criar, vazios, cota, export/import, erros) MUST ter chaves pt-BR e en. Nomes de campanha e lore do mestre MUST NOT ser traduzidos. Erros de API MUST usar códigos mapeáveis.
- Migrações (VI): N/A se só se expuserem campos já existentes. Qualquer coluna nova MUST ser revisão Alembic do controle (`render_as_batch`).

## Clarifications

### Session 2026-09-20

- Q: O que entra em «minhas campanhas» → A: Só campanhas de que o mestre é **dono**
- Q: Depois de criar uma campanha, para onde vai o mestre → A: Permanecer no painel com a campanha nova visível na lista
- Q: Campanhas inactivas no painel → A: Omitir inactivas do painel (e da home)
- Q: Visibilidade por omissão ao criar → A: Pré-seleccionar `listada`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogador chega à mesa listada a partir da home (Priority: P1)

Um jogador (sem conta) abre `/` e vê as campanhas com visibilidade **listada** (nome e sistema). Escolhe uma e vai para `/c/<slug>` (mapa / mesa actual). Campanhas **só por link** não aparecem. Em até **dois cliques** a partir da home está na mesa.

**Why this priority**: Critério-chave de descoberta; substitui o ecrã «não encontrado» da 094 em `/`.

**Independent Test**: Duas campanhas activas, uma `listada` e uma `so_link`. Home anónima mostra só a listada (nome + sistema, sem a `so_link`). Clique → `/c/<slug>` da listada. Abrir o slug da `so_link` na URL continua a funcionar (094).

**Acceptance Scenarios**:

1. **Given** pelo menos uma campanha activa com visibilidade `listada`, **When** um anónimo abre `/`, **Then** vê o nome e o sistema dessa campanha (e das outras `listada` activas).
2. **Given** essa lista, **When** escolhe uma campanha (no máximo dois cliques a partir da home), **Then** abre `/c/<slug>` dessa mesa e vê o conteúdo dessa campanha (não outra).
3. **Given** uma campanha `so_link` activa, **When** abre `/`, **Then** essa campanha **não** aparece (nem nome nem slug). **When** abre `/c/<slug>` dessa campanha, **Then** a mesa carrega como na 094.
4. **Given** zero campanhas `listada` activas, **When** abre `/`, **Then** vê um estado vazio compreensível (pt-BR / en), sem erro técnico.

---

### User Story 2 - Painel «minhas campanhas» isolado entre mestres (Priority: P1)

Um mestre autenticado abre o painel e vê **só** as campanhas **activas** de que é **dono** (incluindo `so_link` e `listada`). Não vê mesas de outro dono nem campanhas inactivas. Co-mestre (se existir no modelo, sem UI) **não** aparece nesta lista — continua a poder abrir `/c/<slug>` se tiver o link (095). Anónimo não vê o painel. Após login sem `?next=`, a app leva ao painel (já não à página mínima da 095).

**Why this priority**: Critério-chave de isolamento; é o sítio de trabalho do mestre.

**Independent Test**: Mestre A dono só de mesa-a; mestre B dono só de mesa-b. Pedido autenticado de A à listagem do painel omite mesa-b (e o inverso). Co-mestre de mesa-a (se fixture CLI) não vê mesa-a em «minhas campanhas». Anónimo recusado. UI de A não mostra o nome/slug de mesa-b.

**Acceptance Scenarios**:

1. **Given** mestre A **dono** de A e não de B, **When** abre o painel autenticado, **Then** vê A (nome, sistema, visibilidade) e **não** vê B.
2. **Given** o mesmo estado, **When** a API de «minhas campanhas» é pedida com a sessão de A, **Then** a resposta não inclui B (0 fugas de nome, slug, cota ou visibilidade).
3. **Given** um anónimo, **When** pede o painel ou a API correspondente, **Then** é recusado / enviado a `/login`.
4. **Given** login bem-sucedido **sem** `next` válido, **When** autentica, **Then** chega ao painel (não à página mínima sem lista da 095). Com `next` interno seguro, o redireccionamento da 095 mantém-se.

---

### User Story 3 - Mestre cria uma campanha na UI (Priority: P1)

No painel, o mestre cria uma campanha com **nome**, **slug**, **sistema** e **visibilidade**. A visibilidade vem **pré-seleccionada em `listada`** (pode mudar para `so_link` antes de gravar). Fica dono. Slug e sistema **não** se alteram depois (093). Módulos seguem os defaults já usados por sistema. Slug inválido, reservado ou ocupado é recusado com erro claro, sem campanha pela metade.

**Why this priority**: Sem criar na UI, o mestre depende só da CLI ou do import (097).

**Independent Test**: Mestre autenticado cria só com nome, slug e sistema (sem mudar visibilidade) → `listada` e aparece na home. Slug duplicado / reservado → recusa. Anónimo não cria.

**Acceptance Scenarios**:

1. **Given** um mestre autenticado e um slug livre, **When** cria com nome, slug, sistema conhecido e visibilidade, **Then** a campanha existe, ele é dono, slug e sistema ficam gravados e imutáveis, a UI **permanece no painel** e a campanha nova está visível em «minhas campanhas» (MUST NOT saltar automaticamente para `/c/<slug>`).
2. **Given** visibilidade `listada`, **When** um jogador abre `/`, **Then** a nova campanha aparece (nome + sistema).
3. **Given** visibilidade `so_link`, **When** um jogador abre `/`, **Then** a nova campanha **não** aparece; o dono vê-a no painel e o link `/c/<slug>` funciona.
4. **Given** slug ocupado, reservado ou malformado, **When** tenta criar, **Then** recusa estruturada (código mapeável, copy pt-BR/en); nenhuma campanha nova.
5. **Given** o formulário de criar, **When** o mestre grava sem alterar o controlo de visibilidade, **Then** a campanha nasce `listada` e um anónimo vê-a na home após refresh.

---

### User Story 4 - Visibilidade, cota, exportar e importar no painel (Priority: P1)

Em cada mesa do painel o mestre vê um **indicador de uso da cota** (096). O **dono** pode **alterar a visibilidade** (`listada` ↔ `so_link`) e **exportar** (097). Qualquer mestre autenticado pode **importar** um zip (097), ficando dono da mesa nova. Co-mestre (se existir no modelo) **não** tem ecrã próprio; não há convite de co-mestre nesta UI. Export na UI falha para quem não é dono, alinhado à API.

**Why this priority**: Fecha o ciclo 096–097 na interface; sem isto a cota e o zip só existem na API/CLI.

**Independent Test**: Dono altera visibilidade → home reflecte. Painel mostra uso (ex. bytes usados vs teto, aviso visual ≥ 90%). Botão exportar (dono) obtém zip; não-dono não exporta. Import de zip válido cria mesa no painel do importador.

**Acceptance Scenarios**:

1. **Given** o dono de uma campanha `listada`, **When** passa a `so_link`, **Then** deixa de aparecer em `/` e continua no painel e em `/c/<slug>`. O inverso também vale.
2. **Given** uma campanha no painel, **When** o mestre a vê, **Then** há indicador de cota (uso vs teto); com uso ≥ 90% o aviso é visível no painel (pt-BR/en), sem banner permanente nas páginas da mesa (096).
3. **Given** o dono, **When** usa exportar, **Then** obtém o pacote da 097. **Given** membro que não é dono, **When** tenta exportar na UI, **Then** a acção não sucede (sem zip).
4. **Given** um mestre autenticado e um zip válido (097), **When** importa no painel, **Then** a campanha nova aparece em «minhas campanhas» (regras de slug da 097) e a UI permanece no painel.

---

### User Story 5 - Nocturne, i18n, telemóvel e vazios (Priority: P2)

Home e painel usam o visual **Nocturne** (079), copy em **pt-BR e en**, e são **utilizáveis em ecrã estreito**. Estados vazios: home sem campanhas listadas; painel sem mesas (convite a criar ou importar).

**Why this priority**: Sem isto a descoberta existe mas parte do produto (C/D) quebra nestes ecrãs novos.

**Independent Test**: Alternar idioma na home e no painel; viewport estreito (ex. ≤800px): lista, criar, cota e botões alcançáveis. Vazios visíveis sem lista fantasma.

**Acceptance Scenarios**:

1. **Given** UI em pt-BR ou en, **When** o utilizador vê home, painel, formulário de criar, vazios, cota e erros, **Then** a copy de interface está nesse idioma (nomes de campanha intactos).
2. **Given** viewport estreito, **When** usa home e painel, **Then** consegue listar, abrir uma mesa, criar, mudar visibilidade e ver a cota sem corte horizontal que impeça a acção.
3. **Given** painel sem campanhas, **When** o mestre entra, **Then** vê estado vazio com caminho para criar e/ou importar.

---

### Edge Cases

- Campanha `activa=false`: MUST NOT aparecer na home pública **nem** em «minhas campanhas». Esta UI MUST NOT activar nem desactivar (CLI 093/095). `/c/<slug>` de campanha inactiva continua 404 opaca (094).
- Home `/` substitui o ecrã «não encontrado» da 094 **nessa rota**. `/c/:slug` inexistente continua «não encontrado». `/relacoes` sem slug: redireccionar para `/` (já não é a entrada da rede).
- Mestre autenticado em `/` vê o **catálogo público** (como o jogador), mais navegação para o painel / logout — MUST NOT substituir `/` pelo inventário privado.
- Cota e metadados de «minhas campanhas» MUST NOT ir na API pública da home.
- Criar: módulos não são pedidos na UI (defaults 093 por sistema). Alterar nome, apagar campanha, mudar sistema/slug: fora desta fase.
- Import no painel: mesmos contratos 097 (allowlist, schema, cota, slug de origem se livre). Erros mapeados na UI.
- Export: só dono; o botão MUST NOT fingir sucesso para co-mestre.
- Co-mestre (CLI, sem UI): MUST NOT ver a campanha em «minhas campanhas»; MAY continuar a administrar em `/c/<slug>` se `require_membro` o permitir (095).
- Convite/reset: continuam rotas globais 095; após activar senha, destino = painel se não houver `next`.
- Sem cadastro aberto; link «Entrar» na home para `/login`.
- Instâncias `/opt/codex-*` intocadas (III).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `GET /` (cliente) MUST mostrar a página inicial **pública** com campanhas **activas** e visibilidade **`listada`**, cada uma com **nome** e **sistema**. MUST NOT listar `so_link` nem inactivas. MUST permitir abrir a mesa em `/c/<slug>` em no máximo dois cliques a partir dessa página.
- **FR-002**: MUST existir API pública de catálogo (sem login) que devolve só essas campanhas listadas (nome, sistema, slug necessário à navegação). MUST NOT incluir `so_link`, cota, membros nem conteúdo da mesa.
- **FR-003**: MUST existir painel do mestre no cliente em `/painel` (slug reservado 093), só com sessão. Sem sessão → `/login` (com retorno seguro ao painel).
- **FR-004**: MUST existir API autenticada de «minhas campanhas» que devolve **apenas** campanhas **activas** de que o utilizador é **dono**. MUST NOT incluir inactivas, campanhas em que é só co-mestre, nem campanhas de outro dono. MUST NOT vazar campanhas de outro mestre. Cada item MUST incluir o necessário ao painel: nome, slug, sistema, visibilidade, indicador de cota (`bytes_usados` / `cota_bytes`, e se ≥ 90%).
- **FR-005**: Após login sem `next` válido, MUST redireccionar para `/painel` (substitui a página mínima da 095). `next` interno seguro mantém-se.
- **FR-006**: Mestre autenticado MUST poder **criar** campanha na UI e na API (nome, slug, sistema conhecido, visibilidade `listada`|`so_link`). Omissão de visibilidade (API ou controlo não alterado na UI) MUST ser **`listada`**. Fica **dono**. Slug e sistema MUST ser imutáveis depois. Módulos = defaults 093. Validação de slug 093. Anónimo MUST NÃO criar. Após criar com sucesso na UI, MUST permanecer em `/painel` com a campanha visível na lista (abrir a mesa é um clique explícito).
- **FR-007**: O **dono** MUST poder alterar só a **visibilidade** da sua campanha (API + UI). Não-dono MUST ser recusado. A home pública MUST reflectir a nova visibilidade.
- **FR-008**: O painel MUST oferecer **exportar** e **importar** segundo a 097 (dono no export; qualquer mestre autenticado no import). Copy e erros na UI. MUST NOT reimplementar o contrato do zip.
- **FR-009**: O painel MUST mostrar indicador de cota por campanha (096). Jogadores na home MUST NOT ver cota.
- **FR-010**: Home e painel MUST ter estados vazios, copy pt-BR e en, visual Nocturne, e uso em viewport estreito (acções principais alcançáveis).
- **FR-011**: MUST existir testes automatizados: catálogo público omite `so_link` e inactivas; listagem do painel de A omite B, omite inactivas e omite campanhas em que A é só co-mestre; anónimo não lê o painel; criar recusa slug inválido e anónimo.
- **FR-012**: MUST NOT oferecer UI de super-admin (criar contas, convites), UI de co-mestre (convidar/remover papéis), cadastro aberto, apagar campanha, nem alterar slug/sistema/módulos após criar.
- **FR-013**: MUST NOT exigir mudanças em `/opt/codex-*`.

### Out of Scope

- Tela/painel de super-admin para criar contas, convites ou atribuir dono (CLI 095).
- UI de co-mestre (convidar, listar papéis, remover); o modelo 095 MAY continuar a existir.
- Apagar/arquivar campanha; alterar nome/slug/sistema/módulos; gerir cota além do indicador.
- Contas de jogador; home autenticada a substituir o catálogo público.
- Corte das instâncias legadas (099).

### Key Entities

- **Catálogo público**: campanhas `activa` + `listada`; nome, sistema, slug; visível a todos.
- **Painel**: inventário privado do **dono** autenticado; só campanhas **activas**.
- **Campanha**: visibilidade editável pelo dono; slug e sistema imutáveis; cota 096; pacote 097.
- **Dono**: criar e importar → dono; listar painel, exportar e visibilidade → dono. Co-mestre sem entrada no painel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir da home pública, um jogador abre uma campanha `listada` em **no máximo dois cliques** e vê essa mesa em `/c/<slug>`.
- **SC-002**: Em 100% dos testes, o painel e a API de «minhas campanhas» do mestre A omitem todas as campanhas de que A **não** é dono (incluindo as de B e aquelas em que A é só co-mestre) e omitem campanhas inactivas mesmo que A seja dono.
- **SC-003**: Em 100% dos testes, a home e o catálogo público omitem campanhas `so_link` (0 nomes/slugs).
- **SC-004**: Um mestre convidado (095) completa login sem `next` e vê o painel em menos de 2 minutos; com zero mesas, o estado vazio oferece criar ou importar.
- **SC-005**: Após criar uma campanha `listada`, um anónimo vê-a na home após refresh; após passar a `so_link`, deixa de a ver na home e o dono continua a vê-la no painel.
- **SC-006**: Home e painel estão utilizáveis em pt-BR e en e num viewport estreito (acções de listar, abrir, criar e ver cota concluídas no fluxo de teste).

## Assumptions

- `/` = catálogo público para todos (incluindo mestre autenticado). `/painel` = inventário privado. Navegação no cabeçalho liga os dois e a `/login`.
- «Minhas campanhas» = campanhas de que o utilizador é **dono**. Co-mestre não entra nesta lista (sem UI de papéis). Exportar e mudar visibilidade = **dono**.
- Destino pós-login sem `next` passa a `/painel` (095 FR-013a actualizado por esta fase). Após **criar** ou **importar** com sucesso na UI, permanecer no painel (não abrir `/c/<slug>` automaticamente).
- Sistemas no formulário criar = os já suportados pela app (077). Módulos não são configuráveis aqui. Visibilidade pré-seleccionada / omissão API = `listada`.
- Indicador de cota: valores da Campanha (`bytes_usados`, `cota_bytes`); limiar visual 90% (096). Sem alterar teto.
- Import/export no cliente = as APIs 097; regras de slug/allowlist/schema intactas.
- Viewport estreito: mesmo espírito 079 (referência ~800px); não exige bottom sheet novo se a lista empilhar.
- `/relacoes` sem slug deixa de ser ecrã morto: redirecciona a `/`.
- Sem schema novo previsto; listagens lêem `control.db`.
- Produção `/opt/codex-*` intocada.

## Notes

- Actualizar 094 (home já não é «não encontrado») e 095 (pós-login → painel) na docs/CHANGELOG na implementação.
- Matriz 095 de rotas admin: incluir criar campanha e PATCH de visibilidade; catálogo público fica fora (é leitura anónima restrita a `listada`).
- CHANGELOG `[Unreleased]`; bump SemVer só se o plano o exigir.
- Próxima fase: 099 (migração legada e corte).
