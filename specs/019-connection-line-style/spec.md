# Feature Specification: Estilo das linhas de conexão

**Feature Branch**: `019-connection-line-style`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Edite a cor da linha feita na spec specs/017-location-connections, ela tem que ser um vermelha, com um tom mais claro, tem que ter sombra e ajuste também a opacidade da linha, deixe ela um pouco mais transparente."

## Clarifications

### Session 2026-08-03

- Q: Qual tom de vermelho claro? → A: Vermelho “visitado”, mas mais claro (mesma família do pin vermelho de visitado).
- Q: Quão transparente deve ser a linha? → A: Moderada (~55–65% de opacidade) — mapa legível sob o traço; rota ainda clara.
- Q: Quão forte deve ser a sombra da linha? → A: Suave/discreta — volume leve, sem glow.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer a rota no mapa (Priority: P1)

Um jogador (ou GM) seleciona um local com saídas cadastradas (017) e vê as linhas ligando origem e destinos. As linhas aparecem em vermelho claro, com sombra suave e um pouco mais transparentes, de modo a destacar a jornada sem cobrir o mapa ou competir com os pins.

**Why this priority**: É a mudança visual pedida sobre o comportamento já existente das conexões; sem o estilo certo, as rotas passam despercebidas ou poluem o mapa.

**Independent Test**: Com pelo menos um local A com saídas para B (e preferencialmente C), abrir o pin/selecionar A e confirmar visualmente cor vermelho-clara, sombra e transparência; fechar a seleção e confirmar que as linhas somem (comportamento 017 inalterado).

**Acceptance Scenarios**:

1. **Given** um local com uma ou mais saídas, **When** o usuário seleciona ou abre esse local, **Then** as linhas de conexão aparecem em tom **vermelho claro da família “visitado”** (mais claro que o pin visitado sólido; não accent roxo; não vermelho escuro/pesado).
2. **Given** as linhas visíveis, **When** o usuário observa o mapa, **Then** cada linha tem **sombra suave/discreta** (volume leve; sem glow exagerado).
3. **Given** as linhas visíveis sobre o mapa-base, **When** o usuário compara com pins e terreno, **Then** as linhas usam opacidade **moderada (~55–65%)** — o mapa por baixo permanece legível e a rota ainda se lê de relance.
4. **Given** nenhum local selecionado, **When** o mapa é visto, **Then** nenhuma linha permanece (regras de visibilidade da 017).

---

### User Story 2 - Não confundir com pin visitado (Priority: P2)

O usuário distingue a linha de rota do pin “visitado” (vermelho de marcação): a linha usa vermelho claro/transparente com sombra; o pin continua com a cor própria do local.

**Why this priority**: Ambos usam família vermelha; a linha não deve parecer um “risco sólido” igual ao pin visitado.

**Independent Test**: Selecionar um local visitado (pin vermelho) com saídas; confirmar que linha e pin são visualmente distintos.

**Acceptance Scenarios**:

1. **Given** um pin vermelho “visitado” com saídas, **When** as linhas aparecem, **Then** a linha é claramente mais clara/transparente que o preenchimento sólido do pin.

---

### Edge Cases

- Muitas saídas do mesmo hub: todas usam o mesmo estilo; sombra não torna o emaranhado ilegível.
- Zoom alto/baixo: espessura e sombra continuam coerentes (não “somem” nem viram borrão).
- Fundo claro ou escuro do mapa-base: vermelho claro + transparência + sombra ainda perceptíveis.
- Fora de escopo desta feature: mudar quando as linhas aparecem, setas, rótulos, ou cor por tipo de rota.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: As linhas de conexão de saída (017) MUST usar cor da família **vermelho “visitado”**, em tom **mais claro** que o preenchimento sólido do pin visitado (não accent roxo/lilás do tema; não vermelho escuro).
- **FR-002**: As linhas MUST ter **sombra suave/discreta** ao longo do traço (volume leve; sem glow, animação ou brilho pulsante).
- **FR-003**: As linhas MUST ter opacidade **moderada (~55–65%)** — mais transparentes que um traço opaco 100%, preservando legibilidade do mapa sob a linha e leitura rápida da rota.
- **FR-004**: O comportamento de quando mostrar/ocultar linhas (só no foco do local de origem) MUST permanecer o da 017.
- **FR-005**: Pins, marcador do grupo e demais elementos do mapa MUST manter suas cores atuais; só o estilo da **linha de conexão** muda nesta feature.
- **FR-006**: Não MUST introduzir setas, rótulos na linha, nem cores diferentes por destino nesta feature.

### Key Entities

- **Linha de conexão de saída**: Traço visual entre pin de origem e pin de destino quando o local de origem está em foco (definido na 017); nesta feature apenas atributos visuais (cor, sombra, opacidade).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão visual com ≥2 saídas de um local, 2 observadores independentes classificam a linha como vermelho claro da família “visitado” (não roxa; mais clara que o pin visitado sólido) em ≤10 segundos.
- **SC-002**: Em zoom médio do mapa, a sombra suave da linha é perceptível sem ofuscar pins vizinhos e sem parecer glow.
- **SC-003**: Com a linha sobreposta ao mapa, o terreno sob o traço continua distinguível e a rota permanece legível de relance (opacidade alvo ~55–65%).
- **SC-004**: Selecionar e deselecionar o local continua mostrando/ocultando linhas exatamente como na 017 (nenhuma regressão de comportamento).

## Assumptions

- Escopo limitado ao **estilo visual** das linhas já desenhadas pela 017; sem novos dados, formulários ou regras de cadastro.
- “Vermelho claro” (clarificado): mesma família do vermelho de pin **visitado**, porém **mais claro** na linha; o pin visitado permanece com a cor sólida atual.
- Transparência (clarificada): opacidade alvo **~55–65%** (moderada); implementação pode ajustar fino dentro dessa faixa se SC-003 passar.
- Sombra (clarificada): drop-shadow **suave/discreto** no traço (volume leve); sem animação, glow ou brilho pulsante.
- Fora de escopo: personalizar cor da linha por local; modo daltonismo dedicado além do contraste razoável vermelho-sobre-mapa.
