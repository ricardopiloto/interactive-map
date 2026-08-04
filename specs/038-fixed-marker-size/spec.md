# Feature Specification: Marcadores menores com tamanho fixo no zoom

**Feature Branch**: `038-fixed-marker-size`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Vamos diminuir o tamanho dos pins e dos nós, e manter o tamanho deles como fixo, independente do zoom do usuário estiver utilizando, quero que eles ocupem menos espaço de tela."

## Clarifications

### Session 2026-08-04

- Q: Onde aplicar tamanho fixo e menor → A: Mapa da campanha (pins + grupo + nós/rota se visíveis) **e** Rede de rotas / digitizer
- Q: Destaque ao seleccionar / hover → A: Manter aumento perceptível de tamanho no seleccionado/hover (como hoje, mas a partir do novo tamanho base)
- Q: Quão menores no estado normal → A: Redução moderada: área de ecrã ≤ ~60% da actual (como SC-001/002)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pins e nós ocupam menos ecrã (Priority: P1)

Um jogador ou GM vê o mapa da campanha (e, quando aplicável, a Rede de rotas) e os pins de locais/grupo e os nós da rede aparecem **visivelmente mais pequenos** do que hoje, cobrindo menos arte do mapa e facilitando a leitura do terreno à volta.

**Why this priority**: O pedido central é reduzir a ocupação visual dos marcadores.

**Independent Test**: Comparar (ou recordar) o tamanho actual com o novo em zoom por omissão; os marcadores devem parecer claramente mais compactos e deixar ver mais mapa à volta.

**Acceptance Scenarios**:

1. **Given** o mapa da campanha com pins de locais (e pin do grupo, se visível), **When** o utilizador observa em zoom por omissão, **Then** cada pin ocupa claramente menos área de ecrã do que antes desta alteração.
2. **Given** nós da rede visíveis (mapa com rota / Rede de rotas / digitizer, conforme o ecrã em uso), **When** o utilizador observa em zoom por omissão, **Then** cada nó ocupa claramente menos área de ecrã do que antes.
3. **Given** vários pins próximos, **When** o utilizador olha a região, **Then** há menos sobreposição visual grossa causada pelo tamanho dos marcadores (melhor separação aparente).

---

### User Story 2 - Tamanho estável ao fazer zoom (Priority: P1)

O utilizador faz zoom in e zoom out no mapa; os pins e nós **mantêm o mesmo tamanho aparente no ecrã** (não crescem nem encolhem com o zoom do mapa). A posição continua a corresponder ao ponto geográfico no mapa.

**Why this priority**: Explicitamente pedido; sem isto, reduzir o tamanho só no zoom 100% não resolve o “ocupam demasiado ecrã” quando se aproxima.

**Independent Test**: Fixar um pin/nó; zoom mínimo → máximo; o tamanho visual do marcador no ecrã permanece constante; o ponto no mapa sob o marcador continua correcto.

**Acceptance Scenarios**:

1. **Given** um pin de local no mapa da campanha, **When** o utilizador faz zoom in até perto do máximo e zoom out até perto do mínimo, **Then** a largura/altura aparentes do pin no ecrã permanecem essencialmente iguais.
2. **Given** um nó da rede no mesmo tipo de vista com zoom, **When** o utilizador altera o zoom, **Then** o tamanho aparente do nó no ecrã permanece essencialmente igual.
3. **Given** zoom alterado, **When** o utilizador compara a ponta/centro do marcador com a feature do mapa onde foi colocado, **Then** o alinhamento espacial continua correcto (não “desliza” para longe do ponto).

---

### User Story 3 - Continuar a seleccionar e distinguir estado (Priority: P2)

Mesmo mais pequenos e de tamanho fixo, os marcadores continuam fáceis de clicar/tocar o suficiente para o uso normal, e estados (seleccionado, hover, grupo vs local, tipo de nó) continuam distinguíveis.

**Why this priority**: Compactar não deve tornar o mapa inutilizável.

**Independent Test**: Clicar/tocar pins e nós; verificar selecção/hover; confirmar que ainda se distingue local visitado/conhecido e grupo quando aplicável.

**Acceptance Scenarios**:

1. **Given** pins no mapa, **When** o utilizador selecciona um pin (e, se existir, passa o rato), **Then** o marcador aumenta de forma perceptível face ao tamanho base novo (ênfase por escala), sem recuperar o tamanho “grande” antigo do estado normal, e o tamanho base continua fixo face ao zoom do mapa.
2. **Given** nós na Rede / digitizer, **When** o utilizador selecciona ou activa um nó, **Then** o estado activo continua distinguível.
3. **Given** uso em viewport de secretária, **When** o utilizador tenta seleccionar um marcador, **Then** consegue fazê-lo sem falhar de forma sistemática por o alvo ser demasiado pequeno (alvo utilizável).

---

### Edge Cases

