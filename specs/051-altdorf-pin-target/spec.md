# Feature Specification: Align Altdorf Pin to Map Target

**Feature Branch**: `051-altdorf-pin-target`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "spec 048 ainda não corrigiu o problema, vide o print em anexo, o ponto verde é aonde o pin de altdorf deveria estar." Validação posterior: comparar com specs **047** e **049** (ambas tentaram o mesmo desalinhamento móvel sem sucesso) e decidir se as alterações dessas specs ainda são necessárias face a esta.

## Clarifications

### Session 2026-08-05

- Q: O desalinhamento afecta todos os pins no móvel ou só Altdorf? → A: Todos os pins no móvel (desvio sistemático de apresentação).
- Q: O desalinhamento também aparece no desktop, ou só no móvel? → A: Só no móvel (desktop alinhado / aceitável).

## Prior Art: Specs 047 e 049 *(mandatory for this revision)*

As três features tratam o **mesmo problema de negócio**: no mapa da campanha em móvel, marcadores não coincidem com a arte (pins “à esquerda” do sítio certo). A 051 é a continuação correcta; 047 e 049 são tentativas anteriores.

### O que cada uma fez (intenção)

| Spec | Intenção declarada | Resultado face ao problema |
|------|--------------------|----------------------------|
| **047** | Deslocar pins/nós **ligeiramente à esquerda** no móvel (~6–10 px de ecrã) | **Falhou / agravou.** Interpretação invertida: o utilizador descrevia o *bug* (“estão à esquerda”); a 047 tornou isso um *requisito* e empurrou ainda mais à esquerda. Pin do **grupo** ficou de fora. |
| **049** | Corrigir “demasiado à esquerda”: **reverter** o nudge da 047; incluir **locais + nós + grupo**; **não** empurrar mais à esquerda | **Direcção certa, sucesso incompleto.** Removeu o nudge negativo da 047 e unificou a regra de apresentação pin/grupo, mas o print da 051 ainda mostra Altdorf longe do ponto verde (Flats vs cidade) — o desalinhamento sistemático **persiste**. |
| **051** | Alinhar Altdorf ao ponto verde; causa = desvio **sistemático de apresentação móvel** (todos os pins + grupo); só móvel | **Feature activa** que deve fechar o problema sem repetir 047 nem parar no “nudge zero” da 049. |

### Necessidade das alterações 047 / 049 face à 051

**047 — alterações intencionais: NÃO são necessárias; MUST permanecer desfeitas.**

- O deslocamento deliberado à esquerda no móvel **não** deve ser reintroduzido.
- Qualquer solução 051 que “corrija” com nudge à esquerda **repete o erro da 047** e viola FR-003.
- Valor residual da 047: apenas lição (não tratar a descrição do bug como feature) e confirmação de que o âmbito é **mapa da campanha / móvel**, não digitizer.

**049 — parcialmente necessárias como baseline; insuficientes sozinhas.**

- **Manter (necessário):** a **remoção** do nudge à esquerda da 047; a regra de que pin e **grupo** partilham a mesma correcção de apresentação no móvel; a proibição de “mais offset à esquerda”; desktop intacto; sem reescrever coordenadas só para mascarar.
- **Insuficiente:** deixar a correcção em “nudge = 0 / opcional à direita não activado” **não** fechou o print (Altdorf ainda nas Flats). A magnitude no print (cidade vs Flats) sugere que **não** basta um ajuste cosmético de poucos píxeis no mesmo espírito da 047 — a 051 MUST encontrar e corrigir a **causa real** do desvio sistemático de apresentação no móvel.
- **Não reabrir como feature separada:** a 049 fica **superseded** pela 051 para o mesmo objectivo de alinhamento; trabalho novo concentra-se na 051.

### Decisão de produto (fechada nesta validação)

1. **Não** restaurar o comportamento da 047.
2. **Conservar** os ganhos da 049 que evitam regressão (sem nudge esquerdo; grupo no mesmo sistema de alinhamento).
3. **051** MUST ir além do que a 049 entregou: corrigir a apresentação móvel até Altdorf = ponto verde e os demais pins deixarem o desvio sistemático — sem assumir que “outro nudge de ~8px” é a solução completa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pin de Altdorf no sítio certo (Priority: P1)

