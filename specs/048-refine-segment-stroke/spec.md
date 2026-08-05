# Feature Specification: Refine Segment Stroke Weight

**Feature Branch**: `048-refine-segment-stroke`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Vamos \"afinar\" a grossura das linhas dos seguimentos"

## Clarifications

### Session 2026-08-05

- Q: Quanto mais fino o traço normal dos segmentos? → A: Moderado (~⅔ do peso actual); claramente mais fino e ainda legível.
- Q: Como tratar o traço de realce no hover? → A: Reduzir pelo **mesmo factor ~⅔** (mantém proporção normal vs hover).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Segmentos ainda mais fáceis de alinhar ao mapa (Priority: P1)

O GM abre a **Rede de rotas** e vê (e desenha) segmentos com traço **mais fino** do que o peso actual — uma afinação após o primeiro afinamento já feito — para revelar mais arte do mapa e alinhar melhor estradas, rios e trilhas impressas.

**Why this priority**: É o único pedido: afinar a grossura das linhas dos segmentos.

**Independent Test**: Abrir Rede com segmentos existentes; confirmar que o traço está claramente mais fino que hoje e ainda legível; traçar um draft ao longo de uma estrada do mapa e verificar que o mapa por baixo continua legível.

**Acceptance Scenarios**:

1. **Given** a Rede de rotas com segmentos guardados, **When** o GM observa o mapa, **Then** os traços dos segmentos aparecem cerca de **⅔ da grossura anterior**, mantendo-se visíveis e distinguíveis por tipo (estrada / rio / trilha).
2. **Given** o GM a traçar um segmento (linha em rascunho), **When** coloca pontos intermédios, **Then** o draft usa a mesma ordem de grossura afinada, sem tapar o mapa em demasia.
3. **Given** zoom in numa zona densa de segmentos, **When** o GM compara com o peso anterior, **Then** o mapa de fundo é mais legível e os tipos de segmento continuam distinguíveis.

---

### User Story 2 - Destaque e toque continuam usáveis (Priority: P2)

Ao passar o rato / destacar um segmento (quando o hover estiver activo), o realce visual continua perceptível face ao traço afinado; a área de interacção para identificar o segmento continua fácil de acertar. Afinar o traço **não** deve tornar os segmentos “invisíveis” nem impossíveis de seleccionar por hover.

**Why this priority**: Evita que um traço demasiado fino parta a usabilidade introduzida pelo hover de segmentos.

**Independent Test**: Em Rede (modo idle), hover num segmento: destaque visível; tip/lista (se existirem) ainda funcionam.

**Acceptance Scenarios**:

1. **Given** Rede em idle com segmentos, **When** o GM faz hover sobre um segmento, **Then** o realce do traço também está ~⅔ do peso de hover anterior e continua claramente mais forte que o traço normal afinado.
2. **Given** o mesmo ecrã, **When** o GM tenta acertar no segmento com o cursor, **Then** consegue activar o hover sem precisar de precisão pixel-a-pixel no centro da linha.

---

### Edge Cases

- Fundos de mapa claros: o traço afinado MUST permanecer visível (não desaparecer por falta de contraste).
- Extremos de zoom: comportamento de escala do traço não piora face ao actual (não some no zoom máximo nem vira “mancha” no mínimo além do que já acontece).
- Rede vazia: sem segmentos — sem erro.
- Overlay de rotas calculadas no mapa da campanha e linhas de saídas entre locais: **fora de âmbito** (igual à afinação anterior da Rede).
- Modos Novo nó / Traçar segmento: o hover pode estar desligado (comportamento já existente); o traço afinado aplica-se na mesma a segmentos guardados e ao draft.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na Rede de rotas, as polilinhas de segmentos **guardados** MUST renderizar com traço cerca de **⅔ do peso actual** (moderadamente mais fino; claramente perceptível).
- **FR-002**: Linhas de **draft** (segmento em progresso) MUST usar a mesma ordem de grossura afinada (~⅔) que os segmentos guardados.
- **FR-003**: A diferenciação visual por tipo (estrada / rio / trilha) MUST permanecer distinguível após a afinação (cores / padrões de traço no mesmo espírito).
- **FR-004**: O realce de segmento em hover (quando activo) MUST usar cerca de **⅔ do peso de hover actual** e MUST permanecer perceptivelmente mais marcado que o traço normal afinado.
- **FR-005**: A facilidade de acertar no segmento para hover/info MUST NOT regredir de forma grosseira (a “pista” de interacção pode manter-se mais larga que o traço visível).
- **FR-006**: Nós, auras e chrome da UI fora do traço dos segmentos MUST NOT ser obrigados a mudar para esta feature.
- **FR-007**: Overlay de rota no mapa da campanha e linhas de ligação entre locais MUST NOT mudar nesta feature.
- **FR-008**: A afinação MUST ser só visual; MUST NOT alterar geometria ou dados persistidos dos segmentos.

### Key Entities

- **Segmento**: Caminho guardado entre dois nós da rede (com pontos intermédios opcionais), mostrado como polilinha na Rede de rotas.
- **Draft de segmento**: Polilinha temporária enquanto o GM traça um segmento novo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O peso do traço normal dos segmentos na Rede fica cerca de **⅔ do peso actual** (redução clara num spot-check lado a lado; não um ajuste trivial de 1–2%).
- **SC-002**: Numa zona densa com ≥ 5 segmentos, um revisor confirma em ≤ 2 minutos que o mapa por baixo está **mais legível** para alinhamento do que antes desta alteração.
- **SC-003**: 100% dos tipos de segmento presentes num conjunto misto de teste continuam distinguíveis após a mudança.
- **SC-004**: Em idle, hover de segmento usa realce ~⅔ do peso de hover anterior, continua a destacar a linha face ao traço normal e activa-se com o cursor perto do traço (smoke: ≥ 3 segmentos).
- **SC-005**: Fluxos colocar nó + traçar segmento completam-se sem erros novos atribuíveis ao estilo do traço.

## Assumptions

- “Linhas dos segmentos” = polilinhas da **Rede de rotas** (guardadas + draft), não overlay de Calcular rota no mapa da campanha nem linhas de saídas entre locais — mesmo âmbito da feature anterior de afinar segmentos.
- “Afinar” = tornar o traço **mais fino** que o peso **actual** (já reduzido uma vez), não engrossar nem reverter essa mudança.
- Magnitude locked: ~**⅔ do peso actual** para traço normal (guardado + draft) **e** para o traço de realce em hover (mesmo factor); ainda bem visível em fundos claros; ± pequena afinação na QA desde que SC-001/SC-004 se verifiquem.
- Cores e dash por tipo mantêm-se; só a grossura muda (normal + hover em proporção).
- Sem alterações de backend, API ou modelo de dados.
- Hit-area larga para hover pode permanecer (não precisa do factor ⅔); não é obrigatório estreitar a zona de toque ao novo traço fino.

## Out of Scope

- Tamanho/aura de nós.
- Overlay de rotas calculadas no mapa da campanha.
- Linhas de ligação entre locais no mapa da campanha.
- Snap automático de pontos ao desenho do mapa.
- Backend / API.
