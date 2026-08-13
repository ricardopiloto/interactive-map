# Feature Specification: Novos Tipos de Vínculo (Rede de Relações)

**Feature Branch**: `081-novos-tipos-vinculo`

**Release**: Codex **0.16.0** (pós-v2.0.0)

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Adicionar **Adversário** e **Vínculo de Sangue** aos 6 tipos actuais na Rede de Relações, com linguagem visual distinta e suporte completo em GM, grafo, filtros e documentação de produto — sem novos campos na base de dados.

**Depends on**: [080-i18n-interface](../080-i18n-interface/spec.md) (labels PT/EN); Rede de Relações existente (tipos, qualificador, direcção)

**Source**: Proposta «Novos Tipos de Vínculo» — secção 6 de [`docs/feature-rede-relacoes.md`](../../docs/feature-rede-relacoes.md) (a aplicar quando esta frente fechar)

## Clarifications

### Session 2026-08-13

- Q: Ao seleccionar «Vínculo de Sangue» no modo recíproco, quando deve aplicar-se a direcção pré-preenchida A→B? → A: Sempre ao seleccionar o tipo (criar ou editar) — define `a_para_b`; editável antes de guardar.
- Q: Qual o rótulo EN canónico para `vinculo_sangue`? → A: **Blood Bond**.
- Q: Qual a ordem canónica dos 8 tipos na legenda, filtros e formulário? → A: Inserção semântica — Aliado → Vínculo de Sangue → Amizade → Inimizade → Adversário → Romance → Família → Conhecido.
- Q: Qual o ficheiro canónico de documentação de produto a actualizar? → A: Apenas `docs/feature-rede-relacoes.md` (sec. 6, 6.1, 11, 3.1).
- Q: Quais as sugestões de qualificador para **Adversário**? → A: As mesmas de **Inimizade** — Rival, Traidor, Antigo aliado (mais Medo, como nos outros tipos).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e editar vínculos com os novos tipos (Priority: P1)

Como mestre, quero escolher **Adversário** ou **Vínculo de Sangue** ao criar ou editar uma conexão, com os mesmos fluxos que os tipos actuais (modo recíproco, duas vias, qualificador, direcção, notas).

**Why this priority**: Sem seleção nos formulários GM, os tipos novos não existem na prática.

**Independent Test**: Modo GM → nova conexão → tipo **Adversário** → guardar → reabrir e confirmar persistência; repetir com **Vínculo de Sangue**.

**Acceptance Scenarios**:

1. **Given** Modo GM, **When** crio vínculo com tipo **Adversário**, **Then** grava e reaparece no formulário e na ficha do personagem.
2. **Given** Modo GM, **When** crio ou edito vínculo em modo recíproco e selecciono tipo **Vínculo de Sangue**, **Then** direcção pré-preenchida como **A→B** (`a_para_b`); editável antes de guardar; grava com sucesso.
3. **Given** vínculo existente com um dos 6 tipos legados, **When** abro edição, **Then** comportamento inalterado.

---

### User Story 2 - Grafo, legenda e filtros reflectem 8 tipos (Priority: P1)

Como utilizador na Rede, quero ver linhas, chips de filtro e legenda com **8 cores/estilos** distintos, incluindo cobre (Adversário) e violeta escuro (Vínculo de Sangue).

**Why this priority**: A distinção visual é o motivo de serem tipos e não qualificadores.

**Independent Test**: Abrir Relações → legenda lista 8 tipos → filtrar por **Adversário** → só arestas desse tipo visíveis; linha com cor cobre.

**Acceptance Scenarios**:

1. **Given** vínculo **Adversário**, **When** visualizo no grafo, **Then** linha **sólida** em tom cobre/laranja queimado (distinto de Inimizade).
2. **Given** vínculo **Vínculo de Sangue** com direcção A→B, **When** visualizo no grafo, **Then** linha **sólida** violeta escuro com indicação direccional coerente com tipos assimétricos existentes.
3. **Given** coluna esquerda (legenda/filtros), **When** abro Relações, **Then** listo **8** tipos com etiquetas traduzidas (PT/EN), nesta ordem: Aliado, Vínculo de Sangue, Amizade, Inimizade, Adversário, Romance, Família, Conhecido.

---

### User Story 3 - Qualificadores e documentação alinhados (Priority: P2)

Como mestre, quero que **Lacaio** apareça como qualificador sugerido em **Aliado** e **Vínculo de Sangue**, que **Adversário** partilhe as sugestões de **Inimizade**, e que a documentação de produto descreva os 8 tipos e a fronteira agnóstica (coerção sobrenatural).

**Why this priority**: Reforça o modelo mental proposto sem inventar tipos extra (Lacaio continua qualificador).

**Independent Test**: Formulário de vínculo tipo Aliado → autocomplete qualificador inclui **Lacaio**; [`docs/feature-rede-relacoes.md`](../../docs/feature-rede-relacoes.md) actualizado na secção 6.

**Acceptance Scenarios**:

1. **Given** tipo **Aliado** ou **Vínculo de Sangue**, **When** edito qualificador, **Then** **Lacaio** está entre sugestões (como Mentor, Medo, etc.).
2. **Given** tipo **Adversário**, **When** edito qualificador, **Then** as sugestões são as de **Inimizade**: Rival, Traidor, Antigo aliado (e Medo).
3. **Given** documento [`docs/feature-rede-relacoes.md`](../../docs/feature-rede-relacoes.md), **When** frente fechada, **Then** tabela de tipos tem 8 entradas; nota agnóstica sobre coerção sobrenatural presente.

