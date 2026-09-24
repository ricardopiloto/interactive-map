# Feature Specification: Rede de rotas — entrada em Rota e casca visual

**Feature Branch**: `118-rede-rotas-entrada`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Rede de rotas: mover a entrada pra Rota e migrar a casca visual pros tokens novos. Não mexe em nenhuma outra spec — as specs 114, 115 e 116 já estão feitas e não precisam rodar de novo. Fonte da verdade — protótipo RouteDigitizer + RotaPage (botão «Rede de rotas» no topo, GM-only, digitalizador em tela cheia). PRD hoje: item no menu GM do Mapa; remover só esse item (menu permanece se ainda tiver outras acções). RotaPage ganha o botão; mesmo digitalizador, sem duplicar. Casca: zoom em pílula/círculo (mesma forma do mapa pós-115), «Novo nó»/«Traçar segmento» como chips, lista no padrão do painel flutuante, campo de escala — só CSS. Fora de escopo: lógica de digitalização (nós, segmentos, pontos intermediários, escala). Critério-chave: Mapa não abre mais Rede de rotas pelo menu GM; Rota abre; captura do digitalizador bate com o protótipo a olho nu; comportamento de digitalização inalterado."

**Depends on**: Spec **115** (tokens de zoom translúcido / pílula-círculo no mapa — **reaproveitar**; não reabrir 114–116). Specs **114**, **116** e **117** já entregues — esta feature MUST NOT reescrevê-las nem exigir re-execução.

**Phase**: Entrada GM + paridade visual do digitalizador com o protótipo.

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem rotas HTTP novas; UI sobre APIs e digitalizador já existentes. Matriz isolamento **N/A**.
- Testes primeiro (II): UI de polimento — quickstart/capturas (claro/escuro) MAY; sem schema/auth.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Reutilizar o digitalizador e o motor de rede já entregues; MUST NOT duplicar o componente nem alterar a lógica de traço (incluindo pontos intermediários).
- i18n (V): Strings novas ou relocadas de UI (rótulo do botão, aria do digitalizador se novas) MUST ter pt-BR e en; nomes de nós/notas do mestre MUST NOT ser traduzidos.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrada «Rede de rotas» na página Rota (Priority: P1) 🎯 MVP

Um mestre em **Modo edição** abre a página **Rota**. No topo da área do mapa vê um botão **«Rede de rotas»** (só para quem pode editar). Ao activá-lo, o **mesmo** digitalizador de rede que já existia abre em **tela cheia** sobre a área do mapa — sem um segundo produto de digitalização. Na página **Mapa**, o menu de ferramentas do GM **já não** oferece «Rede de rotas»; as restantes acções desse menu (criar personagem, arco, mover grupo, etc.) **permanecem**.

**Why this priority**: Critério-chave de descoberta — a rede alimenta o planejador; a entrada deve viver onde se planeia a viagem, não escondida no menu do Mapa.

**Independent Test**: Com Modo edição ligado, abrir Mapa e confirmar ausência do item «Rede de rotas» no menu GM (menu ainda disponível se houver outras acções); abrir Rota, clicar «Rede de rotas», confirmar digitalizador em tela cheia; jogador sem edição não vê o botão.

**Acceptance Scenarios**:

1. **Given** Modo edição activo e página Rota aberta, **When** o mestre vê a área do mapa, **Then** existe um controlo visível «Rede de rotas» no topo (GM-only).
2. **Given** o botão «Rede de rotas», **When** o mestre o activa, **Then** o digitalizador existente abre em tela cheia dentro da área do mapa (mesmo fluxo de nós/segmentos/escala já conhecido).
3. **Given** página Mapa com Modo edição, **When** o mestre abre o menu de ferramentas GM, **Then** **não** existe entrada para Rede de rotas; as outras entradas do menu que já existiam continuam presentes.
4. **Given** visitante sem Modo edição (ou sem permissão de editar), **When** abre Rota, **Then** o botão «Rede de rotas» **não** aparece.
5. **Given** o digitalizador aberto a partir de Rota, **When** o mestre encerra/sai, **Then** regressa à página Rota com o planejador/mapa no estado esperado (sem ficar preso no digitalizador).

---

### User Story 2 - Casca visual alinhada ao protótipo (Priority: P1)

Com o digitalizador aberto, o mestre vê controlos de **zoom** em forma de **pílula/círculo** (mesma linguagem visual do mapa pós-115), acções **«Novo nó»** e **«Traçar segmento»** com aspecto de **chips**, a **lista** de nós/segmentos no padrão do **painel flutuante** já usado no Mapa/Rota, e o **campo de escala** do mapa — tudo com cantos e sombras da paleta actual (não a casca antiga de cantos quadrados/sombra antiga). O que o digitalizador **faz** (criar nó, traçar segmento com pontos intermediários, editar escala, pesquisar/apagar na lista) **não muda**.

**Why this priority**: Fecha a diferença a olho nu face ao protótipo sem risco de regressão funcional.

**Independent Test**: Abrir o digitalizador; capturar barra de ferramentas + zoom + painel de lista + escala; comparar lado a lado com o RouteDigitizer do protótipo e com o zoom do Mapa pós-115; repetir um fluxo curto de nó + segmento (com ponto intermediário se aplicável) e confirmar comportamento idêntico ao pré-feature.

**Acceptance Scenarios**:

1. **Given** digitalizador aberto, **When** o mestre observa os controlos de zoom, **Then** têm a mesma forma pílula/círculo translúcida do zoom do Mapa (pós-115), sem diferença a olho nu face ao protótipo.
2. **Given** digitalizador aberto, **When** o mestre observa «Novo nó» e «Traçar segmento», **Then** apresentam-se como chips (estado activo distinguível), alinhados ao protótipo.
3. **Given** digitalizador aberto, **When** o mestre usa a lista de nós/segmentos, **Then** a casca segue o padrão do painel flutuante (busca/lista) do Mapa/Rota, sem restaurar a lista com estilo antigo.
4. **Given** digitalizador aberto, **When** o mestre vê/edita a escala do mapa, **Then** o campo permanece disponível com a mesma função de sempre; só a casca visual pode mudar.
5. **Given** qualquer fluxo de digitalização já suportado (incl. pontos intermediários no traço), **When** o mestre o executa após a feature, **Then** o resultado e os passos são os mesmos de antes — apenas a aparência dos controlos mudou.

---

### Edge Cases

- Menu GM no Mapa com outras acções: remover só Rede de rotas; **não** eliminar o menu inteiro.
- Se no futuro o menu ficar só com Rede de rotas (já não é o caso actual): aí sim o contentor do menu poderia desaparecer — **hoje** o menu permanece.
- Digitalizador aberto e troca de aba/navegação: comportamento de fecho/estado segue o já existente; esta feature MUST NOT introduzir novo ciclo de vida de estado além de mudar o ponto de abertura.
- Campanha sem imagem de mapa / sem waypoints: digitalizador continua a degradar como hoje (mensagem/estado vazio); só a entrada e a casca mudam.
- Idioma en: rótulo do botão e strings de casca do digitalizador permanecem correctas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página **Rota** MUST expor um controlo «Rede de rotas» visível apenas quando o utilizador pode editar (Modo edição / GM), no topo da área do mapa, alinhado ao protótipo.
- **FR-002**: Activar esse controlo MUST abrir o **mesmo** digitalizador de rede já usado pelo produto (tela cheia sobre a área do mapa); MUST NOT criar um segundo digitalizador paralelo.
- **FR-003**: A página **Mapa** MUST NOT oferecer abertura da Rede de rotas a partir do menu de ferramentas GM; esse item MUST ser removido.
- **FR-004**: O menu de ferramentas GM no Mapa MUST permanecer se ainda contiver outras acções após remover Rede de rotas.
- **FR-005**: A casca visual do digitalizador (zoom, chips de modo, lista/painel, escala e elementos com raio/sombra da paleta antiga) MUST alinhar-se ao RouteDigitizer do protótipo e aos tokens/formas de zoom já usados no Mapa desde a spec 115.
- **FR-006**: O comportamento de digitalização MUST NOT mudar: criar nó, traçar segmento, pontos intermediários, escala do mapa, pesquisa/remoção na lista e persistência existente permanecem iguais.
- **FR-007**: Specs 114, 115 e 116 MUST NOT ser reabertas nem reimplementadas por esta feature; só se reaproveitam os padrões visuais já entregues (em especial zoom/painel da 115).
- **FR-008**: Strings de UI novas ou relocadas MUST existir em pt-BR e en.

### Key Entities

- **Entrada Rede de rotas**: Controlo GM-only na página Rota que abre o digitalizador; deixa de existir como item do menu GM do Mapa.
- **Digitalizador de rede**: Superfície tela cheia para nós, segmentos e escala que alimentam o planejador — mesma lógica, casca actualizada.
- **Menu de ferramentas GM (Mapa)**: Agrupa acções de edição restantes no Mapa; sobrevive sem a entrada de Rede de rotas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das sessões de teste com Modo edição, o menu GM do Mapa **não** inicia a Rede de rotas; o botão em Rota **sim** (revisão manual &lt; 2 minutos).
- **SC-002**: Captura do digitalizador aberto (desktop, claro e escuro) alinhada ao RouteDigitizer do protótipo — zoom pílula/círculo, chips de modo, lista estilo painel flutuante, escala — sem diferença a olho nu para um revisor humano.
- **SC-003**: Um fluxo de regressão (criar nó + traçar segmento com ponto intermediário + ajustar escala, se aplicável) completa com o **mesmo** resultado funcional que antes da feature em 100% das tentativas do teste.
- **SC-004**: Visitante sem edição: 0 aparições do botão «Rede de rotas» na página Rota.
- **SC-005**: 100% das strings novas/relocadas de casca correctas em pt-BR e en.

## Assumptions

- O digitalizador actual do produto já implementa pontos intermediários e escala; o protótipo simplifica o traço, mas a **referência visual** (chips, zoom, painel, escala) é o protótipo — a **referência de comportamento** é o digitalizador actual do produto.
- O menu GM do Mapa, no estado actual do produto, contém outras acções além de Rede de rotas; por isso o menu **não** é removido nesta feature.
- Spec 115 já definiu a linguagem de zoom translúcido pílula/círculo no mapa; esta feature **reusa** essa linguagem no digitalizador, sem redesenhar o mapa.
- Não há mudança de API, schema ou permissões: só quem já podia digitalizar continua a poder.
- i18n: o rótulo «Rede de rotas» / equivalente en pode já existir (ex. chave usada no menu); relocá-lo para o botão de Rota é suficiente se a string já estiver traduzida.
