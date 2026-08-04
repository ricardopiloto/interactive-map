# Feature Specification: Corrigir offset dos nós ao traçar segmentos

**Feature Branch**: `035-fix-digitizer-node-offset`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "A posição dos nós na tela de Traçar segmento ainda está com o offset da spec 030."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Nós alinhados ao ponto no mapa (Traçar segmento) (Priority: P1)

Em modo GM, o mestre abre a **Rede de rotas** e usa **Traçar segmento**. Os **nós** da rede aparecem no mapa **sem desvio lateral** relativamente às coordenadas guardadas e ao ponto onde o GM espera vê-los (o mesmo tipo de desalinhamento que a 030 introduziu nos pins e que a 034 corrigiu no mapa da campanha). Ao clicar num nó para ligar um segmento, o alvo visual coincide com o marcador.

**Why this priority**: Com nós deslocados, traçar segmentos é impreciso e frustrante; a 034 não cobriu esta superfície.

**Independent Test**: Abrir Rede de rotas → Traçar segmento → observar nós existentes (e, se aplicável, após colocar um nó novo) — o centro do marcador do nó coincide com o ponto do mapa correspondente às suas coordenadas, sem desvio “para o lado” perceptível.

**Acceptance Scenarios**:

1. **Given** Rede de rotas aberta com pelo menos um nó e modo **Traçar segmento** activo, **When** o GM observa um nó sobre um ponto de referência conhecido no mapa, **Then** o marcador do nó não aparece deslocado lateralmente de forma notória.
2. **Given** Traçar segmento activo e um nó de origem seleccionado, **When** o GM clica noutro nó para fechar o segmento, **Then** o clique no marcador corresponde ao nó pretendido (o desvio visual não induz a seleccionar o sítio errado).
3. **Given** zoom in/out na Rede de rotas em Traçar segmento, **When** o GM altera a escala, **Then** o alinhamento dos nós relativamente ao mapa permanece correcto.

---

### User Story 2 — Colocar nó e restantes modos da Rede (Priority: P2)

O mesmo alinhamento correcto dos nós aplica-se também ao colocar nós (e ao modo idle da Rede), para não haver dois “mundos” de posição na mesma tela.

**Why this priority**: Os marcadores são os mesmos; corrigir só Traçar segmento e deixar Colocar nó desalinhado reintroduziria confusão.

**Independent Test**: Colocar um nó novo num ponto óbvio → o marcador fica nesse ponto; depois Traçar segmento usa esse nó sem desvio.

**Acceptance Scenarios**:

1. **Given** modo **Colocar nó** (ou equivalente) na Rede de rotas, **When** o GM clica num ponto do mapa para criar um nó, **Then** o marcador do nó aparece alinhado a esse ponto (sem o desvio atribuído à 030).
2. **Given** a Rede de rotas sem Traçar segmento activo, **When** o GM vê os nós, **Then** o alinhamento é o mesmo que em Traçar segmento.

---

### Edge Cases

- Segmentos e linhas (incluindo rascunho com pontos intermédios) MUST continuar a ligar-se aos nós nas coordenadas correctas; após a correção visual, linhas e nós MUST permanecer coerentes entre si.
- Pontos intermédios ao traçar segmento: se tiverem marcação visual, MUST seguir o mesmo critério de alinhamento; se forem só geometria da linha, a linha MUST passar pelos pontos clicados.
- Mapa da campanha (pins de locais / grupo): já tratado pela 034 — fora de âmbito salvo regressão óbvia.
- Coordenadas guardadas dos nós MUST NOT ser alteradas em massa só para “compensar” o desvio (corrigir apresentação; dados existentes devem alinhar-se ao mapa após o fix visual).
- Feature 030 continua Deferred/Staged; esta correção não a reactiva no mapa da campanha.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na vista **Rede de rotas**, com **Traçar segmento** activo, cada marcador de nó MUST coincidir visualmente com as coordenadas do nó no mapa, sem desvio lateral perceptível do tipo introduzido pela apresentação 030.
- **FR-002**: O alinhamento correcto dos nós MUST aplicar-se também ao colocar nós e à visualização idle na Rede de rotas (mesmos marcadores).
- **FR-003**: Zoom e pan na Rede de rotas MUST preservar o alinhamento nó ↔ ponto do mapa.
- **FR-004**: Coordenadas persistidas dos nós MUST permanecer inalteradas por esta feature (apenas apresentação / âncora visual).
- **FR-005**: Segmentos desenhados (e rascunhos) MUST permanecer geometricamente coerentes com as posições dos nós após a correção visual.
- **FR-006**: Selecção de nó ao traçar segmento (origem/destino) MUST continuar fiável após a correção.
- **FR-007**: O mapa principal da campanha (pins de locais) MUST NOT voltar ao visual 030 por causa desta feature.

### Key Entities

- **Nó da rede (waypoint)**: ponto da rede de vias; tem coordenadas no mapa; marcado na Rede de rotas.
- **Traçar segmento**: modo GM para ligar dois nós (com pontos intermédios opcionais).
- **Marcador de nó**: indicação visual do waypoint na Rede de rotas (distinto do pin de Local da campanha).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes em Traçar segmento com ponto de referência, o desvio lateral do marcador do nó é imperceptível em uso normal.
- **SC-002**: Em 100% dos testes “colocar nó → observar em Traçar segmento”, o marcador permanece no ponto clicado.
- **SC-003**: Um GM consegue iniciar e fechar um segmento entre dois nós visíveis em ≤30 segundos sem falhar o alvo por desalinhamento visual.
- **SC-004**: Em 100% dos testes de zoom na Rede, o alinhamento dos nós não reintroduz desvio lateral notório.

## Assumptions

- O desalinhamento reportado é o mesmo *tipo* de problema de âncora/offset associado à 030, mas na superfície **Rede de rotas / Traçar segmento**, não nos pins do mapa da campanha (já revertidos na 034).
- “Ainda está com o offset” implica que a 034 não cobriu (ou não corrigiu) os marcadores de nó desta vista.
- Não se exige redesenhar o fluxo de traçar segmentos — só alinhar a posição visual dos nós.
- Dados de nós já gravados estão correctos; o bug é de apresentação.
