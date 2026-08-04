# Feature Specification: Tamanho e alinhamento dos pins

**Feature Branch**: `030-pin-size-offset`

**Created**: 2026-08-03

**Status**: Deferred / Staged

> Reverted from the product by feature **034-revert-pin-offset** (pin tip/anchor and mobile shrink caused lateral offset on reposition). Keep this spec for a future re-apply only after validating against the reposition flow. Do not treat as active in the UI.

**Input**: User description: "Para os pins, diminua um pouco o tamanho deles quando em dispositivo móvel (mobile), além disso, quando em dispositivo web, os pins ficam ligeiramente deslocados para o lado."

## Clarifications

### Session 2026-08-03

- Q: Correção de alinhamento em que viewports? → A: Todos os viewports (desktop e móvel)
- Q: Quão menores os pins no móvel? → A: Redução modesta (~15–25% do tamanho visual do desktop)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pins alinhados em qualquer viewport (Priority: P1)

Um jogador ou o GM abre o mapa (desktop/web **ou** móvel) e vê cada pin de local (e o marcador do grupo, quando presente) com a ponta visualmente centrada no ponto do mapa correspondente às coordenadas guardadas — sem desvio lateral perceptível.

**Why this priority**: O desalinhamento prejudica a leitura do mapa e a confiança na posição dos locais; é um defeito de precisão, não só de estética; corrigir em todos os viewports evita comportamento inconsistente.

**Independent Test**: Em viewport desktop **e** móvel, comparar visualmente a ponta do pin com um ponto de referência conhecido no mapa (ou com a posição esperada após reposicionar um local); o desvio lateral MUST ser imperceptível em uso normal em ambos.

**Acceptance Scenarios**:

1. **Given** o mapa com pelo menos um pin de local visível num viewport desktop/web, **When** o utilizador observa o pin em relação ao ponto geográfico pretendido no mapa, **Then** o pin não aparece deslocado para a esquerda ou direita de forma notória.
2. **Given** o mesmo mapa num viewport móvel, **When** o utilizador observa os pins, **Then** o alinhamento horizontal está igualmente correto (a correção não se limita ao desktop).
3. **Given** o ícone do grupo visível (desktop ou móvel), **When** o utilizador compara a âncora do ícone com a posição guardada, **Then** o alinhamento horizontal está correto.
4. **Given** zoom in/out, **When** o utilizador altera a escala, **Then** o alinhamento do pin relativamente ao ponto do mapa permanece correto (o desvio não reaparece nem aumenta).

---

### User Story 2 — Pins um pouco menores no telemóvel (Priority: P2)

Um jogador consulta o mapa no telemóvel e vê os pins ligeiramente mais pequenos do que no desktop, de modo a ocupar menos área do mapa e reduzir sobreposição visual, mantendo-os ainda fáceis de tocar e distinguir.

**Why this priority**: Melhora legibilidade e densidade visual no ecrã pequeno; depende menos de correção de precisão do que a US1, mas completa o pedido.

**Independent Test**: Abrir o mesmo mapa num viewport móvel estreito e num desktop; os pins no móvel MUST ser notavelmente mais pequenos, sem perder legibilidade nem o alvo de toque razoável.

**Acceptance Scenarios**:

1. **Given** o mapa com pins visíveis num viewport móvel, **When** o utilizador compara com o tamanho no desktop, **Then** os pins aparecem cerca de 15–25% mais pequenos (redução modesta, óbvia a olho nu, não minúsculos).
2. **Given** um pin no móvel, **When** o utilizador toca no pin para o selecionar, **Then** consegue ativá-lo sem dificuldade (o tamanho reduzido não inviabiliza o toque).
3. **Given** viewport móvel e desktop com os mesmos locais, **When** o utilizador compara as posições, **Then** o alinhamento no móvel está correto (FR-001) e a redução de tamanho não introduz desvio lateral novo.

---

### Edge Cases

