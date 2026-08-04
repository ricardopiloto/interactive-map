# Feature Specification: Corrigir reposicionamento visual do pin

**Feature Branch**: `033-fix-reposition-pin`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Feature 032 não está funcionando conforme o esperado. Ele esconde o modal mas não reposiciona o pin."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pin move ao confirmar o novo ponto (Priority: P1)

Em modo GM, o mestre edita um local, aciona “Reposicionar no mapa” (o formulário some, como na 032) e clica no mapa no novo sítio. O **pin desse local no mapa deve aparecer na nova posição** de imediato (ainda na sessão de edição). O formulário reabre com as coordenadas coerentes com o pin. Ao **Salvar**, a posição fica definitiva; ao **Cancelar** a edição sem salvar, o pin volta à posição anteriormente guardada.

**Why this priority**: Esconder o modal sem mover o pin deixa o fluxo de reposicionar incompleto — o GM não vê o resultado da ação principal.

**Independent Test**: Editar local → Reposicionar → clicar noutro ponto do mapa → o pin do local está no ponto clicado (antes de salvar); coordenadas no formulário batem com essa posição.

**Acceptance Scenarios**:

1. **Given** modo GM, edição de local existente e modo de reposicionamento ativo (formulário oculto), **When** o GM clica num ponto válido do mapa, **Then** o pin desse local passa a ser mostrado nesse ponto no mapa.
2. **Given** o clique de reposicionamento acabou de ocorrer, **When** o formulário de edição reaparece, **Then** a posição indicada no formulário corresponde à nova posição do pin.
3. **Given** o pin já foi movido no mapa durante a edição, **When** o GM salva o local, **Then** após concluir o save o pin permanece na nova posição (posição persistida).
4. **Given** o pin foi movido no mapa durante a edição mas ainda não foi salvo, **When** o GM cancela a edição por completo, **Then** o pin volta à posição que estava guardada antes desta edição.

---

### User Story 2 — Manter o mapa livre da 032 (Priority: P2)

O comportamento da 032 permanece: ao iniciar reposicionar, o formulário não bloqueia o mapa; **Cancelar** no aviso do mapa desiste do reposicionamento sem mudar a posição do pin nem as coordenadas do rascunho.

**Why this priority**: A correção do pin não pode regredir o overlay já corrigido.

**Independent Test**: Reposicionar → Cancelar no banner → formulário volta; pin e coordenadas iguais aos de antes de iniciar o reposicionamento.

**Acceptance Scenarios**:

1. **Given** reposicionamento activo, **When** o GM aciona **Cancelar** no aviso do mapa (sem clicar para confirmar), **Then** o pin não muda de sítio e o formulário reaparece com a posição anterior.
2. **Given** formulário aberto em edição, **When** o GM ainda não iniciou reposicionar, **Then** cliques no mapa não movem o pin por acidente.

---

### Edge Cases

- Só o pin do local em edição deve reflectir a nova posição provisória; outros pins inalterados.
- Zoom/pan durante o modo de reposicionamento: o clique que confirma a posição continua a funcionar; gestos de navegação não devem ser confundidos com “definir ponto” de forma que impeça reposicionar.
- Local vinculado a nó da rede: reposicionar o pin do local nesta feature não exige alterar regras de vínculo (comportamento de negócio de nós permanece o actual); o pin do **local** deve mesmo assim mover-se visualmente conforme o clique.
- Novo local (add-pin): fora do foco desta correção, salvo regressão óbvia.
- Se o clique no mapa não for registado (mapa “morto”), isso também falha esta feature — o fluxo completo (clique → pin no sítio) deve funcionar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Após um clique válido no mapa em modo de reposicionamento de um local em edição, o sistema MUST mostrar o pin desse local na posição clicada (actualização visual imediata na sessão de edição).
- **FR-002**: Após esse clique, o rascunho de edição MUST reflectir as mesmas coordenadas que o pin exibido.
- **FR-003**: O formulário de edição MUST continuar a ocultar-se durante o reposicionamento e a reaparecer após o clique (comportamento 032 preservado).
- **FR-004**: Cancelar o reposicionamento pelo controlo do aviso do mapa MUST NOT mover o pin nem alterar as coordenadas do rascunho.
- **FR-005**: Cancelar a edição por completo (sem salvar) MUST restaurar o pin à posição persistida anterior.
- **FR-006**: Salvar após reposicionar MUST persistir a nova posição de forma que o pin continue no novo sítio após o fim da edição.
- **FR-007**: Cliques no mapa fora do modo de reposicionamento MUST NOT reposicionar o pin do local em edição.

### Key Entities

- **Local (persistido)**: posição guardada do pin no mapa da campanha.
- **Rascunho de edição**: posição provisória durante a edição; deve alinhar-se ao pin mostrado após reposicionar.
- **Pin no mapa**: marcador visual do local; deve reflectir a posição provisória quando o GM confirma um novo ponto no fluxo de reposicionar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes “reposicionar → clicar no mapa”, o pin do local editado está no ponto clicado **antes** de salvar.
- **SC-002**: Em 100% dos testes, coordenadas no formulário reaberto batem com a posição visual do pin (± tolerância visual óbvia).
- **SC-003**: Em 100% dos testes “mover pin → Cancelar edição”, o pin volta à posição guardada.
- **SC-004**: Em 100% dos testes “Cancelar no banner” (sem clique de confirmação), o pin não se move.
- **SC-005**: Um GM completa reposicionar (ver pin no novo sítio) em ≤15 segundos a partir de “Reposicionar no mapa”, com o modal fora do caminho.

## Assumptions

- A 032 resolveu apenas a ocultação do modal; o defeito restante é o pin **não** reflectir a nova posição (e/ou o clique não completar o resultado esperado no mapa).
- Posição provisória no mapa durante a edição (antes de salvar) é o comportamento desejado — o GM precisa de feedback visual imediato.
- Cancelar edição descarta a posição provisória; isso já é o modelo mental do cancelar formulário.
- Não se exige alterar tarifas, rotas, ou digitalização de vias.
- Vínculo nó↔local: sem mudança de regras nesta feature; foco no pin do local.
