# Feature Specification: Controles de zoom sempre visíveis

**Feature Branch**: `007-visible-zoom-controls`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Outro ponto são os botões de zoom e 1:1 em um navegador full screen, os controls ficam fora da tela, necessário ajustar para garantir que eles sejam sempre visiveis pelo usuário."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Usar zoom em tela cheia (Priority: P1)

Um jogador ou mestre de jogo abre o mapa da campanha com o navegador em tela cheia (ou janela alta/ampliada). Os botões de aproximar, afastar e 1:1 permanecem **inteiramente visíveis** dentro da área útil do mapa, sem ficar cortados pela borda inferior da janela nem escondidos atrás de outras faixas da interface (cabeçalho, barra inferior mobile, etc.). O usuário consegue acionar cada botão sem redimensionar a janela.

**Why this priority**: Sem os controles, o usuário perde a forma principal de ajustar o zoom do mapa — impacto direto na navegação espacial da campanha.

**Independent Test**: Abrir o app em tela cheia (F11 ou modo tela cheia do navegador) no desktop e confirmar que +, − e 1:1 estão totalmente visíveis e clicáveis; repetir em viewport alta típica sem tela cheia.

**Acceptance Scenarios**:

1. **Given** o mapa carregado e o navegador em tela cheia no desktop, **When** o usuário olha para a área do mapa, **Then** os botões +, − e 1:1 estão completamente visíveis (nenhuma parte cortada pela borda da janela).
2. **Given** o mapa em tela cheia, **When** o usuário clica em +, − e 1:1, **Then** o zoom responde normalmente (aproxima, afasta, reseta).
3. **Given** o mapa em janela maximizada ou alta (sem F11), **When** a viewport muda de altura, **Then** os mesmos controles permanecem dentro da área visível do mapa.

---

### User Story 2 — Controles acessíveis no layout mobile (Priority: P2)

Em viewport estreita com barra de navegação inferior (quando presente), os controles de zoom continuam utilizáveis: não ficam escondidos atrás da barra nem empurrados para fora da tela.

**Why this priority**: Mobile é um modo real de uso; o mesmo problema de “fora da tela” aparece quando há chrome inferior.

**Independent Test**: Abrir em largura mobile (ou dispositivo real) com a barra inferior visível e confirmar que +, − e 1:1 estão visíveis e tocáveis acima da barra / dentro do mapa.

**Acceptance Scenarios**:

1. **Given** layout mobile com barra inferior de abas visível, **When** o mapa está em tela, **Then** os botões de zoom/1:1 não estão cobertos pela barra nem cortados pela borda inferior.
2. **Given** layout mobile, **When** o usuário toca +, − ou 1:1, **Then** o zoom funciona sem precisar deslocar a página.

---

### Edge Cases

- Modo GM com botão adicional de substituir mapa no mesmo agrupamento de controles: esse botão também deve permanecer na área visível (não só +, −, 1:1).
- Legenda do mapa (canto inferior): pode coexistir com os controles; nenhum dos dois deve ficar inutilizável por sobreposição total ou corte de tela.
- Banner de posicionamento (GM colocando pin/grupo): não deve empurrar permanentemente os controles para fora da área visível.
- Zoom extremo / pan do mapa: os controles de chrome ficam fixos em relação à **janela do mapa**, não “viajam” junto com o pan do conteúdo para fora da tela.
- Orientação paisagem em mobile: controles ainda visíveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Os controles de aproximar, afastar e 1:1 MUST permanecer inteiramente dentro da área visível do mapa em navegador em tela cheia no desktop.
- **FR-002**: Os mesmos controles MUST permanecer inteiramente dentro da área visível do mapa em layouts com chrome inferior (ex.: navegação mobile), sem ficarem cobertos por esse chrome.
- **FR-003**: Os controles MUST permanecer acionáveis (clique/toque) sempre que o mapa estiver visível — sem exigir que o usuário redimensione a janela ou role a página da aplicação.
- **FR-004**: Qualquer controle adicional agrupado com o zoom em modo GM (ex.: substituir mapa) MUST seguir a mesma regra de visibilidade.
- **FR-005**: Pan e zoom do conteúdo do mapa MUST NOT deslocar os controles de chrome para fora da viewport do mapa.
- **FR-006**: Ajuste de posição/layout dos controles MUST NOT remover ou desativar as funções existentes de aproximar, afastar e 1:1.

### Key Entities

- **Controles de zoom do mapa**: conjunto de ações de aproximar, afastar e restaurar escala 1:1 (e, em GM, o controle de substituir mapa no mesmo grupo).
- **Área visível do mapa**: região da tela onde o mapa é exibido, descontando cabeçalho da página e barras de navegação da aplicação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste desktop com navegador em tela cheia, 100% dos botões +, − e 1:1 estão totalmente visíveis (0 botões cortados ou fora da janela).
- **SC-002**: Em teste mobile com barra inferior presente, 100% dos mesmos botões estão totalmente visíveis e tocáveis.
- **SC-003**: Um avaliador consegue completar a sequência aproximar → afastar → 1:1 em ≤15 segundos em tela cheia, sem redimensionar a janela.
- **SC-004**: Em 100% dos testes de pan do mapa, os controles de zoom permanecem na mesma posição relativa à janela do mapa (não saem da área visível com o pan).

## Assumptions

- O problema reportado é de **posicionamento/visibilidade** dos controles em relação à viewport, não de ausência dos botões no produto.
- “Full screen” inclui tela cheia do navegador (F11 / modo tela cheia) e janelas maximizadas altas; o critério é: controles sempre na área útil do mapa.
- A legenda pode permanecer no canto inferior; o foco obrigatório desta feature são os controles de zoom/1:1 (e o controle GM agrupado, se existir).
- Não é necessário redesign visual amplo dos botões — apenas garantir que fiquem sempre acessíveis.
- Fora de escopo: novos gestos de zoom, atalhos de teclado, ou mudança da biblioteca de pan/zoom além do necessário para manter os controles visíveis.
