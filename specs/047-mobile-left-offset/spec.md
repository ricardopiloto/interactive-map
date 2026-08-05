# Feature Specification: Mobile Left Offset for Nodes and Locals

**Feature Branch**: `047-mobile-left-offset`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Somente quando em modo celular, os nós e locais são deslocados levemente para a esquerda."

## Clarifications

### Session 2026-08-04

- Q: Qual a magnitude do deslocamento à esquerda no celular? → A: Moderado (~6–10 píxeis de ecrã).
- Q: Onde aplicar o nudge móvel? → A: Apenas no **mapa da campanha** (locais + nós aí visíveis); Rede de rotas / digitizer **sem alteração**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcadores alinhados no telemóvel (Priority: P1)

Em ecrã celular (layout móvel da aplicação), um jogador ou GM vê o **mapa da campanha** e os **pins de locais** e os **nós** aí visíveis aparecem ligeiramente mais à **esquerda** do que no desktop, de forma a corrigir o desalinhamento visual percebido no telemóvel. No desktop (ou quando o layout não é móvel), a posição visual mantém-se como hoje. A vista Rede de rotas / digitizer **não** muda.

**Why this priority**: É o único requisito do pedido; sem isto o problema no móvel permanece.

**Independent Test**: Abrir o mapa da campanha em viewport móvel e em desktop com o mesmo zoom/ponto de referência; no móvel, locais e nós do mapa da campanha devem estar levemente deslocados à esquerda face ao desktop; no desktop, sem mudança; digitizer inalterado.

**Acceptance Scenarios**:

1. **Given** a aplicação em **modo celular** no **mapa da campanha**, **When** o utilizador observa pins de locais e nós aí visíveis, **Then** cada um desses marcadores aparece deslocado cerca de **6–10 píxeis de ecrã** para a **esquerda** em relação ao alinhamento usado no desktop para a mesma coordenada no mapa.
2. **Given** a aplicação em layout **desktop** (não celular), **When** o utilizador observa os mesmos locais e nós no mapa da campanha, **Then** o alinhamento visual permanece o comportamento actual (sem o deslocamento desta feature).
3. **Given** modo celular no mapa da campanha, **When** o utilizador faz zoom ou pan, **Then** o deslocamento relativo à esquerda mantém-se estável (não “salta” nem desaparece ao interagir com o mapa).
4. **Given** modo celular na **Rede de rotas / digitizer**, **When** o utilizador observa nós nessa vista, **Then** o alinhamento permanece o actual (sem o nudge desta feature).

---

### User Story 2 - Transição celular ↔ desktop (Priority: P2)

Ao passar de modo celular para desktop (ou o inverso) — por exemplo ao redimensionar a janela ou rodar o dispositivo — o deslocamento à esquerda **aplica-se só** enquanto o modo celular estiver activo e **remove-se** quando deixa de estar.

**Why this priority**: Evita que o offset móvel “fure” para o desktop e confirma o âmbito “somente celular”.

**Independent Test**: Com o mapa aberto, alternar entre viewport estreita (celular) e larga (desktop); o nudge à esquerda só é visível no modo celular.

**Acceptance Scenarios**:

1. **Given** mapa em modo celular com locais/nós deslocados à esquerda, **When** o layout passa a desktop, **Then** o deslocamento extra à esquerda deixa de se aplicar.
2. **Given** mapa em desktop sem o nudge, **When** o layout passa a celular, **Then** o deslocamento ligeiro à esquerda passa a aplicar-se a locais e nós.

---

### Edge Cases