No mapa da campanha (viewport móvel), o pin do local **Altdorf** deve coincidir com o ponto marcado a **verde** no print (centro/arte da cidade sobre o rótulo Altdorf). Hoje o pin vermelho (Visitado) aparece **deslocado para a esquerda** (zona Altdorf Flats). As tentativas **047** e **049** **não** fecharam este caso; a menção a “048” no pedido inicial refere o problema ainda aberto no print, não a grossura de segmentos da Rede.

**Why this priority**: Evidência visual explícita do alvo correcto vs pin actual.

**Independent Test**: Abrir o mapa no móvel (mesmo viewport do print); a ponta/âncora do pin de Altdorf coincide com o ponto verde (arte da cidade), não com a posição actual à esquerda.

**Acceptance Scenarios**:

1. **Given** o mapa da campanha em móvel com o local Altdorf, **When** o utilizador observa o pin de Altdorf, **Then** a âncora do pin está sobre o ponto da cidade indicado no print (ponto verde), não à esquerda nas Altdorf Flats.
2. **Given** o mesmo mapa após a correcção, **When** se compara com o print de referência, **Then** o desalinhamento documentado (vermelho vs verde) **já não** está presente.
3. **Given** zoom/pan no móvel, **When** o utilizador move o mapa, **Then** o pin de Altdorf permanece alinhado ao mesmo ponto geográfico da arte.

---

### User Story 2 - Corrigir desvio sistemático sem repetir 047/049 (Priority: P1)

A causa fechada é um **desvio sistemático de apresentação no móvel**: **todos** os pins (locais e o grupo) aparecem deslocados face à arte — tipicamente à esquerda, como no print de Altdorf. A correcção MUST alinhar o conjunto no móvel; Altdorf MUST coincidir com o ponto verde.

MUST NOT: restaurar o nudge à esquerda da **047**; limitar-se a “nudge zero” como na entrega incompleta da **049**; tratar só coordenadas guardadas de Altdorf como substituto da correcção de apresentação.

**Why this priority**: 047 e 049 provaram que a direcção e a profundidade da solução importam; repetir qualquer uma falha de novo.

**Independent Test**: No móvel, Altdorf no verde; ≥ 2 outros pins/marcadores alinhados à arte; grupo sem o mesmo desvio; desktop sem regressão; confirmação de que o deslocamento deliberado à esquerda da 047 **não** voltou.

**Acceptance Scenarios**:

1. **Given** o mapa em móvel após a correcção, **When** o utilizador observa vários pins, **Then** deixam de partilhar o desvio sistemático à esquerda face à arte.
2. **Given** Altdorf como referência do print, **When** a correcção é aplicada, **Then** a âncora coincide com o ponto verde.
3. **Given** o pin do grupo (se visível), **When** a correcção de apresentação móvel é aplicada, **Then** o grupo deixa de partilhar o mesmo desvio sistemático dos pins de locais.
4. **Given** o estado pós-047 (nudge à esquerda activo), **When** a 051 está concluída, **Then** esse deslocamento deliberado à esquerda **não** está presente.

---

### Edge Cases

