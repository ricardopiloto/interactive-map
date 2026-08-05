# Feature Specification: Fix Mobile Marker Alignment (after 047)

**Feature Branch**: `049-fix-mobile-marker-align`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Spec 047 não resolveu o problema, vide o print em anexo." (screenshot: mobile campaign map, GM, pins + legend visible)

## Clarifications

### Session 2026-08-05

- Q: O que ainda está errado no print? → A: **Pins e nós** estão **muito à esquerda** do sítio correcto (**somente em mobile**).
- Q: Âmbito dos marcadores? → A: **Locais + nós + grupo** no mapa da campanha, **somente em mobile** (opção C).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcadores deixam de ficar à esquerda no telemóvel (Priority: P1)

Em layout **celular**, o jogador ou GM abre o **mapa da campanha** e vê **locais**, **nós** (quando visíveis) e o pin do **grupo** alinhados aos pontos correctos do mapa — **já não** deslocados em demasia para a **esquerda**. O desktop mantém o alinhamento actual (sem regressão). A feature **047** (nudge à esquerda) não resolveu isto e pode ter agravado; esta feature corrige o desalinhamento real.

**Why this priority**: Confirmação do utilizador + print: marcadores demasiado à esquerda só no móvel.

**Independent Test**: Viewport móvel no mapa da campanha; pontas/centros de locais, nós (se visíveis) e grupo coincidem com os pontos do mapa (cidades / posição do grupo), sem offset residual à esquerda.

**Acceptance Scenarios**:

1. **Given** mapa da campanha em **modo celular**, **When** o utilizador observa pins de **locais**, **Then** cada pin está no ponto geográfico correcto — **não** visivelmente à esquerda desse ponto.
2. **Given** modo celular com **nós** visíveis no mapa da campanha, **When** o utilizador os observa, **Then** os nós estão alinhados (não deslocados à esquerda).
3. **Given** modo celular com pin do **grupo** visível, **When** o utilizador o observa, **Then** o grupo está alinhado ao ponto correcto (não deslocado à esquerda).
4. **Given** layout **desktop**, **When** o utilizador observa locais, nós (se visíveis) e grupo, **Then** o alinhamento permanece o correcto actual (sem nova regressão).
5. **Given** modo celular, **When** o utilizador faz zoom/pan, **Then** o alinhamento correcto mantém-se estável.

---

### User Story 2 - Corrigir sem repetir o erro da 047 (Priority: P2)

A correcção trata o facto de os marcadores estarem **demasiado à esquerda** no móvel. Não se aplica “mais nudge à esquerda”. Pode ser necessário **reverter ou substituir** o comportamento da 047. Rede de rotas / digitizer e overlay de Calcular rota ficam fora, salvo marcadores no mapa da campanha.

**Why this priority**: 047 deslocou à esquerda; o defeito é marcadores demasiado à esquerda — a solução tem de ir na direcção certa.

**Independent Test**: Após a correcção, móvel alinhado; digitizer e overlay de rota inalterados quanto a grossura/geometria de linhas.

**Acceptance Scenarios**:

1. **Given** a correcção aplicada em móvel, **When** se compara com o estado pós-047 / print, **Then** o offset excessivo à esquerda já não está presente.
2. **Given** Rede de rotas / digitizer, **When** o utilizador a abre (mesmo em móvel), **Then** esta feature não exige mudanças nas linhas de segmento (âmbito = marcadores do mapa da campanha).

---

### Edge Cases

- Marcadores **demasiado à esquerda** só em mobile; desktop OK.
- Âmbito: **locais + nós + grupo** no mapa da campanha (móvel).
- Feature **047** (nudge ~8px à esquerda): MUST ser revista — tipicamente **remover ou inverter** esse nudge, não aumentá-lo.
- Sem nós no mapa da campanha hoje: quando/se aparecerem, a mesma regra de alinhamento móvel aplica-se; se não houver nós, só locais + grupo.
- Sem locais / sem grupo: alinhar o que existir; sem erro.
- Coordenadas persistidas: correcção de **apresentação** no móvel; não reescrever `x`/`y` guardados só para mascarar o bug.
- Linhas brancas/grelha no print: **fora de âmbito** (não são o defeito confirmado).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em modo celular no mapa da campanha, pins de **locais** MUST alinhar ao ponto do mapa (MUST NOT permanecer deslocados em demasia para a **esquerda**).
- **FR-002**: Em modo celular, **nós** visíveis no mapa da campanha MUST receber a mesma correcção de alinhamento horizontal.
- **FR-003**: Em modo celular, o pin do **grupo** MUST receber a mesma correcção de alinhamento horizontal.
- **FR-004**: Em desktop, locais, nós e grupo MUST NOT regressar no alinhamento.
- **FR-005**: A solução MUST NOT consistir em deslocar ainda mais os marcadores para a esquerda; MUST eliminar o excesso de offset à esquerda no móvel (incluindo rever o nudge da 047).
- **FR-006**: Zoom/pan em móvel MUST manter o alinhamento correcto.
- **FR-007**: Rede de rotas / digitizer (traços de segmento) e overlay de Calcular rota MUST NOT ser obrigados a mudar por esta feature.
- **FR-008**: Coordenadas persistidas MUST NOT ser alteradas só para corrigir a apresentação móvel.

### Key Entities

- **Local (pin)**, **Nó** (se visível no mapa da campanha), **Grupo**: marcadores a alinhar no móvel.
- **Modo celular**: layout móvel da aplicação.
- **047**: nudge à esquerda a rever/remover no âmbito desta correcção.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em móvel, um revisor confirma em ≤ 2 minutos (spot-check ≥ 3 locais + grupo) que os marcadores **já não** estão perceptivelmente à esquerda dos pontos do mapa.
- **SC-002**: Em desktop, 100% dos marcadores observados (locais, grupo; nós se visíveis) mantêm o alinhamento pré-esta-feature.
- **SC-003**: Após zoom in/out em móvel, o alinhamento correcto permanece estável.
- **SC-004**: O desalinhamento “muito à esquerda só no mobile” deixa de ser reportável no mapa da campanha.

## Assumptions

- O print e a clarificação fecham o diagnóstico: offset **excessivo à esquerda** em mobile para pins/nós; grupo incluído; só mapa da campanha.
- A 047 interpretou mal o pedido original (descrevia o bug; a 047 empurrou ainda à esquerda). Esta feature corrige na direcção oposta / remove o nudge incorrecto.
- Nós no mapa da campanha podem ainda não existir como discos; a regra aplica-se quando existirem; implementação não precisa inventar nós só para cumprir FR-002.
- Sem mudança de backend.

## Out of Scope

- Afinação de grossura de segmentos da Rede (048).
- Remoção das linhas brancas/grelha do print (não confirmadas como o bug).
- Redesign da legenda ou navegação inferior.
- Backend / regravação de coordenadas.
