# Feature Specification: Zoom fluido na rolagem do mouse

**Feature Branch**: `008-smooth-wheel-zoom`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Vamos melhorar a taxa de zoom com a rolagem do mouse, atualmente o zoom é muito grande quando o usuário usa a rolagem do mouse, precisamos diminuir os steps para ser algo mais fluído, porém, sem ser algo muito lento, leve em consideração a dimensão da imagem para trabalhar os steps do zoom."

## Clarifications

### Session 2026-08-03

- Q: O que “dimensão da imagem” deve dirigir o passo da rolagem? → A: Relação imagem ↔ área visível do mapa (quanto a imagem “ultrapassa” a viewport)
- Q: Os botões + / − devem usar o mesmo passo calibrado da rolagem? → A: Passo de clique maior que a rolagem (botões = saltos mais rápidos)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Aproximar o mapa com a roda do mouse de forma controlada (Priority: P1)

Um jogador ou mestre navega o mapa da campanha usando a rolagem do mouse (ou trackpad com gesto de scroll). Cada “tick” de rolagem altera o zoom em um incremento **menor e mais suave** do que o comportamento atual — o usuário consegue parar em um nível intermediário útil sem “pular” de muito afastado para muito próximo de uma vez. O ajuste continua responsivo: não exige dezenas de rolagens para um zoom perceptível.

**Why this priority**: É o problema central reportado — a sensibilidade atual prejudica a leitura do mapa e o posicionamento fino.

**Independent Test**: Com o mapa carregado, rolar a roda algumas vezes para frente e para trás; comparar com a expectativa de fluidez (incrementos pequenos, progressão contínua) e confirmar que o zoom ainda responde em poucos movimentos.

**Acceptance Scenarios**:

1. **Given** o mapa visível na escala inicial, **When** o usuário dá um único tick de rolagem para aproximar, **Then** o zoom aumenta de forma perceptível mas **menor** do que o salto atual (não “salta” para um zoom extremo de uma vez).
2. **Given** o usuário rola continuamente em uma direção, **When** vários ticks se acumulam, **Then** o zoom progride de forma fluida até os limites permitidos, sem sensação de travamento excessivo (não “muito lento”).
3. **Given** o usuário alterna aproximar e afastar com a rolagem, **When** realiza a sequência, **Then** consegue estabilizar em um nível intermediário útil para ler detalhes do mapa.

---

### User Story 2 — Sensibilidade adequada ao tamanho da imagem do mapa (Priority: P2)

Mapas de campanha variam de resolução/tamanho em relação à área visível. A sensibilidade da rolagem deve **levar em conta a relação entre o tamanho da imagem e a área visível do mapa** (o quanto a imagem “ultrapassa” a viewport), de modo que mapas que cobrem muito mais do que a janela ganhem passos mais finos, e mapas que já cabem bem na viewport não fiquem “grudentos” demais. O resultado deve parecer equilibrado para o mapa em uso.

**Why this priority**: O pedido explicitamente exige calibrar os steps pela dimensão da imagem; evita uma única taxa fixa inadequada para todos os mapas.

**Independent Test**: Comparar rolagem em contextos com cobertura relativa distinta (imagem que ultrapassa bastante a viewport vs. imagem que cabe de forma mais justa) e verificar fluidez utilizável em ambos.

**Acceptance Scenarios**:

1. **Given** um mapa com cobertura relativa típica da campanha, **When** o usuário usa a rolagem, **Then** a sensação de zoom é fluida e controlável.
2. **Given** um mapa cuja imagem ultrapassa substancialmente a área visível versus um que cabe de forma mais justa na viewport, **When** o usuário usa a rolagem em cada caso, **Then** os passos permanecem controláveis (finos o bastante no mapa “grande” relativo à viewport; sem lentidão excessiva no mapa que cabe melhor).

---

### Edge Cases

