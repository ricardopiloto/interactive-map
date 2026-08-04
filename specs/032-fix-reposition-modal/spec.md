# Feature Specification: Esconder modal ao reposicionar local

**Feature Branch**: `032-fix-reposition-modal`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Um bug, ao clicar em editar em um local, depois tentar reposicionar o ponto, ele não esconde o modal para me dar opção de reposicionar ele."

## Clarifications

### Session 2026-08-03

- Q: Como cancelar o reposicionamento com o formulário oculto? → A: Botão/link Cancelar no aviso do mapa (“Clique no mapa para reposicionar…”).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Reposicionar local com o mapa livre (Priority: P1)

Em modo GM, o mestre abre a edição de um local existente e escolhe reposicionar o pin no mapa. O formulário de edição **some da frente do mapa**, o mapa fica utilizável, e o mestre clica no novo ponto. Depois do clique, a edição volta (ou permanece acessível) com a nova posição refletida, sem perder o restante dos campos já preenchidos na sessão de edição.

**Why this priority**: Sem esconder o modal, o fluxo de reposicionamento fica bloqueado — o GM não consegue clicar no mapa. É um bug que impede uma ação administrativa básica.

**Independent Test**: Editar um local → acionar “Reposicionar no mapa” → confirmar que o modal de edição **não** cobre o mapa → clicar no mapa → posição do rascunho atualiza e o formulário de edição fica novamente disponível para salvar ou cancelar.

**Acceptance Scenarios**:

1. **Given** modo GM e o formulário de edição de um local existente aberto, **When** o GM aciona “Reposicionar no mapa”, **Then** o modal/formulário de edição deixa de cobrir o mapa e o mapa indica claramente que o próximo clique define a nova posição.
2. **Given** o modo de reposicionamento ativo (modal de edição oculto), **When** o GM clica em um ponto válido do mapa, **Then** a posição do local em edição passa a ser esse ponto e o formulário de edição reaparece (ou fica imediatamente acessível) com a nova posição visível.
3. **Given** o GM já alterou outros campos no formulário antes de reposicionar, **When** conclui o clique de reposicionamento, **Then** essas alterações de texto/seleção **permanecem** no rascunho de edição (não são descartadas só por reposicionar).

---

### User Story 2 — Abandonar o reposicionamento sem perder a edição (Priority: P2)

Se o GM iniciar o reposicionamento por engano, deve poder voltar ao formulário de edição sem ser forçado a clicar no mapa, e sem apagar o rascunho da edição em curso (salvo se cancelar a edição por completo).

**Why this priority**: Evita “ficar preso” no modo de clique e reduz risco de cancelar a edição inteira só para desistir do reposicionamento.

**Independent Test**: Iniciar reposicionamento → acionar **Cancelar** no aviso do mapa → o formulário de edição reaparece com os mesmos campos de antes e a posição antiga.

**Acceptance Scenarios**:

1. **Given** modo de reposicionamento ativo a partir da edição de um local, **When** o GM aciona **Cancelar** no aviso do mapa (sem clicar no mapa para confirmar nova posição), **Then** o formulário de edição reaparece e a posição permanece a anterior.
2. **Given** formulário de edição reaberto após cancelar o reposicionamento, **When** o GM cancela a edição por completo, **Then** nenhuma alteração não salva (incluindo tentativa de posição) é persistida — comportamento de cancelamento da edição já existente.

---

### Edge Cases

- Reposicionar só está disponível na **edição** de local existente (não no fluxo de “novo local”, que já posiciona no mapa antes/ao criar).
- Clique no mapa fora do modo de reposicionamento, com o modal aberto: não deve reposicionar por acidente.
- Zoom/pan durante o modo de reposicionamento: continuam utilizáveis; o clique que confirma a posição é o de “definir ponto”, não gestos de navegação.
- Se o GM estiver também em outro modo de posicionamento (ex. mover grupo): o fluxo de reposicionar local não deve deixar dois modos ativos ao mesmo tempo de forma ambígua.
- Após reposicionar e salvar: a nova posição fica persistida e visível no mapa como no fluxo atual de salvar local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao acionar “Reposicionar no mapa” a partir do formulário de edição de um local, o sistema MUST ocultar (ou remover da frente do mapa) o modal/formulário de edição para que o mapa fique clicável.
- **FR-002**: Enquanto o reposicionamento estiver ativo, o sistema MUST indicar ao GM que o próximo clique no mapa define a nova posição do local em edição.
- **FR-003**: Após um clique válido no mapa em modo de reposicionamento, o sistema MUST atualizar a posição do rascunho de edição para esse ponto e MUST voltar a apresentar o formulário de edição.
- **FR-004**: Ocultar o formulário para reposicionar MUST NOT descartar o rascunho de edição em curso (nome, descrição, e demais campos já preenchidos na sessão).
- **FR-005**: Enquanto o reposicionamento estiver ativo, o aviso no mapa MUST incluir uma ação explícita **Cancelar**; ao acioná-la (sem confirmar nova posição no mapa), o sistema MUST sair do modo de reposicionamento, restaurar o formulário de edição e manter a posição anterior.
- **FR-006**: Cancelar a edição por completo (ação de cancelar do formulário) MUST continuar a descartar alterações não salvas, incluindo uma nova posição ainda não salva.
- **FR-007**: Salvar após reposicionar MUST persistir a nova posição junto com os demais campos do local, como no fluxo de edição atual.

### Key Entities

- **Local (rascunho de edição)**: local em edição pelo GM, com campos de conteúdo e coordenadas x/y ainda não necessariamente salvos.
- **Modal / formulário de edição**: interface que cobre o mapa enquanto o GM edita metadados do local.
- **Modo de reposicionamento**: estado em que o GM deve clicar no mapa para escolher novas coordenadas; exige mapa livre de overlay do formulário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes “editar local → reposicionar”, o formulário de edição deixa de bloquear o mapa antes do clique de posição.
- **SC-002**: Um GM consegue concluir reposicionar + ver o formulário de novo com a posição atualizada em ≤15 segundos a partir do clique em “Reposicionar no mapa”.
- **SC-003**: Em 100% dos testes com campos alterados antes do reposicionamento, esses campos ainda estão presentes no formulário após o clique no mapa.
- **SC-004**: Em 100% dos testes de cancelar o modo de reposicionamento (sem clicar no mapa), a posição exibida no formulário permanece a de antes do início do reposicionamento.

## Assumptions

- O comportamento desejado já existe conceitualmente (há ação “Reposicionar no mapa” e modo de clique no mapa); o bug é o formulário permanecer visível/bloqueante durante esse modo.
- O fluxo de **novo** local (adicionar pin) não é o foco desta correção, salvo regressão óbvia.
- “Ocultar o modal” significa que o mapa fica interativo para escolher a posição; o rascunho permanece em memória.
- Cancelar o reposicionamento é feito pelo controlo **Cancelar** no aviso do mapa (não depende só de Escape nem do painel Locais).
- Não há mudança de regras de negócio de coordenadas, vínculo com nós da rede, ou persistência além de corrigir a UX do overlay.