- Pin do **grupo** e **todos** os locais no móvel: **dentro** do âmbito (como 049; ao contrário da 047 que excluía o grupo).
- Feature **048** (afinar traços da Rede): **não** é a causa deste print; não reabrir.
- Features **047/049**: ver secção Prior Art — 047 rejeitada; 049 baseline parcial; 051 supersede para o alinhamento.
- Desktop: alinhamento actual aceite — correcção só no **móvel**; MUST NOT piorar o desktop.
- Coordenadas guardadas: fora do foco principal; só se, após apresentação móvel correcta, Altdorf ainda falhar o verde (FR-007).
- Ajuste cosmético de poucos píxeis no mesmo padrão da 047/049: **pode** fazer parte da solução se a causa raiz o exigir, mas MUST NOT ser a única hipótese quando o desvio no print é da ordem cidade↔Flats.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O pin do local **Altdorf** MUST alinhar a âncora ao ponto da arte da cidade documentado pelo ponto verde no print anexo (viewport móvel).
- **FR-002**: A solução MUST remover o desalinhamento vermelho-à-esquerda vs verde visto no print.
- **FR-003**: A solução MUST corrigir o **desvio sistemático de apresentação no móvel** que afecta **todos** os pins de locais e o marcador do **grupo** — MUST NOT limitar-se a “mais nudge à esquerda”, a restaurar a **047**, nem a alterar só as coordenadas guardadas de Altdorf.
- **FR-004**: A correcção MUST aplicar-se ao viewport **móvel**; o alinhamento no **desktop** MUST permanecer aceitável (sem regressão perceptível).
- **FR-005**: Zoom/pan no móvel MUST manter o alinhamento correcto de Altdorf (e dos demais pins corrigidos) ao ponto da arte.
- **FR-006**: Alterações à Rede de rotas / grossura de segmentos (048) MUST NOT ser exigidas por esta feature.
- **FR-007**: Após a correcção de apresentação móvel, se Altdorf ainda falhar o ponto verde, aí sim MAY-se corrigir coordenadas desse local; o caminho principal continua a ser apresentação móvel.
- **FR-008**: O deslocamento deliberado à esquerda introduzido pela **047** MUST NOT ser reintroduzido.
- **FR-009**: Os ganhos da **049** que removem o nudge esquerdo e exigem o **mesmo** alinhamento para locais e grupo MUST ser preservados ou substituídos por uma correcção equivalente que continue a cumprir esses constrangimentos — MUST NOT regredir para “só locais” sem grupo.
- **FR-010**: A solução MUST ir além do estado pós-049 (em que o desalinhamento do print ainda é reproduzível); o critério de aceitação é o ponto verde / alinhamento à arte, não apenas “047 desfeita”.

### Key Entities

- **Local Altdorf**: Pin Visitado no mapa; alvo visual = ponto verde no print.
- **Ponto verde (referência)**: Marca humana no print indicando a âncora correcta sobre a arte da cidade.
- **Pins de locais / grupo (móvel)**: Conjunto afectado pelo desvio sistemático de apresentação.
- **047 / 049**: Tentativas anteriores; 047 rejeitada; 049 parcialmente retenível; 051 supersede.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Numa revisão ≤ 1 minuto face ao print (móvel), o pin de Altdorf coincide com o ponto verde (cidade), não com a posição nas Flats.
- **SC-002**: Após zoom in/out no móvel, o alinhamento a esse ponto da cidade mantém-se.
- **SC-003**: Pelo menos 2 outros pins de referência no móvel alinham-se à arte correspondente (deixam o desvio sistemático à esquerda).
- **SC-004**: O marcador do grupo, se visível no mesmo viewport móvel, deixa de partilhar o desvio sistemático dos pins de locais.
- **SC-005**: Spot-check no desktop: alinhamento de Altdorf e de pelo menos 1 outro pin não piora face ao estado pré-correcção.
- **SC-006**: Confirmação explícita de que o nudge deliberado à esquerda da 047 **não** está activo após a 051.
- **SC-007**: O cenário do print (Altdorf à esquerda do ponto verde) deixa de ser reproduzível no móvel — critério mais forte do que “apenas removeu a 047”.

## Assumptions

- O print é evidência do estado **ainda incorrecto** no mapa da campanha em móvel **após** 047 e 049.
- A menção a “spec 048” no pedido original refere o problema ainda aberto; 048 (traços da Rede) **não** é o objecto desta feature.
- O ponto verde é a verdade de aceitação para a âncora do pin de Altdorf.
- O desvio é de **apresentação no móvel** (clarificado); desktop está alinhado/aceitável.
- Validação 047/049: ver secção Prior Art — 047 desnecessária e prejudicial se restaurada; 049 parcialmente necessária como baseline, insuficiente sozinha.
- Correção de coordenadas individuais fica de reserva só se, após a apresentação correcta no móvel, Altdorf ainda falhar o verde.
- A magnitude cidade↔Flats no print recomenda investigar causa de apresentação além de um micro-ajuste horizontal isolado no espírito da 047.

## Out of Scope

- Afinação de grossura de segmentos (048).
- Menu Calcular rota / transporte pago vs próprio (050).
- Redesign da legenda ou navegação.
- Alterar deliberadamente coordenadas de todos os locais no armazenamento como substituto da correcção de apresentação móvel.
- Reabrir a **047** como feature desejável (nudge à esquerda).
- Tratar a **049** como “já concluída” sem nova verificação face ao print da 051.
