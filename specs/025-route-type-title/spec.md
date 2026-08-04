# Feature Specification: Título da Rota pelo Tipo de Via

**Feature Branch**: `025-route-type-title`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: "Vamos fazer um pequeno ajuste na spec 024, no título da rota, ao invés de usar algo como Rota 1 vamos colocar o tipo da rota no título, ou seja, Rota 1 passa a ser Rio"

## Clarifications

### Session 2026-08-03

- Q: Linha “tipos” abaixo do título? → A: Remover a linha de tipos (só no título) (opção A)
- Q: Duas rotas com o mesmo tipo no título? → A: Sufixo só em duplicados (ex.: “Estrada (2)”) (opção B)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identificar a rota pelo tipo no título (Priority: P1)

Como utilizador do Calcular rota, quero ver no título de cada alternativa o **tipo de via** (ex.: Rio, Estrada, Trilha) em vez de “Rota 1”, “Rota 2”, para reconhecer de imediato a natureza do caminho.

**Why this priority**: É o único pedido desta entrega; melhora a leitura da lista de alternativas (024).

**Independent Test**: Calcular um par com rota só-rio → título mostra “Rio” (ou equivalente capitalizado); estrada → “Estrada”; não aparece “Rota N” como título principal.

**Acceptance Scenarios**:

1. **Given** um cálculo com uma rota cujo único tipo é rio, **When** o utilizador olha a lista, **Then** o título dessa entrada é o tipo (**Rio**), não “Rota 1”.
2. **Given** uma rota só-estrada e outra só-trilha na mesma lista, **When** compara os títulos, **Then** vê **Estrada** e **Trilha** (ou rótulos equivalentes claros), respetivamente.
3. **Given** a rota mais rápida, **When** o título é mostrado, **Then** o indicador de “mais rápida” (se existir) permanece, mas o número genérico “Rota N” deixa de ser o título.

---

### User Story 2 - Rotas com vários tipos (Priority: P2)

Como utilizador, quando uma rota mistura tipos (ex.: estrada + trilha), quero um título ainda compreensível, sem voltar a “Rota 1”.

**Why this priority**: Casos mistos existem no grafo; o título não pode ficar vazio ou ambíguo.

**Independent Test**: Rota com `tipos` = [estrada, trilha] → título junta os tipos de forma legível (ex.: “Estrada, trilha”).

**Acceptance Scenarios**:

1. **Given** uma rota com dois ou mais tipos, **When** o resultado é listado, **Then** o título reflete **todos** os tipos presentes (lista curta, legível), não só um número.
2. **Given** uma rota sem tipo conhecido, **When** listada, **Then** há um título de reserva claro (ex.: “Rota”) em vez de campo vazio.

---

### Edge Cases

- A linha secundária de tipos **é removida** (clarificação A); título carrega o(s) tipo(s); distância e tempo permanecem.
- Capitalização: rótulos em português com inicial maiúscula no título (Rio, Estrada, Trilha).
- Duas alternativas com o mesmo tipo: **sufixo só em duplicados** (ex.: “Estrada”, “Estrada (2)”) — clarificação B; a primeira ocorrência do título base fica sem sufixo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na lista de resultados do Calcular rota, o **título** de cada item DEVE ser derivado do(s) **tipo(s) de via** daquela rota (ex.: “Rio”), e NÃO DEVE usar “Rota 1”, “Rota 2”, etc. como título principal.
- **FR-002**: Com um único tipo, o título DEVE ser o nome desse tipo, capitalizado de forma legível.
- **FR-003**: Com vários tipos, o título DEVE listar os tipos presentes de forma compacta e legível (ex.: “Estrada, rio”).
- **FR-004**: O destaque da alternativa mais rápida (rótulo ou estilo) PODE permanecer, desde que não reinstaure “Rota N” como título.
- **FR-007**: Quando duas ou mais rotas na **mesma lista de resultados** partilhariam o mesmo título de tipo(s), DEVE acrescentar-se um sufixo de desambiguação só nesses casos (ex.: “Estrada”, “Estrada (2)”); rotas com título único NÃO levam número.

### Key Entities

- **Rota candidata (resultado)**: já inclui lista de tipos de via; o título da UI passa a ser uma leitura desses tipos.
- **Tipo de via**: estrada, rio, trilha (e equivalentes).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das rotas de teste com um único tipo, o título visível corresponde a esse tipo (não a “Rota N”).
- **SC-002**: Em rotas mistas de teste, o título inclui todos os tipos reportados pela rota, sem depender de “Rota N”.
- **SC-003**: Um utilizador identifica o tipo da alternativa selecionada olhando só o título, em ≤ 2 segundos em teste informal.
- **SC-004**: Com duas rotas só-estrada na mesma lista, os títulos são “Estrada” e “Estrada (2)” (ou equivalente), nunca ambos idênticos sem sufixo.

## Assumptions

- Extensão UX da feature **024-route-planner-speed** (lista do modal Calcular rota).
- Tipos vêm do resultado já calculado (`tipos` por rota); sem novo campo de dados.
- Rótulos em português: rio → “Rio”, estrada → “Estrada”, trilha → “Trilha”.
- Em títulos duplicados na mesma lista: desambiguar com sufixo `(2)`, `(3)`, … na 2.ª ocorrência em diante; a 1.ª fica só com o tipo.
- Linha secundária de tipos: **removida** (só título).

## Out of Scope

- Alterar algoritmo de rotas, ritmos, velocidade ou modificadores.
- Renomear tipos no modelo de dados / digitalização.
- Ícones por tipo (só texto no título, salvo decisão futura).
