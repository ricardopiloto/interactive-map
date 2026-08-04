# Feature Specification: Reverter offset/tamanho de pins (030)

**Feature Branch**: `034-revert-pin-offset`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "o reposicionamento funciona, porém ele fica deslocado para o lado, isso foi causado pela spec 030, desfaça as alterações da spec 030 e vamos deixar ela em stage."

## Clarifications

### Session 2026-08-03

- Q: O que significa “deixar a 030 em stage”? → A: Reverter UI da 030 no produto + marcar `specs/030-*` como diferida/em stage (docs ficam; produto sem 030). Staging/commit git não faz parte do critério de sucesso desta feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pin no ponto certo após reposicionar (Priority: P1)

Em modo GM, o mestre reposiciona um local no mapa. O pin fica **no ponto clicado**, sem desvio lateral. O alinhamento visual volta ao comportamento **anterior** às alterações da feature 030 (tamanho móvel + correção de âncora/offset).

**Why this priority**: O reposicionamento (032/033) já regista a posição correcta, mas a apresentação da 030 desloca o pin — o GM não confia no resultado.

**Independent Test**: Reposicionar um local → clicar num ponto de referência óbvio no mapa → a ponta/âncora do pin coincide com esse ponto (sem desvio para o lado), em desktop.

**Acceptance Scenarios**:

1. **Given** mapa com pins no estilo **pré-030**, **When** o GM reposiciona um local clicando num ponto conhecido, **Then** o pin aparece alinhado a esse ponto, sem desvio lateral notório.
2. **Given** o mesmo fluxo em viewport móvel, **When** o GM observa o pin após reposicionar, **Then** o alinhamento está correcto com o estilo pré-030 (sem as regras de tamanho/âncora introduzidas pela 030).
3. **Given** pins existentes que não foram reposicionados nesta sessão, **When** o utilizador vê o mapa, **Then** o alinhamento visual é o do estilo pré-030 (coerente com o pin recém-reposicionado).

---

### User Story 2 — 030 fica em stage (não activa no produto) (Priority: P2)

As alterações de produto da feature **030-pin-size-offset** deixam de estar aplicadas na aplicação em uso. A especificação/artefactos da 030 **permanecem** no repositório como trabalho **em stage / diferido** — prontos para retomar mais tarde — sem voltar a introduzir o desvio enquanto o reposicionamento depende do alinhamento antigo.

**Why this priority**: Cumpre a intenção de “desfazer 030” sem apagar o histórico de desenho; evita reintroduzir o bug ao reaplicar 030 sem nova validação.

**Independent Test**: Confirmar que o mapa não usa o comportamento visual da 030 (pins móveis ~15–25% menores + âncora/offset da 030); a pasta/docs `specs/030-pin-size-offset` continua presente com estado **Deferred / Staged** (diferida).

**Acceptance Scenarios**:

1. **Given** a aplicação após esta correção, **When** se compara o tamanho/alinhamento dos pins com o esperado pela 030, **Then** esse comportamento da 030 **não** está activo.
2. **Given** o repositório do projecto, **When** se inspecciona a feature 030, **Then** os artefactos da 030 existem e o estado da feature está marcado como **Deferred / Staged** (não apagados; não activos no produto).

---

### Edge Cases

- Selecção/hover/ênfase dos pins: devem continuar a funcionar com o estilo pré-030.
- Marcador do grupo: também volta ao alinhamento/tamanho pré-030 se a 030 o tiver alterado.
- Zoom/pan: alinhamento pré-030 mantém-se estável.
- Não reabrir o bug do modal (032) nem o preview do draft (033) — só apresentação visual herdada da 030.
- Futura reaplicação da 030: fora de âmbito desta feature; exigirá nova validação com reposicionamento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST remover do produto o comportamento visual introduzido pela feature 030 (ajuste de âncora/offset e redução de tamanho no móvel associados a essa feature).
- **FR-002**: Após a reversão, ao reposicionar um local, o pin MUST coincidir visualmente com o ponto clicado, sem desvio lateral perceptível causado pela 030.
- **FR-003**: Pins de local e marcador do grupo MUST voltar ao tamanho e alinhamento de apresentação **anteriores** à 030.
- **FR-004**: Coordenadas guardadas dos locais/grupo MUST permanecer inalteradas (só apresentação).
- **FR-005**: Os artefactos da feature 030 MUST permanecer no projecto com estado **Deferred / Staged** (diferida); MUST NOT ser o comportamento activo da aplicação. Staging ou commit no git **não** é requisito de aceitação desta feature.
- **FR-006**: Funcionalidades de reposicionar (mapa livre + pin a seguir o rascunho) MUST continuar a funcionar após a reversão visual.
- **FR-007**: Zoom, pan, selecção e hover dos pins MUST continuar utilizáveis com o estilo restaurado.

### Key Entities

- **Pin de local / marcador do grupo**: apresentação no mapa; esta feature restaura o estilo pré-030.
- **Feature 030 (em stage)**: especificação e plano de tamanho/alinhamento diferidos; não activos no produto até nova decisão.
- **Reposicionamento**: fluxo GM que define coordenadas; deve alinhar-se ao pin restaurado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes de reposicionar num ponto de referência, o desvio lateral do pin é imperceptível em uso normal (desktop).
- **SC-002**: Em viewport móvel, os pins **não** mostram a redução ~15–25% definida pela 030 (voltam ao tamanho pré-030).
- **SC-003**: Um avaliador confirma em ≤5 minutos que a 030 não está activa no UI e que `specs/030-pin-size-offset` existe com estado **Deferred / Staged**.
- **SC-004**: Em 100% dos testes, reposicionar + cancelar edição / salvar (fluxos 032/033) continuam correctos após a reversão visual.

## Assumptions

- A causa do desvio lateral no reposicionamento é a apresentação introduzida pela 030, não as coordenadas guardadas nem o merge do rascunho (033).
- “Desfazer a 030” significa **reverter o comportamento no produto**, não apagar a pasta `specs/030-*`.
- “Deixar em stage” (clarificado): marcar a 030 como **Deferred / Staged** nos artefactos; produto sem o visual da 030. **Não** exige `git add`/`commit` como critério de sucesso.
- Não se pede redesenhar um novo alinhamento nesta entrega — só restaurar o pré-030.
- Legenda do mapa: reverter se a 030 a tiver alterado; caso contrário, sem mudança.