- Pin do **grupo**: fora do pedido explícito — **não** recebe este deslocamento (só nós e locais no mapa da campanha).
- Segmentos / traçado de rota: a geometria das rotas **não** é deslocada; apenas os marcadores de nós e locais no mapa da campanha.
- **Rede de rotas / digitizer**: fora de âmbito — sem nudge desta feature.
- Selecção, hover e destaque de pins/nós no mapa da campanha: continuam a funcionar; o deslocamento não deve “partir” hit-areas de forma a tornar impossível tocar no marcador.
- Modo GM no mapa da campanha (reposicionar local, etc.): o ponto geográfico guardado **não** muda; só a apresentação no celular. Clique/toque para posicionar continua a registar a coordenada correcta no mapa (sem gravar o nudge como posição real).
- Mapa sem locais ou sem nós visíveis: nada a deslocar; sem erro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em **modo celular** no **mapa da campanha**, o sistema MUST apresentar pins de **locais** deslocados para a **esquerda** cerca de **6–10 píxeis de ecrã** face ao alinhamento desktop da mesma posição no mapa.
- **FR-002**: Em **modo celular** no **mapa da campanha**, o sistema MUST apresentar **nós** aí visíveis deslocados para a **esquerda** cerca de **6–10 píxeis de ecrã**, de forma coerente com os locais.
- **FR-003**: Fora do modo celular, o sistema MUST NOT aplicar este deslocamento extra à esquerda a locais nem a nós no mapa da campanha.
- **FR-004**: O deslocamento MUST ser **apenas visual** (apresentação); MUST NOT alterar coordenadas persistidas de locais, nós, segmentos ou grupo.
- **FR-005**: O pin do **grupo** MUST NOT receber este deslocamento (âmbito limitado a nós e locais no mapa da campanha).
- **FR-006**: Traçados de rota / geometria de segmentos MUST NOT ser deslocados por esta feature.
- **FR-007**: Ao entrar ou sair do modo celular, a presença ou ausência do deslocamento no mapa da campanha MUST actualizar-se sem exigir recarregar a página.
- **FR-008**: A vista **Rede de rotas / digitizer** MUST NOT receber o deslocamento desta feature (mesmo em modo celular).

### Key Entities

- **Local (pin)**: Marcador de local no mapa da campanha; posição lógica inalterada; apresentação com nudge à esquerda só em celular.
- **Nó (mapa da campanha)**: Marcador de nó da rede quando mostrado no mapa da campanha; mesma regra de apresentação; digitizer fora de âmbito.
- **Modo celular**: Layout/viewport móvel já usado pela aplicação (o mesmo critério que activa o resto da UI móvel).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em modo celular no mapa da campanha, um revisor consegue verificar lado a lado (ou por alternância rápida) que locais e nós aí visíveis estão **visivelmente mais à esquerda** (~6–10 píxeis de ecrã) do que no desktop para o mesmo ponto do mapa, sem parecerem “soltos” ou desalinhados de forma grosseira.
- **SC-002**: Em desktop, 100% dos locais e nós observados no mapa da campanha mantêm o alinhamento pré-existente (sem regressão do nudge móvel).
- **SC-003**: Em ≤ 1 minuto de verificação manual, um revisor confirma que o pin do grupo, os traçados de rota e os nós na **Rede/digitizer** **não** sofreram o deslocamento desta feature.
- **SC-004**: Ao alternar celular ↔ desktop no mapa da campanha, o nudge aparece/desaparece na mesma sessão, sem recarregar a aplicação.

## Assumptions

- “Modo celular” é o layout móvel já existente na aplicação (mesmo critério usado para o resto da UI móvel), não um modo separado só para marcadores.
- “Ligeiramente” = deslocamento **uniforme de ~6–10 píxeis de ecrã** para a esquerda (mesmo valor para todos os locais e nós no mapa da campanha em celular); pode ser afinado ± poucos píxeis na QA desde que permaneça nessa ordem de grandeza e SC-001 se verifique.
- Âmbito = **apenas mapa da campanha**; Rede de rotas / digitizer fica como está.
- O desalinhamento actual no telemóvel é um problema de **apresentação**; não se reabre o trabalho diferido da feature 030 nem se altera o modelo de dados.
- Hit-targets no telemóvel podem acompanhar o deslocamento visual o suficiente para o toque continuar natural; não é necessário um hit-area separado maior para esta feature.
- Idioma da UI e restantes comportamentos do mapa (zoom, pan, custos de rota, etc.) ficam inalterados.
