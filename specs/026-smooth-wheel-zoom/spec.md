# Feature Specification: Zoom Suave com a Roda do Mouse

**Feature Branch**: `026-smooth-wheel-zoom`  
**Created**: 2026-08-03  
**Status**: Draft  
**Input**: User description: "Crie mais steps para o zoom com o scroll do mouse, o step atual é muito grande, ele ou vai para muito longe ou vai muito perto, adicione mais opções para deixar mais suave, similar aos steps feitos com os botões de + e - do zoom."

## Clarifications

### Session 2026-08-03

- Q: Em que vistas aplicar o zoom mais suave? → A: Mapa da campanha e Rede de rotas (digitalização)
- Q: Na Rede de rotas, priorizar suavidade ou velocidade até ao máximo? → A: Priorizar suavidade; aceitar até ~15 s de scroll contínuo até ao máximo
- Q: Relação entre um tick da roda e um clique em +/−? → A: Um tick de roda ≈ um clique em +/− (mesma ordem de magnitude)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ajustar zoom com a roda de forma gradual (Priority: P1)

Como utilizador (jogador ou Mestre), ao usar a roda do mouse no mapa, quero que cada “tick” de scroll mude o zoom em passos **menores e mais suaves**, próximos da sensação dos botões +/−, em vez de saltar demasiado perto ou longe de uma vez.

**Why this priority**: Controlo fino do mapa (e da digitalização de rotas) depende de zoom previsível; o passo atual da roda é demasiado agressivo.

**Independent Test**: No mapa da campanha, um tick de scroll e um clique em +/− devem produzir mudança de zoom da **mesma ordem de magnitude**.

**Acceptance Scenarios**:

1. **Given** o mapa da campanha visível, **When** o utilizador faz um único tick de scroll para aproximar, **Then** o zoom aumenta de forma perceptível mas **moderada** (não salta para perto do máximo de uma vez).
2. **Given** o mesmo mapa, **When** compara um tick de roda com um clique em +, **Then** a variação de zoom é da **mesma ordem de magnitude** (um tick ≈ um clique).
3. **Given** zoom no mínimo ou no máximo, **When** continua a fazer scroll na mesma direção, **Then** o mapa respeita os limites e não “salta” de forma errática.

---

### User Story 2 - Mesma suavidade na digitalização de rotas (Priority: P2)

Como Mestre na vista Rede de rotas, quero a mesma suavidade de scroll ao traçar segmentos com zoom alto, sem regressar a saltos grandes.

**Why this priority**: A digitalização (022) usa teto de zoom maior; passo grosseiro atrapalha precisão.

**Independent Test**: Abrir Rede de rotas → scroll tick a tick → aproximação gradual até ao máximo; pan e desenho continuam usáveis.

**Acceptance Scenarios**:

1. **Given** a vista Rede de rotas, **When** o Mestre compara um tick de roda com um clique em +/−, **Then** a variação é da mesma ordem de magnitude.
2. **Given** o ajuste de suavidade, **When** o Mestre ainda precisa chegar ao zoom máximo, **Then** scroll contínuo razoável completa em **≤ ~15 segundos** (não dezenas de segundos).

---

### Edge Cases

- Trackpad / scroll contínuo: o comportamento deve permanecer controlável (sem acelerar de forma desproporcional num único gesto curto).
- Botões +/− mantêm o comportamento atual (ou equivalente suave); esta feature foca a **roda**.
- Limites min/max de zoom (mapa vs digitalização) **não** mudam nesta entrega — só a granularidade dos passos da roda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nas **duas** vistas com zoom por roda — mapa da campanha **e** Rede de rotas (digitalização) — o incremento/decremento por tick de scroll DEVE ser **mais fino** do que o passo atual percebido como “salto”. Ambas as vistas estão no escopo obrigatório desta entrega.
- **FR-002**: Em cada vista no escopo, **um tick de roda** DEVE produzir uma variação de zoom da **mesma ordem de magnitude** que **um clique** no botão + ou − dessa vista (paridade aproximada tick ≈ clique).
- **FR-003**: Os limites mínimo e máximo de zoom existentes DEVEM permanecer (mapa do jogador e digitalização com os seus tetos atuais).
- **FR-004**: Após o ajuste, o utilizador DEVE ainda conseguir ir do zoom inicial ao máximo da vista em tempo aceitável: **mapa da campanha ≤ 8 s**; **Rede de rotas ≤ ~15 s** de scroll contínuo razoável (suavidade priorizada sobre velocidade na digitalização).
- **FR-005**: Os botões +/− mantêm o passo atual; a feature ajusta a **roda** para alinhar-se a esse passo (não o contrário), salvo necessidade pontual documentada.

### Key Entities

- **Vista de mapa com zoom**: Mapa da campanha e vista Rede de rotas (digitalização).
- **Passo de zoom da roda**: Quanto a escala muda por tick/gesto de scroll.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com o utilizador, ≥ 8 de 10 ticks isolados de scroll produzem uma mudança de zoom descrita como “suave / controlável” (não “salto grande”).
- **SC-002**: O utilizador consegue parar num nível de zoom intermédio útil entre “visão geral” e “máximo” usando só a roda, em ≥ 8 de 10 tentativas.
- **SC-003**: Do zoom inicial ao máximo: **mapa da campanha ≤ 8 s**; **Rede de rotas ≤ ~15 s** de scroll contínuo razoável (FR-004).
- **SC-004**: Botões +/− continuam a funcionar; nenhuma regressão de pan/seleção no mapa.
- **SC-005**: Em teste lado a lado, ≥ 8 de 10 comparações tick-de-roda vs clique-+/− são julgadas “mesma ordem de magnitude” (FR-002).

## Assumptions

- O problema reportado aplica-se às vistas que já usam zoom por roda (mapa da campanha e Rede de rotas); ambas entram no escopo.
- “Mais steps” = **passos menores** (maior número de ticks para a mesma variação de escala), não novos botões de zoom.
- Referência de suavidade: **um tick de roda ≈ um clique** nos botões +/− existentes em cada vista.
- Na digitalização, o passo da roda foi aumentado noutro momento para chegar rápido ao zoom alto; esta feature **reduz** a agressividade e **prioriza suavidade**, com teto de tempo relaxado (~15 s) na Rede de rotas.
- Sem mudança de modelo de dados ou API.

## Out of Scope

- Alterar tetos min/max de zoom (exceto se inevitável e documentado — default: não alterar).
- Adicionar novos controlos de zoom (+/− extras).
- Zoom em outras superfícies que não sejam mapa/digitalização.
- Configuração persistente “preferência de sensibilidade” do utilizador (pode ser default único).
