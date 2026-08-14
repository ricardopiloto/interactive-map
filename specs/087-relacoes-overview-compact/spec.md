# Feature Specification: Vista geral mais compacta (Relações)

**Feature Branch**: `087-relacoes-overview-compact`

**Created**: 2026-08-14

**Status**: Implemented

**Input**: User description: "Vamos diminuir a distancia geral dos discos quando não há nenhum disco selecionado, os NPCs estão ficando muito longe do PJs, o zoom out máximo não consegue colocar todos na mesma tela. Não podemos deixar os itens próximos demais que eles fiquem sobrepostos."

**Depends on**: Rede de Relações ([066](../066-relationship-network/spec.md)); compactação do anel de foco ([086](../086-relacoes-list-compact/spec.md))

**Supersedes (parcial)**: [086](../086-relacoes-list-compact/spec.md) FR-008 / SC-005 / US2 cenário 3 — a vista geral **passa** a usar folga menor; o anel interior do foco com >6 conexões permanece como na 086.

## Clarifications

### Session 2026-08-14

- Q: Até onde pode apertar a vista geral? → A: Nunca ao ponto de discos ou nomes se sobreporem. A não-sobreposição é o chão: prevalece sobre «caber tudo no zoom mínimo».

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver toda a Rede no palco sem selecção (Priority: P1)

Na vista geral (nenhum personagem seleccionado), PJs continuam no anel interior e NPCs no exterior, mas o conjunto fica **mais junto**: os NPCs não ficam tão longe dos PJs e, no zoom out máximo, a campanha típica cabe no palco quando isso for possível **sem** discos ou nomes se sobreporem.

**Why this priority**: Hoje o anel de NPCs empurra o grafo para além do zoom mínimo; a vista «quem está na Rede» deixa de caber num ecrã — mas apertar não pode fundir os itens.

**Independent Test**: Abrir `/relacoes` sem selecção, com vários PJs e ≥12 NPCs; afastar o zoom até ao mínimo; discos mais juntos que antes; **nenhum** nome/disco sobreposto. Seleccionar alguém e confirmar que o layout de foco (incluindo compactação >6 da 086) não regride.

**Acceptance Scenarios**:

1. **Given** a vista geral com PJs e NPCs, **When** o utilizador observa o palco (sem selecção), **Then** o anel de NPCs está **mais perto** do anel de PJs do que no estado anterior, e os discos do mesmo anel também estão mais juntos.
2. **Given** uma campanha típica (≥4 PJs e ≥12 NPCs visíveis) na vista geral, **When** o utilizador vai ao zoom out **máximo**, **Then** todos os discos cabem no palco visível **sem** pan, **desde que** isso não force sobreposição; se o mínimo sem sobrepor ainda não couber, o utilizador pode panar.
3. **Given** a vista geral compacta, **When** se lê nomes e discos, **Then** nenhum par se sobrepõe nem fica encostado a ponto de um tapar o outro — cada item continua distinguível.
4. **Given** um personagem seleccionado, **When** se observa o layout de foco, **Then** o comportamento actual mantém-se (incluindo anel interior mais junto só com **>6** conexões visíveis, spec 086).

---

### Edge Cases

- Poucos personagens (1–3 PJs, poucos NPCs): a vista geral continua legível, não «colada»; a compactação não cria sobreposição.
- Muitos NPCs (dezenas): a vista é **mais** compacta que hoje **até ao chão de não-sobreposição**; se ainda não couber no zoom mínimo, o utilizador pode panar.
- Conflito «caber no ecrã» vs «não sobrepor»: **não sobrepor ganha**; nunca se aperta mais para forçar o encaixe.
- Voltar da selecção à vista geral: anima para o layout compacto novo, não para o espaçamento antigo.
- Isolar selecção: só existe com alguém seleccionado; fora do âmbito desta frente (não muda a vista geral).
- Discos arrastados na sessão: o apertar aplica-se ao layout calculado; offsets de arrasto da sessão comportam-se como hoje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na vista geral (nenhum personagem seleccionado), a folga entre discos MUST ser **menor** que a folga actual, tanto entre o anel de PJs e o de NPCs como entre discos do mesmo anel.
- **FR-002**: No zoom out máximo, uma campanha com **pelo menos 4 PJs e 12 NPCs** visíveis SHOULD mostrar **todos** os discos no palco sem pan (viewport de secretária típica), **sem violar FR-003**.
- **FR-003**: Discos e rótulos (nome/papel) MUST NOT sobrepor-se nem tapar-se mutuamente. Esta regra **prevalece** sobre FR-002: a compactação MUST parar na última folga em que cada item continua distinguível.
- **FR-004**: O layout de **foco** (personagem seleccionado) MUST NOT mudar por esta frente: anel interior, anel exterior e a compactação extra da 086 (>6 conexões directas visíveis) permanecem.
- **FR-005**: O modelo de dois anéis na vista geral MUST manter-se (PJs dentro, NPCs fora; nada no centro).

### Out of Scope

- Alterar o intervalo de zoom (mínimo/máximo) como solução principal.
- Controlo para o utilizador escolher a folga.
- Alterar tamanho dos discos ou das etiquetas.
- Compactar o layout de foco (já coberto pela 086 no anel interior).
- Persistência da posição arrastada dos nós.
- Auto-ajustar o zoom ao abrir a Rede.

## Key Entities

- **Vista geral**: palco sem personagem seleccionado; dois anéis (PJ interior, NPC exterior).
- **Folga da vista geral**: distância entre anéis e entre discos do mesmo anel neste estado; distinta da folga do layout de foco; tem um **chão** (não-sobreposição de discos e nomes).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com ≥4 PJs e ≥12 NPCs visíveis, no zoom out máximo, um avaliador vê **100%** dos discos no palco sem pan (secretária), **ou** o layout já está no chão de não-sobreposição (SC-003) e o que falta exige pan.
- **SC-002**: Em **3 em 3** observações, a distância visual entre o anel de PJs e o de NPCs é menor que no estado anterior.
- **SC-003**: **Zero** sobreposições de discos ou nomes na vista geral compacta (casos de teste com 4, 12 e 20 NPCs) — critério **não negociável**.
- **SC-004**: Seleccionar um personagem com 4 conexões e outro com 8 produz o mesmo aspecto de foco que após a 086 (regressão zero no layout de selecção).

## Assumptions

- «Diminuir a distância geral» aplica-se **só** à vista sem selecção; o pedido é explícito nesse estado.
- **Chão**: discos e nomes nunca se sobrepõem nem se tapam; apertar pára aí, mesmo que o grafo ainda não caiba no zoom mínimo.
- A magnitude exacta da folga (acima desse chão) fica para o planeamento: redução perceptível face a hoje.
- Não se baixa o zoom mínimo nesta frente: o problema resolve-se aproximando os discos **até ao chão**.
- A 086 continua válida para o anel interior do foco com >6 conexões; esta spec só revoga a parte «a vista geral não compacta».
- Sem dados novos nem migração.
