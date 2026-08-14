# Feature Specification: Filtro de estado na Rede de Relações

**Feature Branch**: `090-relacoes-status-filter`

**Created**: 2026-08-14

**Status**: Implemented

**Input**: User description: "Vamos adicionar um filtro para personagens mortos/desconhecidos/desaparecido/todos, ele deve ficar próximo ao \"Isolar seleção\" já existente."

**Depends on**: Rede de Relações ([066](../066-relationship-network/spec.md)); lista da coluna ([086](../086-relacoes-list-compact/spec.md)); estados de personagem já existentes (vivo, morto, desaparecido, desconhecido)

## Clarifications

### Session 2026-08-14

- Q: Incluir opção «Vivos» além de Todos / Mortos / Desconhecidos / Desaparecido? → A: Sim. Cinco opções: **Todos**, **Vivos**, **Mortos**, **Desconhecidos**, **Desaparecido**. Omissão continua **Todos**.
- Q: Ao filtrar, o palco recalcula os anéis ou esconde no sítio? → A: Recalcular anéis (vista geral e foco) **só** com os personagens que passam no filtro — sem buracos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver só um estado de personagem (Priority: P1)

Na coluna esquerda da Rede, **junto a Isolar selecção**, o utilizador escolhe um filtro de estado: **Todos**, **Vivos**, **Mortos**, **Desconhecidos** ou **Desaparecido**. O palco e a lista passam a mostrar só os personagens visíveis ao papel cujo estado coincide (ou todos, se a escolha for Todos). Os anéis do palco **recalculam-se** com esse conjunto (sem buracos). Isolar selecção continua a funcionar sobre o conjunto já filtrado.

**Why this priority**: Com muitos discos, mortos, desaparecidos e desconhecidos misturam-se com os vivos; um filtro ao pé de Isolar permite focar um estado (incluindo só vivos) sem procurar no palco.

**Independent Test**: Abrir `/relacoes` com pelo menos um personagem em cada estado; o controlo aparece junto a Isolar; escolher Mortos esconde os outros estados no palco e na lista e o anel fecha-se sobre os mortos (sem espaços vazios); Vivos esconde mortos/desaparecidos/desconhecidos; Todos restaura o conjunto visível ao papel.

**Acceptance Scenarios**:

1. **Given** a Rede com personagens em vários estados, **When** o utilizador olha a coluna esquerda, **Then** vê o filtro de estado **junto a Isolar selecção** (mesmo bloco, abaixo da lista e antes da legenda).
2. **Given** o filtro em **Todos** (omissão), **When** observa palco e lista, **Then** o conjunto é o mesmo de hoje (todos os personagens visíveis ao papel, sujeitos à busca e aos chips de tipo).
3. **Given** o filtro em **Mortos**, **When** observa palco e lista, **Then** só aparecem personagens com estado morto; linhas de vínculo só ligam personagens que continuam visíveis.
4. **Given** o filtro em **Vivos**, **Desconhecidos** ou **Desaparecido**, **When** observa palco e lista, **Then** só aparecem personagens com esse estado.
5. **Given** um personagem seleccionado que deixa de coincidir com o filtro, **When** o filtro muda, **Then** a selecção fecha (painel de detalhe fecha) — o palco não fica focado num disco escondido.
6. **Given** Isolar selecção activo e um personagem seleccionado que **passa** no filtro, **When** observa o palco, **Then** Isolar continua a mostrar só o focado e as conexões directas **que também passam** no filtro de estado.
7. **Given** o filtro em **Vivos** (ou outro estado) com vários personagens nesse estado, **When** observa o palco sem selecção, **Then** os discos visíveis formam os anéis habituais **sem** buracos onde estavam os filtrados; ao voltar a **Todos**, o layout volta ao conjunto completo.

---

### Edge Cases

