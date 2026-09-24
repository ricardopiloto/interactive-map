# Feature Specification: Rede de Relações

**Feature Branch**: `105-rede-relacoes`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Rede de Relações. Trocar as 8 cores de vínculo pelas 4 famílias do RFC, distinguindo o tipo pelo estilo da linha (sólida grossa, fina, pontilhada, dupla, tracejada) e pelo rótulo. Rótulos de aresta só na seleção ou no hover. Mínimo de 12px nos rótulos de nó. Unir chips de filtro e legenda em um único controle. Painel de detalhe com retrato opcional (sem placeholder grande). Navegação por teclado e aria nos nós. Melhorar a visão geral para reduzir linhas longas cruzando o palco. Depende de: UX-2. Critério-chave: nenhum tipo depende só de cor para ser reconhecido; contraste das linhas ≥ 3:1 nos dois temas."

**Depends on**: [101-componentes-base-icones](../101-componentes-base-icones/spec.md) (UX-2); [100-fundacoes-sistema-visual](../100-fundacoes-sistema-visual/spec.md) (UX-1); [102-estrutura-navegacao](../102-estrutura-navegacao/spec.md) (UX-3 — Implemented); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) §5 e fase UX-6); constituição v1.0.0 (III, IV, V).

**Phase**: UX-6. Apresentação e interação do **grafo de relações**. **MUST NOT** alterar o modelo de vínculos na API (os 8 tipos continuam a existir como dados); só a **codificação visual** e a UI de filtro/legenda/detalhe/a11y/layout do palco.

## Clarifications

### Session 2026-09-21

- Q: Como fica o controlo unificado filtro + legenda? → A: Chips de tipo com amostra de estilo de linha (filtro = legenda)
- Q: Como se navega por teclado entre os nós do grafo? → A: Tab / Shift+Tab entre nós; Enter ou Espaço selecciona
- Q: Como reduzir linhas longas a cruzar o palco na visão geral? → A: Arestas curvas / offset (layout em anéis mantém-se)
- Q: Onde vivem os chips unificados (filtro = legenda de tipos)? → A: Só na coluna; palco sem legenda de tipos (chave PJ/NPC ok)
- Q: Descrição vazia no detalhe do personagem? → A: Omitir o bloco (sem placeholder «Sem descrição.»)

## Constitution

- Isolamento (I): grafo só da campanha do slug; sem rotas novas de conteúdo.
- Testes primeiro (II): «nenhum tipo só por cor» e contraste das linhas ≥ 3:1 nos dois temas MUST ser verificáveis (checklist + extensão do script de contraste / pares de linha onde aplicável).
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): tokens UX-1 + componentes UX-2; sem motor de grafo novo salvo justificação no plano.
- i18n (V): copy nova (filtro unificado, legenda, a11y) MUST ter pt-BR e en. Nomes/notas do mestre MUST NOT ser traduzidos.
- Migrações (VI): N/A (sem schema).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quatro famílias + estilo de linha (Priority: P1)

As arestas deixam de usar oito matizes independentes. Passam a **quatro famílias de cor** (Afinidade, Laço, Hostil, Neutro). O **tipo exacto** distingue-se pelo **estilo da linha** (sólida grossa, sólida fina, pontilhada, dupla, tracejada / tracejada curta) **e** pelo **rótulo** — nunca só pela cor.

**Why this priority**: Critério-chave de reconhecimento sem depender só de cor; acessibilidade cromática.

**Independent Test**: Em escala de cinzentos (ou com daltonismo simulado), tipos da mesma família ainda se distinguem por traço/rótulo. Em tema claro e escuro, o contraste linha–fundo do palco cumpre ≥ 3:1.

**Acceptance Scenarios**:

1. **Given** os oito tipos de vínculo existentes nos dados, **When** se desenham no grafo, **Then** usam a família de cor e o estilo de linha do RFC (Aliado grossa, Amizade fina, Romance sólida, Família pontilhada, Vínculo de Sangue dupla, Inimizade sólida, Adversário tracejada, Conhecido tracejada curta).
2. **Given** dois tipos da mesma família, **When** um revisor os compara sem depender da cor, **Then** o estilo de linha e/ou o rótulo bastam para os distinguir.
3. **Given** tema claro e tema escuro, **When** se mede o contraste das cores de linha das famílias sobre o fundo do palco, **Then** cada família atinge **≥ 3:1**.

---