- Viewport na fronteira entre “móvel” e “desktop”: o tamanho aplicado MUST ser estável (sem oscilação contínua ao redimensionar ligeiramente).
- Pin selecionado / em destaque (hover ou seleção): estados de ênfase (maior escala, anel) MUST continuar visíveis e proporcionais no tamanho base de cada breakpoint.
- Muitos pins próximos no móvel: a redução ajuda a legibilidade, mas não exige anti-colisão automática nesta feature.
- Rede de rotas / nós do digitador: fora de escopo — esta feature trata dos pins do mapa de campanha (locais e grupo), não dos nós da rede.
- Orientação paisagem no telemóvel: continua a usar o tamanho móvel enquanto o layout for o de dispositivo estreito/móvel da aplicação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em **todos** os viewports (desktop/web e móvel), a âncora visual de cada pin de local MUST coincidir com as coordenadas do local no mapa, sem desvio lateral perceptível.
- **FR-002**: Em **todos** os viewports, o marcador do grupo MUST seguir o mesmo critério de alinhamento horizontal correto relativamente às suas coordenadas.
- **FR-003**: Num viewport móvel, os pins de local MUST ser ~15–25% mais pequenos (em tamanho visual) do que no desktop — redução modesta e óbvia a olho nu.
- **FR-004**: Num viewport móvel, o marcador do grupo MUST usar uma escala coerente com a redução aplicada aos pins de local (não permanecer desproporcionalmente grande).
- **FR-005**: A redução de tamanho no móvel MUST preservar usabilidade de toque: o utilizador ainda consegue selecionar um pin com um toque normal.
- **FR-006**: Zoom, pan, seleção e hover/ênfase dos pins MUST continuar a funcionar após as alterações de tamanho e alinhamento.
- **FR-007**: Coordenadas guardadas dos locais e do grupo MUST permanecer inalteradas por esta feature (apenas apresentação/visual).
- **FR-008**: A legenda do mapa (miniaturas de pin, se existirem) MUST permanecer coerente e legível; não é obrigatório reduzir as miniaturas da legenda na mesma proporção dos pins no mapa.

### Key Entities

- **Pin de local**: marcador no mapa que representa um Local; posição derivada das coordenadas do Local.
- **Marcador do grupo**: ícone da posição do grupo no mapa; partilha o mesmo sistema de posicionamento visual.
- **Viewport móvel vs desktop**: modos de apresentação já usados pela aplicação para adaptar o mapa a ecrãs estreitos vs largos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão visual no desktop **e** no móvel com pelo menos 3 pins cada, um observador independente classifica o alinhamento horizontal como “alinhado” (sem desvio lateral óbvio) em ≥ 90% dos pins avaliados por viewport.
- **SC-002**: Num telemóvel ou viewport móvel equivalente, o tamanho base do pin é ~15–25% menor que no desktop (confirmado por comparação lado a lado ou screenshot), mantendo o pin reconhecível e tocável.
- **SC-003**: Em teste rápido com 5 tentativas de toque em pins distintos no móvel, ≥ 4/5 ativam o pin pretendido à primeira tentativa.
- **SC-004**: Após a correção, reposicionar ou criar um Local no desktop continua a colocar o pin no ponto clicado, sem o desvio lateral anterior.

## Assumptions

- “Dispositivo móvel” corresponde ao layout/viewport estreito que a aplicação já trata como móvel (não um detetor de SO separado).
- “Diminua um pouco” está clarificado como redução modesta de ~15–25% do tamanho visual do desktop (clarificação 2026-08-03), não metade do tamanho nem micro-dots.
- O desvio “para o lado” no web refere-se a um desalinhamento horizontal da âncora do pin relativamente ao ponto do mapa; a correção alinha a ponta/centro âncora às coordenadas e aplica-se a **todos** os viewports (clarificação 2026-08-03).
- Pins da legenda e nós da Rede de rotas ficam fora do pedido de redução móvel, salvo se a coerência visual do grupo no mapa exigir ajuste mínimo do marcador do grupo (FR-004).
- Jogadores e GM veem o mesmo comportamento visual de tamanho e alinhamento no mapa (sem regras distintas por papel).
