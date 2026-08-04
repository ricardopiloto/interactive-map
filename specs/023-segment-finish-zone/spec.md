# Feature Specification: Zona Menor de Finalização de Segmento

**Feature Branch**: `023-segment-finish-zone`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: "A área de finalização do Traçar segmento está muito grande, se eu chego em uma distancia X do nó de destino ele já conclui a rota automaticamente, eu quero que o GM possa criar rotas mais detalhadas, deixe a zona do nó de destino menor, dessa maneira o GM é obrigado a desenhar a rota até mais perto do nó destino."

## Clarifications

### Session 2026-08-03

- Q: Quão menor deve ser a zona de finalização? → A: ~⅓ da zona atual (opção B)
- Q: Zona ao escolher origem vs. fechar no destino? → A: Origem na zona atual; só o destino fica ~⅓ (opção A)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Finalizar segmento só perto do destino (Priority: P1)

Como Mestre, ao traçar um segmento, quero que a rota só finalize quando eu clicar bem próximo do nó de destino — não quando ainda estou a uma distância generosa — para poder colocar pontos intermediários mais perto do destino e traçar caminhos mais detalhados.

**Why this priority**: Zona grande demais encerra o segmento cedo e impede polilinhas fiéis à arte do mapa perto do nó.

**Independent Test**: Traçar segmento → aproximar-se do destino sem estar “colado” → clicar no mapa (ponto intermediário) → segmento NÃO fecha; só fecha ao clicar no próprio nó (ou na zona reduzida imediatamente ao redor).

**Acceptance Scenarios**:

1. **Given** o Mestre está em Traçar segmento com origem já escolhida, **When** clica no mapa a uma distância que antes bastava para “pegar” o destino (fora da nova zona menor), **Then** o clique adiciona um ponto intermediário (ou não finaliza) e o segmento permanece em rascunho.
2. **Given** o mesmo fluxo, **When** clica no nó de destino (ou dentro da zona reduzida ao redor dele), **Then** o segmento é gravado com origem, destino e intermediários acumulados.
3. **Given** zoom alto na digitalização, **When** o Mestre finaliza o segmento, **Then** a regra de proximidade continua exigindo proximidade real ao nó (a zona menor não se torna “grande de novo” só por causa do zoom visual).

---

### User Story 2 - Escolher origem sem regressão frustrante (Priority: P2)

Como Mestre, ao começar um segmento, ainda quero conseguir selecionar o nó de origem com conforto razoável; a restrição mais apertada aplica-se sobretudo à **finalização** no destino, não deve tornar o início do traçado inutilizável.

**Why this priority**: Evita trocar um problema (fecha cedo) por outro (difícil começar o segmento).

**Independent Test**: Entrar em Traçar segmento → clicar perto do nó de origem (zona de seleção de origem) → origem seleciona; depois exigir proximidade maior para fechar no destino.

**Acceptance Scenarios**:

1. **Given** Traçar segmento sem origem, **When** o Mestre clica no (ou imediatamente sobre) um nó de origem, **Then** a origem é selecionada sem exigir precisão extrema demais.
2. **Given** origem já selecionada, **When** tenta finalizar noutro nó via clique no mapa, **Then** aplica-se a zona de finalização ≈⅓ (mais exigente); a zona usada para escolher a origem permanece a atual.

---

### User Story 3 - Feedback claro de como fechar (Priority: P3)

Como Mestre, quero entender que preciso chegar mais perto do destino (dica ou comportamento previsível), para não achar que o fechamento “quebrou”.

**Why this priority**: Zona menor muda o hábito; uma dica curta reduz erro.

**Independent Test**: Com origem selecionada, ler a dica na vista; tentar fechar longe do destino e ver que não grava; fechar no nó e ver sucesso.

**Acceptance Scenarios**:

1. **Given** Traçar segmento com origem escolhida, **When** a vista mostra a orientação ao Mestre, **Then** fica claro que deve clicar no nó de destino (perto dele) para salvar.
2. **Given** clique longe do destino, **When** o segmento não fecha, **Then** não há mensagem de erro alarmante desnecessária — o fluxo continua permitindo intermediários.