- Limites mínimo e máximo de zoom: a rolagem não deve “passar” dos limites; ao atingir o teto/piso, ticks extras não quebram a interface.
- Botões +, − e 1:1: continuam funcionando; **+ / − usam passo de clique maior que a rolagem** (ajuste mais rápido); 1:1 permanece reset para a escala padrão.
- Modo de posicionamento GM (cursor de crosshair / pan desabilitado): a rolagem de zoom, se ainda ativa, deve permanecer suave; se o produto já desabilitar zoom nessa situação, não reintroduzir comportamento indesejado.
- Trackpad com scroll contínuo vs. mouse com ticks discretos: ambos devem parecer controláveis (fluido, não brusco).
- Imagem ainda carregando ou indisponível: sem erros; zoom só se aplica quando o mapa está interativo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A rolagem do mouse (wheel / scroll) sobre o mapa MUST alterar o zoom em incrementos menores do que o comportamento atual, resultando em progresso mais fluido.
- **FR-002**: Os incrementos de rolagem MUST permanecer responsivos — o usuário MUST conseguir uma mudança perceptível de zoom com um número razoável de ticks (não “muito lento”).
- **FR-003**: O tamanho do passo de zoom via rolagem MUST ser calibrado pela **relação entre o tamanho da imagem e a área visível do mapa** (quanto a imagem ultrapassa a viewport): maior cobertura relativa → passos mais finos; menor cobertura relativa → passos que não fiquem excessivamente lentos.
- **FR-004**: A rolagem MUST respeitar os limites mínimo e máximo de zoom já existentes no produto (ou os equivalentes mantidos nesta entrega).
- **FR-005**: Os controles de aproximar, afastar e 1:1 MUST continuar operacionais após o ajuste da rolagem.
- **FR-007**: Cada clique em aproximar ou afastar MUST aplicar um passo de zoom **maior** do que um tick típico da rolagem calibrada (botões = mudança mais rápida; rolagem = ajuste fino).
- **FR-006**: A calibração MUST NOT tornar o zoom via rolagem inutilizável em viewports desktop típicas da aplicação.

### Key Entities

- **Mapa da campanha**: imagem de fundo com tamanho próprio em relação à área visível do mapa.
- **Cobertura relativa**: relação entre o tamanho da imagem e a viewport do mapa; base da calibração do passo.
- **Passo de zoom (rolagem)**: magnitude da mudança de escala por tick/gesto de scroll; alvo principal desta feature (ajuste fino).
- **Passo de zoom (botão)**: magnitude por clique em +/−; deliberadamente maior que o passo da rolagem.
- **Limites de escala**: escala mínima e máxima permitidas na visualização do mapa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com ≥5 avaliadores (ou 5 sessões de revisão), ≥80% descrevem a rolagem como “mais fluida / menos brusca” em relação ao comportamento atual.
- **SC-002**: Um único tick de rolagem NÃO leva o usuário do zoom inicial ao zoom máximo (nem ao mínimo) em um único gesto; são necessários múltiplos ticks para atravessar a faixa útil de zoom.
- **SC-003**: Atravessar de forma controlada uma faixa intermediária útil (ex.: de visão geral a detalhe local) leva entre ~3 e ~15 ticks de rolagem em um mouse típico — nem 1–2 ticks (brusco) nem dezenas (lento demais).
- **SC-005**: Em teste manual, um clique em + (ou −) produz uma mudança de escala perceptivelmente maior do que um único tick de rolagem na mesma faixa de zoom.

## Assumptions

- O problema está na **magnitude do passo da rolagem**, não na ausência de zoom nem nos botões +, −, 1:1.
- “Levar em consideração a dimensão da imagem” significa calibrar o passo pela **relação imagem ↔ área visível** (clarificação C), não só pelos pixels do arquivo nem por um preset manual do usuário.
- Botões +/− usam **passo de clique maior** que a rolagem (clarificação B); 1:1 permanece reset. A rolagem continua o foco da fluidez fina.
- Faixa de zoom min/max atual do produto é aceitável como ponto de partida; não é obrigatório expandir o intervalo nesta feature, salvo se necessário para a calibração.
- Fora de escopo: novos gestos de pinch dedicados além do que o produto já oferece; redesign visual dos botões; persistência da escala entre sessões.