- Nenhum personagem no estado escolhido (e não é Todos): palco e lista vazios com estado vazio amigável (não um branco sem explicação).
- Personagem sem estado gravado: trata-se como **desconhecido** (já é a omissão actual nas fichas).
- **Vivos**: opção própria; não inclui mortos, desaparecidos nem desconhecidos.
- Busca por nome: aplica-se **dentro** do conjunto já filtrado por estado.
- Chips de tipo de vínculo: continuam a filtrar linhas; um disco sem linhas visíveis por causa dos chips pode continuar visível se o estado passar.
- Isolar sem selecção: Isolar continua sem efeito no palco até haver foco; o filtro de estado aplica-se na mesma.
- Hover na lista: só destaca discos que o filtro deixou no palco.
- Jogador vs GM: o filtro **não** revela personagens que as regras de visibilidade já escondem.
- Trocar de Mortos (ou Vivos) para Todos: o conjunto volta ao completo visível ao papel; Isolar, se estava ligado, aplica-se de novo sobre esse conjunto.
- Persistência: o filtro **não** grava entre sessões (como Isolar); ao recarregar a página volta a **Todos**.
- Isolar **depois** do recálculo: esconde no sítio (como hoje) sobre o layout já filtrado — não volta a meter os estados excluídos.
- Discos arrastados na sessão: o recálculo usa o layout automático do conjunto filtrado; offsets de arrasto dos nós que **continuam** visíveis comportam-se como hoje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A coluna esquerda MUST incluir um filtro de estado **junto a Isolar selecção** (mesmo bloco de controlos do palco, abaixo da lista de personagens e antes da legenda).
- **FR-002**: O filtro MUST oferecer exactamente as opções **Todos**, **Vivos**, **Mortos**, **Desconhecidos** e **Desaparecido** (escolha única). A omissão MUST ser **Todos**.
- **FR-003**: Com uma opção diferente de Todos, palco e lista MUST mostrar só personagens visíveis ao papel cujo estado coincide com a opção. Com Todos, MUST mostrar o conjunto visível habitual.
- **FR-004**: Linhas de vínculo MUST ocultar-se se algum extremo estiver escondido pelo filtro de estado.
- **FR-005**: Isolar selecção MUST aplicar-se **depois** do filtro de estado (não o substitui nem o ignora).
- **FR-006**: A busca da coluna MUST filtrar nomes apenas dentro do conjunto já restrito pelo estado.
- **FR-007**: Se o personagem seleccionado deixar de passar no filtro, a selecção MUST ser limpa (mesmo efeito que desseleccionar no palco).
- **FR-008**: O filtro MUST usar os mesmos nomes de estado já usados nas fichas (Todos / Vivo / Morto / Desconhecido / Desaparecido), nos dois idiomas da interface.
- **FR-009**: O filtro MUST NOT persistir após recarregar a página (volta a Todos).
- **FR-010**: Ao mudar o filtro de estado, o palco MUST recalcular os anéis da vista geral e do foco **apenas** com os personagens que passam no filtro (e visíveis ao papel). MUST NOT deixar buracos nas posições de quem foi filtrado. Isolar selecção MUST continuar a esconder no sítio sobre esse layout já recalculado.

### Out of Scope

- Escolher vários estados ao mesmo tempo (multi-selecção).
- Filtro de estado no mapa geográfico (aba Locais / NPCs).
- Novo campo ou valor de estado na ficha (reutiliza vivo / morto / desaparecido / desconhecido).
- Guardar a escolha do filtro no servidor ou no browser entre visitas.
- Alterar o aspecto dos discos mortos (já dessaturados / nome riscado).

### Key Entities

- **Filtro de estado**: escolha única na coluna (Todos | Vivos | Mortos | Desconhecidos | Desaparecido), junto a Isolar selecção; restringe palco e lista.
- **Estado do personagem**: valor já existente na ficha (vivo, morto, desaparecido, desconhecido); ausente conta como desconhecido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com ≥1 personagem em cada estado, um avaliador aplica o filtro Mortos e, em **≤5 segundos**, confirma que **100%** dos discos e nomes visíveis são mortos e que **0** vivos/desaparecidos/desconhecidos restam no palco ou na lista.
- **SC-001b**: Com o filtro em **Vivos**, **100%** dos discos e nomes visíveis são vivos e **0** mortos/desaparecidos/desconhecidos restam no palco ou na lista.
- **SC-002**: Em **3 em 3** observações, o controlo está visível **junto a Isolar selecção**, sem ser preciso procurar noutro sítio da coluna.
- **SC-003**: Com o filtro em Todos, palco e lista coincidem com o comportamento anterior (regressão zero de conjunto, salvo Isolar/busca/chips como hoje).
- **SC-004**: Em **100%** dos testes, Isolar + filtro Mortos nunca mostra um vizinho vivo; Isolar + filtro Vivos nunca mostra um vizinho morto; Todos restaura os vizinhos do outro estado (se Isolar e a visibilidade o permitirem).
- **SC-005**: Recarregar `/relacoes` deixa o filtro em **Todos** em **3 em 3** tentativas.
- **SC-006**: Em **3 em 3** observações com filtro Vivos (e ≥4 vivos visíveis), o palco **não** mostra espaços vazios onde estavam mortos/desaparecidos/desconhecidos; os vivos ocupam anéis contínuos.

## Assumptions

- As opções são escolha **única** (não chips acumuláveis); **Todos** = sem restrição de estado; **Vivos** / **Mortos** / **Desconhecidos** / **Desaparecido** = um estado cada.
- O filtro restringe **palco e lista** em conjunto (paridade da 086: o que a lista mostra é o que o palco pode mostrar, para aquele papel).
- «Desaparecido» (singular no pedido) = o estado já existente `desaparecido`; o rótulo na UI segue o plural/singular já usado nas fichas.
- Isolar, chips de tipo e busca não mudam de significado — o estado é uma restrição a mais, aplicada primeiro; o layout de anéis usa o conjunto **após** o filtro de estado, **antes** do Isolar.
- Sem dados novos nem migração: o estado já vem na ficha.
- Controlos de palco (Isolar + este filtro) ficam agrupados para o mestre/jogador não os confundir com a lista de nomes.