---

### Edge Cases

- Clique exatamente sobre o nó de origem depois de já ter origem: não deve gravar segmento “para si mesmo”; comportamento atual (ignorar) permanece.
- Dois nós muito próximos no mapa: a zona menor reduz fechamento acidental no nó errado; se ainda houver ambiguidade, vence o nó mais próximo dentro da zona (ou o clique explícito no marcador do nó).
- Zoom extremo (digitalização): a exigência é em coordenadas do mapa, não em pixels da tela — o Mestre ainda precisa chegar perto do nó no mapa.
- Fora de Traçar segmento (criar nó, escala, mapa do jogador): fora de escopo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em Traçar segmento, com origem já definida, um clique no mapa SÓ DEVE finalizar o segmento se o alvo for o nó de destino (marcador) ou estiver dentro de uma **zona de finalização** com raio ≈ **⅓ da zona de captura atual** em torno desse nó.
- **FR-002**: Cliques no mapa **fora** dessa zona reduzida, com origem definida, DEVEM continuar o traçado (ex.: ponto intermediário), sem gravar o segmento.
- **FR-003**: A redução da zona aplica-se **apenas à finalização** no destino (~⅓). A seleção inicial da origem DEVE manter a **zona de captura atual** (mais generosa), para o início do traçado continuar fácil.
- **FR-004**: Clicar diretamente no marcador visual do nó de destino DEVE continuar finalizando o segmento (atalho explícito), independentemente da zona de “agarre” no fundo do mapa.
- **FR-005**: A mudança NÃO DEVE alterar geometria já gravada, escala da campanha, nem o algoritmo de planejamento de rotas — apenas a sensibilidade de interação ao fechar o rascunho.

### Key Entities

- **Segmento em rascunho**: Origem escolhida, pontos intermediários, destino ainda não confirmado.
- **Zona de finalização**: Área ao redor de um nó em que um clique no mapa conta como “acertei este nó” para fechar o segmento; alvo desta feature é **encolhê-la**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com o Mestre, em ≥ 8 de 10 tentativas, um clique deliberado na faixa que a zona antiga cobria mas a nova (~⅓) não cobre **não** grava o segmento e permite continuar a polilinha.
- **SC-002**: Em ≥ 9 de 10 tentativas, clicar no marcador do nó de destino (ou bem junto a ele, na zona nova ~⅓) grava o segmento corretamente com os intermediários.
- **SC-003**: O Mestre consegue colocar pelo menos um ponto intermediário **mais perto** do destino do que era possível antes (quando a zona grande “roubava” o clique), em um cenário de traçado ao longo de uma estrada curva.
- **SC-004**: Escolher origem com a zona atual permanece fácil (subjetivo: “ainda fácil” em teste rápido com o Mestre; sem apertar a captura de origem).

## Assumptions

- O problema é a **área de captura / proximidade** ao “agarrar” um nó ao clicar no mapa durante Traçar segmento (não o tamanho visual do pin sozinho, embora pin grande também ajude a fechar — o foco é a zona de finalização automática por proximidade).
- Valor-alvo travado: zona de finalização ≈ **⅓** da distância de captura atual; o valor numérico exato no plano técnico deve refletir essa proporção.
- Preferência travada: zona de **finalização** ≈⅓; zona de **seleção de origem** inalterada (igual à captura atual).
- Clique no marcador do nó permanece o caminho mais confiável para fechar.
- Extensão UX da digitalização de rotas (021 / 022), sem novos dados persistidos.

## Out of Scope

- Alterar criação de nós, escala, ou planner de rotas.
- Magnetismo contínuo / “snap” visual da polilinha enquanto desenha (só a zona de conclusão no destino).
- Mudar zoom máximo (já coberto por 022).
- Redesenhar a arte dos nós além do necessário para a zona de clique.