### User Story 2 - Rótulos de aresta e de nó legíveis (Priority: P1)

Os **rótulos de aresta** (tipo / qualificadores) só aparecem na **selecção** ou no **hover** da aresta — não permanentemente em todas as linhas. Os **rótulos de nó** (nome do personagem) usam **no mínimo 12 px**.

**Why this priority**: RFC (rótulos de aresta quase invisíveis / ruído; texto 9–11 px).

**Independent Test**: Zoom/vista normal sem hover → arestas sem rótulo permanente; hover/selecção → rótulo legível; nomes de nó ≥ 12 px.

**Acceptance Scenarios**:

1. **Given** o grafo sem hover nem aresta seleccionada, **When** se observa o palco, **Then** as arestas **não** mostram todas o rótulo de tipo ao mesmo tempo.
2. **Given** hover ou selecção de uma aresta, **When** o rótulo aparece, **Then** identifica o tipo (e qualificadores se existirem) de forma legível.
3. **Given** nós com nome, **When** se mede o tamanho do texto do rótulo do nó, **Then** é **≥ 12 px**.

---

### User Story 3 - Filtro e legenda unificados; detalhe sem placeholder grande (Priority: P1)

Os chips de filtro e a legenda de tipos/famílias passam a um **único controlo**: cada tipo é um **chip clicável** (filtro) que já mostra a **amostra do estilo de linha** (legenda). Não há bloco de legenda separado a repetir as mesmas categorias. O painel de detalhe do personagem mostra **retrato opcional** quando existe; **sem** placeholder grande de imagem quando não há retrato.

**Why this priority**: Reduz clutter da coluna; detalhe mais calmo.

**Independent Test**: Um só sítio de UI (chips com amostra) para filtrar e entender categorias; personagem sem retrato não ocupa um bloco vazio grande de imagem.

**Acceptance Scenarios**:

1. **Given** a coluna da Rede, **When** o utilizador filtra ou consulta o significado das categorias, **Then** o faz nos **chips unificados na coluna** (filtro + amostra de linha); o palco **não** mostra legenda dos 8 tipos (chave PJ/NPC permitida).
2. **Given** personagem **com** retrato, **When** abre o detalhe, **Then** o retrato pode aparecer de forma discreta.
3. **Given** personagem **sem** retrato, **When** abre o detalhe, **Then** **não** há placeholder grande de imagem a ocupar o painel.
4. **Given** personagem **sem** descrição, **When** abre o detalhe, **Then** **não** se mostra «Sem descrição.» (nem equivalente).

---

### User Story 4 - Teclado, aria e visão geral menos cruzada (Priority: P2)

Os **nós** são navegáveis por **teclado**: **Tab** / **Shift+Tab** movem o foco entre nós; **Enter** ou **Espaço** selecciona o nó focado. Expõem **ARIA** adequada (nome, selecção). A **visão geral** mantém o layout em anéis; as **arestas** usam **ligeira curvatura / offset** para reduzir cruzamentos longos no centro do palco, sem mudar os dados dos vínculos.

**Why this priority**: a11y e legibilidade do grafo; secundário à codificação de arestas.

**Independent Test**: Tab move o foco entre nós; Enter/Espaço selecciona; leitor de ecrã anuncia o nó; vista com muitos vínculos mostra menos atravessamentos óbvios que o baseline (checklist visual).

**Acceptance Scenarios**:

1. **Given** o palco focado, **When** o utilizador usa Tab / Shift+Tab, **Then** o foco move-se entre nós; **When** pressiona Enter ou Espaço, **Then** selecciona o nó focado.
2. **Given** um nó, **When** tecnologias assistivas o inspeccionam, **Then** há nome acessível e estado de selecção comunicável.
3. **Given** um grafo denso de demonstração, **When** se observa a visão geral, **Then** as arestas usam curvatura/offset (anéis mantidos) e há menos cruzamentos longos no centro face ao baseline recto (checklist).

---

### Edge Cases