---

### Edge Cases

- Vínculo **duas vias** pode combinar tipos novos com legados em cada sentido (ex. A→B Adversário, B→A Amizade).
- Dados existentes com 6 tipos: **sem migração** — valores antigos permanecem válidos.
- **Inimizade** vs **Adversário**: mestre escolhe consoante hostilidade pessoal vs oposição estrutural; UI não força uma escolha.
- **Vínculo de Sangue** com direcção mútua: permitido se mestre alterar explicitamente após o pré-preenchimento A→B.
- **Vínculo de Sangue** em modo **duas vias**: sem campo `direcao`; pré-preenchimento A→B aplica-se **apenas** em modo recíproco.
- Mudança de tipo para **Vínculo de Sangue** em vínculo existente (modo recíproco): re-aplica pré-preenchimento A→B como na criação.
- i18n: **Adversário** / **Adversary**; **Vínculo de Sangue** / **Blood Bond**.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O catálogo de tipos de vínculo MUST passar de 6 para **8**, acrescentando **Adversário** e **Vínculo de Sangue**, sem novos campos na tabela `vinculo`.
- **FR-002**: API MUST aceitar e persistir os novos valores em `tipo_ab` / `tipo_ba` com a mesma validação dos tipos existentes.
- **FR-003**: Formulário GM de vínculo MUST listar os 8 tipos em todos os modos (recíproco, duas vias), na **ordem canónica** (FR-006).
- **FR-004**: **Adversário** MUST renderizar linha **sólida** em cor **cobre/laranja queimado**, visualmente distinta de **Inimizade**.
- **FR-005**: **Vínculo de Sangue** MUST renderizar linha **sólida** em **violeta escuro**; em modo **recíproco**, ao **seleccionar** este tipo (criar **ou** editar), direcção MUST pré-preencher como **A→B** (`a_para_b`), editável antes de guardar; modo **duas vias** inalterado (sem `direcao`).
- **FR-006**: Legenda, filtros por tipo e listas de tipo no formulário MUST incluir os 8 tipos na **ordem canónica**: Aliado → Vínculo de Sangue → Amizade → Inimizade → Adversário → Romance → Família → Conhecido.
- **FR-007**: Autocomplete de qualificador MUST incluir **Lacaio** quando o tipo activo for **Aliado** ou **Vínculo de Sangue**; para **Adversário**, MUST usar as mesmas sugestões de **Inimizade** (Rival, Traidor, Antigo aliado); **Medo** continua disponível em todos os tipos.
- **FR-008**: Labels de UI MUST existir em **PT-BR** e **EN** (namespaces de relações): **Adversário** / **Adversary**; **Vínculo de Sangue** / **Blood Bond**.
- **FR-009**: Documentação de produto MUST actualizar-se em **`docs/feature-rede-relacoes.md`** (sec. 6, 6.1, 11 e legenda 3.1) quando a frente for implementada. `docs/v2/feature-rede-relacoes.md` está fora deste âmbito.

### Out of Scope

- Novos campos (`tipo`, `qualificador`, `direcao` já existem — confirmado).
- Tipos extra além destes 2 (ex. Lacaio como tipo).
- Reclassificação automática de vínculos existentes.
- Mecânicas de jogo por sistema (Blood Bond VtM, geas, etc.) — só taxonomia visual/UI.

### Key Entities

- **Tipo de vínculo** (enum lógico): valores na ordem canónica `aliado`, `vinculo_sangue`, `amizade`, `inimizade`, `adversario`, `romance`, `familia`, `conhecido` (rótulos PT **Vínculo de Sangue** / EN **Blood Bond**; **Adversário** / **Adversary**).
- **Qualificador**: texto livre + sugestões; **Lacaio** em Aliado e Vínculo de Sangue; **Adversário** partilha Rival, Traidor, Antigo aliado com Inimizade; **Medo** em todos os tipos.
- **Direcção**: inalterada no modelo; em modo recíproco, seleccionar **Vínculo de Sangue** (criar ou editar) pré-define `a_para_b`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mestre cria vínculo **Adversário** e **Vínculo de Sangue** em ≤2 min cada, sem erro de validação.
- **SC-002**: Legenda e filtros mostram **8** tipos na ordem canónica; filtro por cada tipo novo isola correctamente as arestas no grafo.
- **SC-003**: **100%** dos surfaces de tipo (formulário, grafo, legenda, ficha, i18n PT/EN) reconhecem os 8 valores — zero regressão nos 6 legados.
- **SC-004**: [`docs/feature-rede-relacoes.md`](../../docs/feature-rede-relacoes.md) sec. 6 actualizada com 8 linhas na tabela de tipos antes do fecho da frente.

## Assumptions

- Identificadores internos estáveis: `adversario`, `vinculo_sangue` (snake_case, alinhado ao backend Python).
- Cores exactas refinadas no plano/implementação dentro das famílias indicadas (cobre; violeta escuro).
- Sem migração SQL: colunas `tipo_ab`/`tipo_ba` já armazenam strings; extensão do enum em código basta.
- WoD / multi-sistema: **Vínculo de Sangue** nomeia o padrão “coerção sobrenatural” de forma agnóstica, não só Vampire.
- Versão alvo **0.16.0** na implementação.
