# Feature Specification: Apply Portrait Sizing Policy to Locals

**Feature Branch**: `059-fix-local-image-sizing`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Verifique se o mesmo que foi feito nas specs 057 e 058 também são aplicáveis em Locais."

## Audit Result

Sim — o mesmo problema de **caixa com altura fixa + corte tipo cover** existe em Locais, em superfícies equivalentes às de NPC:

| NPC (057 / 058) | Local (esta feature) | Situação actual |
|-----------------|----------------------|-----------------|
| Menu: cartão expandido do retrato | **Pin modal** do local (detalhe ao seleccionar pin / local) | `ImageSlot` com altura fixa ~150 — corta a imagem |
| Diálogo GM criar/editar NPC | **Diálogo GM criar/editar Local** | `ImageSlot` com altura fixa ~150 — corta a imagem |
| Miniatura circular na lista de NPCs | Lista de Locais no menu (sem imagem grande) | Sem caixa de imagem fixa equivalente — N/A |

**Conclusão**: A política de 057/058 (**shrink-to-fit**, altura máxima **~50% da viewport**, não partir o ecrã/diálogo, upload editável onde aplicável) **MUST** aplicar-se à imagem do Local no pin modal e no formulário de edição.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a imagem completa no detalhe do Local (Priority: P1)

O jogador (ou GM) abre o detalhe de um Local com imagem (modal do pin). A imagem aparece **inteira e reconhecível**, com a caixa a acompanhar a proporção — não uma faixa fixa que corta quase tudo. O modal / ecrã permanecem utilizáveis.

**Why this priority**: Equivalente funcional a 057 no fluxo de leitura do Local.

**Independent Test**: Abrir um Local com imagem alta no pin modal; confirmar shrink-to-fit e tecto ~50vh; texto/acções do modal ainda acessíveis.

**Acceptance Scenarios**:

1. **Given** um Local com imagem, **When** o utilizador abre o detalhe (pin modal), **Then** a imagem mostra-se completa e reconhecível (sem corte fixo agressivo).
2. **Given** o mesmo detalhe, **When** a proporção da imagem varia, **Then** a caixa redimensiona (shrink-to-fit), limitada a ~50% da viewport.
3. **Given** um Local sem imagem, **When** o detalhe abre, **Then** não há caixa de imagem partida (comportamento vazio actual adequado).

---

### User Story 2 - Ver / carregar a imagem ao editar o Local (Priority: P1)

O GM abre criar/editar Local. A caixa da imagem no formulário segue a mesma política (shrink-to-fit + ~50vh); o upload continua a funcionar; o diálogo não parte o ecrã.

**Why this priority**: Equivalente a 058.

**Independent Test**: Editar Local com imagem alta; upload de nova imagem; campos e Guardar/Cancelar acessíveis.

**Acceptance Scenarios**:

1. **Given** o diálogo de editar/criar Local com imagem, **When** o GM olha a caixa, **Then** a imagem está completa (não faixa ~150px cortada).
2. **Given** o diálogo, **When** faz upload de nova imagem, **Then** o preview actualiza com sizing correcto e o slot permanece editável.
3. **Given** diálogo sem imagem, **When** aberto, **Then** a zona de drop/placeholder permanece utilizável (min-height modesto OK).

---

### User Story 3 - Consistência com NPC e sem regressões (Priority: P2)

A política visual alinhada a 057/058 (mesmos limites e shrink-to-fit). NPCs já corrigidos MUST NOT regredir. Mapa/rotas intactos.

**Why this priority**: Evitar dois padrões diferentes de “imagem de entidade”.

**Independent Test**: Spot-check NPC expand + NPC edit ainda OK; Local pin modal + Local edit OK.

**Acceptance Scenarios**:

1. **Given** as correcções de Local aplicadas, **When** se reabre um NPC expandido e o diálogo de NPC, **Then** o comportamento de 057/058 mantém-se.
2. **Given** viewport estreita, **When** se abre pin modal ou diálogo de Local com imagem alta, **Then** não há scroll horizontal da página.

---

### Edge Cases

- Imagem muito alta / larga: mesmas regras que 057/058 (largura do contentor; max ~50vh; shrink-to-fit).
- Pin modal já tem shell com max-height / scroll — a imagem MUST respeitar o tecto sem empurrar o modal para fora da viewport.
- Lista de Locais no menu lateral: sem imagem expandida — fora do âmbito de alteração.
- Mapa da campanha / ImageSlot do mapa: fora de âmbito.
- Digitizer: fora de âmbito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No **pin modal** de um Local com imagem, a caixa da imagem MUST usar shrink-to-fit (altura = imagem escalada à largura útil), MUST NOT usar altura fixa que corte a imagem quase toda.
- **FR-002**: No **diálogo GM** criar/editar Local, a caixa da imagem MUST seguir a mesma política de FR-001.
- **FR-003**: Em ambas as superfícies, a altura do bloco de imagem MUST respeitar no máximo **~50% da altura da viewport**.
- **FR-004**: Em ambas, a imagem MUST caber na largura útil do contentor (sem overflow horizontal da página).
- **FR-005**: Com imagem abaixo do tecto, a caixa MUST NOT reservar sempre a altura máxima vazia (shrink-to-fit).
- **FR-006**: O slot do formulário Local MUST continuar editável (upload/substituição).
- **FR-007**: Sem imagem: pin modal sem caixa partida; formulário com placeholder de upload utilizável.
- **FR-008**: Correcções de NPC (057/058) MUST NOT regredir; mapa, pins (posição), rotas e digitizer MUST NOT mudar além do sizing da imagem do Local nestas duas superfícies.

### Key Entities

- **Imagem do Local (detalhe)**: Preview no pin modal.
- **Imagem do Local (edição)**: Preview + upload no diálogo GM.
- **Política 057/058**: Shrink-to-fit + max ~50vh + não partir ecrã/diálogo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão visual, pin modal e diálogo de Local com imagem alta mostram a figura reconhecível em 100% dos smokes (não faixa fixa cortada).
- **SC-002**: Altura do bloco de imagem ≤ ~50% da viewport em ambas as superfícies; conteúdo restante alcançável.
- **SC-003**: Viewport ~375px e desktop: 0 scroll horizontal da página ao abrir modal/diálogo com imagem.
- **SC-004**: Spot-check: NPC 057/058 intactos; upload de Local ainda funciona.

## Assumptions

- “Aplicável em Locais” cobre **pin modal** (leitura) e **formulário de edição** (escrita), não a lista compacta do menu.
- Reutilizar a mesma política numérica e de comportamento que 057/058 (já clarificada).
- Não se exige lightbox fullscreen.

## Out of Scope

- Imagem/placeholder do mapa da campanha.
- Redesign do pin modal ou do formulário além do sizing da imagem.
- Alterações a NPCs (já cobertos).
- Digitizer / rede de rotas.