- Vínculo com `tipo_ab` / `tipo_ba` diferentes: cada sentido (ou a representação actual da app) MUST mapear para família+estilo correctos; rótulo no hover reflecte o que a UI já mostra.
- Filtro activo que esconde todos os nós: EmptyState (UX-2), não palco em branco sem explicação.
- Tema claro/escuro: cores de família do RFC; se o script de contraste falhar, ajustar tokens de família até ≥ 3:1 **sem** voltar a 8 matizes soltos.
- Modo edição (UX-3/UX-5): esta fase MUST NOT exigir esconder criação de vínculos; MAY coexistir. Fora de escopo redesenhar formulário de vínculo (UX-8).
- `/opt/codex-*` intocado; sem mudança de API de personagens/vínculos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST mapear os 8 tipos de vínculo para as **4 famílias** e **estilos de linha** do RFC (§5). O tipo MUST ser reconhecível por estilo de linha e/ou rótulo — **MUST NOT** depender só da cor.
- **FR-002**: Cores de linha das famílias MUST atingir contraste **≥ 3:1** sobre o fundo do palco nos temas claro e escuro.
- **FR-003**: Rótulos de aresta MUST aparecer só na selecção ou no hover da aresta.
- **FR-004**: Rótulos de nó MUST ter tamanho mínimo de **12 px**.
- **FR-005**: MUST unificar chips de filtro e legenda num **único controlo na coluna**: chips de tipo com amostra do estilo de linha. O palco MUST NOT repetir a legenda dos 8 tipos; MAY manter só a chave PJ/NPC.
- **FR-006**: Painel de detalhe MUST permitir retrato opcional e MUST NOT usar placeholder grande quando não há retrato. MUST NOT mostrar «Sem descrição.» / equivalente quando a descrição está vazia.
- **FR-007**: Nós MUST ser navegáveis por teclado com **Tab** / **Shift+Tab** e activáveis com **Enter** ou **Espaço**; MUST expor ARIA adequada (nome; selecção).
- **FR-008**: MUST melhorar a visão geral desenhando arestas com **ligeira curvatura / offset** (layout em anéis mantém-se), para reduzir linhas longas cruzando o palco — sem alterar dados persistidos.
- **FR-009**: MUST NOT alterar contratos de API nem o conjunto de tipos armazenados. MUST NOT exigir `/opt/codex-*`.
- **FR-010**: Copy nova MUST ter pt-BR e en. Estilos MUST usar tokens UX-1 (famílias como tokens de vínculo, não hex soltos fora do sistema de tokens).

### Out of Scope

- Formulário completo de vínculo / drawer (UX-8).
- Listas do mapa (UX-5), planeador de rotas (UX-7), chrome (UX-3) além de coexistir.
- Novos tipos de vínculo no backend ou fusão de enums.
- Corte legado (099).

### Key Entities

- **Família de vínculo**: Afinidade | Laço | Hostil | Neutro (cor partilhada).
- **Estilo de linha**: grossa / fina / pontilhada / dupla / tracejada (tipo exacto).
- **Controlo unificado**: filtro + legenda.
- **Nó**: personagem no grafo; foco teclado + nome ≥ 12 px.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste de reconhecimento sem cor (escala de cinzentos ou revisão cega à matiz), **nenhum** dos 8 tipos fica indistinguível dos outros da mesma família só por falta de traço/rótulo.
- **SC-002**: Em 100% dos pares família–fundo do palco nos dois temas, o contraste da linha é **≥ 3:1** (script ou medição documentada na aceitação).
- **SC-003**: Sem hover/selecção, o palco **não** mostra rótulos de tipo em todas as arestas em simultâneo.
- **SC-004**: Rótulos de nó medem **≥ 12 px**.
- **SC-005**: Existe um único controlo de filtro/legenda na coluna; o detalhe sem retrato **não** mostra placeholder grande; descrição vazia **não** mostra «Sem descrição.».

## Assumptions

- Os 8 valores de `VinculoTipo` no modelo mantêm-se; só muda o mapa visual → família + stroke.
- Tabela RFC §5 é a fonte de verdade do mapeamento tipo → estilo.
- Cores de família vivem em tokens UX-1; gate anti-hex e contraste ≥ 3:1.
- Curvatura de arestas: parâmetro único no plano (SVG path).
- CHANGELOG `[Unreleased]`; sem `/opt`.

## Notes

- Critério-chave: nenhum tipo só por cor; contraste linhas ≥ 3:1.
- Clarify 2026-09-21 fechado (5/5): chips na coluna; Tab/Enter; arestas curvas; sem legenda tipos no palco; omitir «Sem descrição.» no detalhe.
- Próximo: `/speckit-plan`.
- Critério-chave: nenhum tipo só por cor; contraste de linhas ≥ 3:1 nos dois temas.
- Próximo: `/speckit-clarify` (opcional) ou `/speckit-plan` (após UX-2).