- Zoom extremo (mín/máx): tamanho no ecrã estável; mapa por baixo continua a escalar.
- Muitos marcadores densos: tamanho menor reduz cobertura; clique no marcador correcto ainda deve ser possível (sem exigir hit-area invisível desproporcional que volte a “bloquear” o mapa — hit-area pode ser ligeiramente maior que o desenho, mas o desenho deve permanecer compacto).
- Mobile: mesmos princípios de tamanho fixo e menor; toque deve permanecer utilizável.
- Legenda do mapa: pode manter proporção ilustrativa pequena; não precisa de “tamanho fixo com zoom” se não estiver dentro do zoom do mapa.
- Destaque de selecção/hover: aumento perceptível de tamanho a partir do novo tamanho base (como o padrão actual de ênfase); o tamanho base (não seleccionado) permanece compacto e fixo face ao zoom do mapa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Pins de locais no mapa da campanha MUST ser visualmente mais pequenos do que o tamanho base actual em zoom por omissão; a área de ecrã no estado normal MUST ser no máximo cerca de **60%** da área anterior (redução moderada).
- **FR-002**: O marcador do grupo (quando visível) MUST seguir a mesma política de tamanho reduzido (≤ ~60% da área anterior) e fixo face ao zoom.
- **FR-003**: Nós da rede MUST ser visualmente mais pequenos (≤ ~60% da área anterior no estado normal) e de tamanho de ecrã fixo face ao zoom **tanto** no mapa da campanha (quando mostrados) **como** na vista Rede de rotas / digitizer.
- **FR-004**: O tamanho aparente no ecrã dos pins e nós MUST permanecer constante quando o utilizador altera o zoom do mapa (não MUST escalar com o zoom do conteúdo).
- **FR-009**: O âmbito MUST incluir mapa da campanha (pins, grupo, nós/rota visíveis) e Rede de rotas / digitizer; MUST NÃO limitar-se a um só ecrã.
- **FR-005**: A posição dos marcadores MUST continuar a representar correctamente as coordenadas no mapa após zoom e pan.
- **FR-006**: Estados visuais (seleccionado, hover quando existir, activo no digitizer) MUST permanecer distinguíveis; seleccionado/hover MUST usar aumento perceptível de tamanho a partir do novo tamanho base (ênfase por escala), sem que o estado normal volte ao tamanho grande anterior.
- **FR-010**: O tamanho base (não seleccionado) dos marcadores MUST permanecer constante face ao zoom; a ênfase de selecção/hover MUST NÃO reintroduzir escala com o zoom do mapa (só ênfase relativa ao tamanho base fixo no ecrã).
- **FR-007**: A redução de tamanho MUST NÃO remover a capacidade de seleccionar pins/nós no uso normal em secretária; em móvel, toque MUST continuar viável.
- **FR-008**: Esta funcionalidade MUST NÃO alterar dados persistidos (coordenadas, rede, locais) — apenas apresentação e interação visual dos marcadores.

### Key Entities

- **Pin de mapa**: Marcador de local ou grupo no mapa da campanha.
- **Nó da rede**: Marcador de waypoint na visualização da rede / digitizer (e overlay de rota quando aplicável).
- **Zoom do mapa**: Nível de aproximação controlado pelo utilizador; não deve alterar o tamanho aparente dos marcadores no ecrã.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em zoom por omissão, a área de ecrã ocupada por um pin de local (caixa envolvente) é no máximo cerca de **60%** da área que ocupava antes desta alteração (redução perceptível ≥ ~40%).
- **SC-002**: Em zoom por omissão, a área de ecrã ocupada por um nó da rede cumpre a mesma redução relativa (≤ ~60% da área anterior).
- **SC-003**: Ao variar o zoom do mapa entre o mínimo e o máximo suportados, a largura aparente no ecrã de um pin (e de um nó) varia menos de **10%** (estável para o olho).
- **SC-004**: Em teste manual com pelo menos 5 pins, o utilizador selecciona o pin pretendido à primeira tentativa em ≥ 80% dos casos em secretária.
- **SC-005**: Após zoom in forte, o mapa sob/à volta do pin permanece legível (o pin não cobre a feature como um “blob” grande).

## Assumptions

- “Pins” = marcadores de locais e do grupo no mapa da campanha; “nós” = waypoints da rede de vias no mapa (quando visíveis) **e** na Rede de rotas / digitizer — ambos os ecrãs estão no âmbito (clarification 2026-08-04).
- Linhas de segmento/rota podem continuar a escalar com o zoom; só os marcadores pontuais ficam de tamanho fixo no ecrã.
- Uma ênfase perceptível por aumento de tamanho no seleccionado/hover é desejada (clarification 2026-08-04), a partir do novo tamanho base; o estado normal permanece compacto e fixo face ao zoom.
- Legenda estática fora da área com zoom não precisa da regra de “tamanho fixo com zoom”.
- Não se exige redesign completo da forma do pin (losango/teardrop); o foco é escala (redução moderada ≤ ~60% área) e estabilidade face ao zoom.
- Fora de escopo: alterar coordenadas na base de dados, lógica de rotas, ou conteúdo do menu lateral.
