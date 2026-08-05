# Feature Specification: Revert Pin Alignment Fixes (047 / 049 / 051)

**Feature Branch**: `052-revert-pin-align-fixes`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Remova tudo que foi feito nas specs 047, 049 e 051, nenhuma das alterações funcionaram, elas resolveram a visualização no mobile, mas quebraram a visualização no desktop. No print da para ver o ponto verde como sendo aonde o ponto vermelho deveria estar na visualização no desktop."

## Prior Art (to undo)

| Spec | O que tentou | Resultado |
|------|--------------|-----------|
| **047** | Nudge móvel à esquerda nos pins | Agravou / interpretação errada |
| **049** | Remover nudge esquerdo; unificar pin+grupo | Incompleto no móvel |
| **051** | Corrigir stage/imagem (aspect / sem cover) para alinhar móvel | Melhorou ou alterou o móvel, **partiu o alinhamento no desktop** |

Esta feature **desfaz** o conjunto dessas alterações de alinhamento de marcadores no mapa da campanha e restaura o comportamento de apresentação **anterior a 047** (baseline estável no desktop).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop: pin no ponto verde (Priority: P1)

No **desktop**, o pin de Altdorf (e os demais marcadores) volta a coincidir com a arte do mapa. No print anexo, o **ponto verde** é a posição correcta; o **ponto vermelho** (pin Visitado) está desalinhado após 047/049/051 — a correcção é **reverter** essas mudanças para o pin vermelho cair sobre o verde (ou o equivalente na arte).

**Why this priority**: O utilizador confirma que as três specs falharam no objectivo global: o desktop ficou pior.

**Independent Test**: Viewport desktop (≥ critério móvel da app); Altdorf tip/âncora sobre o ponto verde do print; desalinhamento vermelho-vs-verde do print **já não** presente.

**Acceptance Scenarios**:

1. **Given** o mapa da campanha em **desktop** após a reversão, **When** o utilizador observa o pin de Altdorf, **Then** a âncora coincide com o ponto verde do print (cidade na arte), não com a posição errada do pin vermelho no print.
2. **Given** o mesmo mapa, **When** se comparam outros pins de referência, **Then** o alinhamento desktop volta ao comportamento **pré-047** (sem a regressão introduzida por 051/049/047).
3. **Given** zoom/pan no desktop, **When** o utilizador interactua, **Then** o alinhamento correcto mantém-se estável.

---

### User Story 2 - Remover o pacote 047 + 049 + 051 (Priority: P1)

Todas as alterações de apresentação de marcadores introduzidas por **047**, **049** e **051** MUST ser removidas do produto (mapa da campanha). Não se aplica “mais um nudge” nem um meio-termo que preserve pedaços da 051 no desktop. O estado alvo de apresentação é o de **antes da 047**.

**Why this priority**: Pedido explícito de remoção total; soluções parciais já falharam.

**Independent Test**: Face ao código/comportamento pré-047: sem nudge móvel deliberado da 047; sem as mudanças de stage/imagem da 051; desktop alinhado como antes dessas features.

**Acceptance Scenarios**:

1. **Given** a feature concluída, **When** se revê o mapa em desktop, **Then** o desalinhamento documentado no print (vermelho fora do verde) **não** permanece.
2. **Given** a feature concluída, **When** se procura o comportamento das specs 047/049/051 (nudge esquerdo móvel; “fix” 049; stage shrink-wrap / remoção de cover da 051), **Then** esse comportamento **já não** está activo.
3. **Given** móvel após a reversão, **When** o utilizador observa o mapa, **Then** aceita-se o regresso ao estado pré-047 no móvel (pode voltar o desalinhamento móvel antigo) — o objectivo desta feature é restaurar o desktop, não reabrir 047–051.

---

### Edge Cases

- **Móvel**: pode regredir ao desalinhamento anterior a 047; **fora** do critério de sucesso desta feature (salvo não introduzir *novos* erros piores que pré-047).
- **Grupo / locais**: a reversão aplica-se a todos os marcadores afectados pelas três specs no mapa da campanha.
- **Digitizer / Rede / Calcular rota (048, 050, etc.)**: **não** reverter; só o pacote de alinhamento 047/049/051.
- **Coordenadas guardadas** (`x`/`y` dos locais): MUST NOT ser alteradas em massa como parte desta reversão.
- **CHANGELOG / docs de specs antigas**: as specs 047/049/051 permanecem como histórico; o produto é que volta atrás.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O produto MUST reverter / remover as alterações de apresentação de marcadores do mapa da campanha introduzidas pelas features **047**, **049** e **051**, restaurando o comportamento visual **pré-047**.
- **FR-002**: No **desktop**, o pin de Altdorf MUST alinhar a âncora ao ponto da arte indicado pelo **ponto verde** no print anexo.
- **FR-003**: No desktop, os demais pins/grupo MUST recuperar o alinhamento pré-047 (sem a regressão do print).
- **FR-004**: A solução MUST NOT consistir em novos nudges ou novos ajustes de stage “por cima” das 047–051 sem as desfazer; o caminho é **remoção / restauro**.
- **FR-005**: Zoom/pan no desktop MUST manter o alinhamento restaurado.
- **FR-006**: Coordenadas persistidas de locais/grupo MUST NOT ser reescritas em massa nesta feature.
- **FR-007**: Alterações de 048 (traços), 050 (transporte), e digitizer MUST NOT ser revertidas por esta feature.
- **FR-008**: Após a reversão, o desalinhamento desktop vermelho-vs-verde do print MUST deixar de ser reproduzível.

### Key Entities

- **Ponto verde (referência desktop)**: Alvo correcto da âncora do pin de Altdorf no print.
- **Pin Altdorf (vermelho Visitado)**: Estado incorrecto pós-051 no print; deve coincidir com o verde após reversão.
- **Baseline pré-047**: Estado de apresentação do mapa da campanha a restaurar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ≤ 1 minuto face ao print (desktop), o pin de Altdorf coincide com o ponto verde.
- **SC-002**: Spot-check ≥ 2 outros pins no desktop: alinhamento coerente com a arte (baseline pré-047), sem o desvio do print.
- **SC-003**: Após zoom in/out no desktop, o alinhamento restaurado mantém-se.
- **SC-004**: Comportamentos característicos de 047/049/051 (nudge esquerdo móvel; layout stage/imagem da 051) **não** estão activos.
- **SC-005**: Digitizer / Calcular rota / grossura de segmentos (fora 047–051) inalterados nesta feature.

## Assumptions

- O print é evidência do **desktop** partido após 051 (e a linhagem 047→049→051).
- “Remover tudo” das 047/049/051 = restauro da apresentação do **mapa da campanha** ao estado **antes da 047**, não apagar ficheiros de especificação do repositório.
- Regressão do alinhamento **móvel** para o estado pré-047 é **aceitável** neste ticket; um futuro alinhamento móvel-sem-partir-desktop seria uma feature nova, não esta.
- O ponto verde é a verdade de aceitação para Altdorf no desktop neste ticket.

## Out of Scope

- Nova tentativa de “corrigir móvel e desktop” sem reverter (isso seria outra feature).
- Reabrir 047 como nudge desejável.
- Alterar coordenadas de todos os locais na base de dados.
- Reverter 048, 050 ou outras features não listadas.
- Redesign da legenda ou navegação.
