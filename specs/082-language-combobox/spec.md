# Feature Specification: Seletor de Idioma em Combo-box

**Feature Branch**: `082-language-combobox`

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Substituir o seletor de idioma actual (dois botões PT/EN lado a lado) por um combo-box discreto na barra superior.

**Depends on**: [080-i18n-interface](../080-i18n-interface/spec.md) (detecção, persistência e tradução já implementadas)

## Clarifications

### Session 2026-08-13

- Q: O combo-box é nativo (`<select>`) ou um controlo custom? → A: **Custom combobox** — trigger ghost (sigla) + listbox Nocturne (teclado, Escape, clique fora).
- Q: Como se rotulam as opções na lista aberta? → A: **Seguem o locale da UI** — PT: Português / Inglês; EN: Portuguese / English.
- Q: Como se marca a opção activa na lista? → A: **Highlight only** — fundo/texto accent + `aria-selected`; sem checkmark.
- Q: O trigger fechado mostra só a sigla ou também um chevron? → A: **Sigla + chevron** (ex. `PT ▾`); o chevron é decorativo, não um segundo botão.
- Q: Após fechar a lista (escolha, Escape ou clique fora), para onde vai o foco do teclado? → A: **De volta ao trigger**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher idioma num combo-box (Priority: P1)

Utilizador vê na barra superior um único controlo que mostra o idioma activo (sigla PT ou EN + chevron). Ao abrir, aparece uma lista com as opções suportadas; ao escolher, a interface muda de idioma sem recarregar a página.

**Why this priority**: É o único objectivo desta frente — o seletor actual ocupa dois botões e não escala para um terceiro idioma.

**Independent Test**: Abrir Mapa e Relações; o combo-box está visível; escolher EN e PT; labels mudam em menos de 1 s; recarregar a página mantém a escolha.

**Acceptance Scenarios**:

1. **Given** interface em PT-BR, **When** o utilizador abre o combo-box, **Then** vê as opções **Português** e **Inglês**, com a opção activa destacada (highlight, sem checkmark).
2. **Given** interface em EN, **When** abre o combo-box, **Then** vê **Portuguese** e **English**, com a opção activa em highlight.
3. **Given** combo-box aberto, **When** escolhe EN, **Then** o menu fecha, o trigger mostra EN e a interface passa a inglês sem recarregar.
4. **Given** escolha EN, **When** recarrega a página, **Then** o combo-box continua a mostrar EN e a UI permanece em inglês.

---

### User Story 2 - Combo-box usável por teclado e em ecrã estreito (Priority: P2)

Utilizador de teclado ou em viewport estreito consegue abrir, percorrer e confirmar o idioma sem perder o resto da barra (Modo GM, navegação).

**Why this priority**: A barra já está densa; o combo-box tem de ser mais compacto que dois botões e acessível.

**Independent Test**: Tab até o controlo → Enter/Espaço abre → setas percorrem → Enter confirma; em ≤800px o controlo cabe à direita da barra sem empurrar o toggle GM para fora.

**Acceptance Scenarios**:

1. **Given** foco no combo-box, **When** o utilizador usa teclado (abrir, setas, Enter, Escape), **Then** consegue mudar idioma ou cancelar sem rato; após fechar, o foco **regressa ao trigger**.
2. **Given** viewport ≤800px, **When** abre Mapa ou Relações, **Then** o combo-box permanece visível e compacto na barra, sem sobrepor o toggle GM.

---

### Edge Cases

- Clique fora do menu (ou Escape) fecha sem mudar o idioma; o foco regressa ao trigger.
- O menu é um **listbox** custom (não `<select>` nativo); o trigger permanece um botão ghost com a sigla e chevron.
- Só existem dois idiomas no lançamento (PT-BR, EN); o controlo mostra um valor de cada vez, pronto a receber mais opções no futuro.
- Hub índice (`hub/`) permanece fora de âmbito — seletor só na app Codex.
- Após mudar o idioma, a lista (se reaberta) MUST mostrar rótulos no **novo** locale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O seletor de idioma MUST ser um **combo-box custom** (um trigger ghost + lista/listbox Nocturne), não um grupo de dois botões lado a lado nem um `<select>` nativo.
- **FR-002**: O trigger MUST mostrar a sigla do idioma activo (`PT` ou `EN`) **e** um chevron discreto indicando dropdown; o chevron NÃO é um controlo separado.
- **FR-003**: A lista MUST mostrar nomes localizados **no locale da UI** (PT-BR: **Português** / **Inglês**; EN: **Portuguese** / **English**) e destacar a opção activa com **highlight** (cor/fundo accent) e `aria-selected` — sem checkmark nem sigla extra na linha.
- **FR-004**: Escolher uma opção MUST aplicar o idioma imediatamente (sem recarregar) e persistir no dispositivo, como hoje.
- **FR-005**: O combo-box MUST permanecer na barra superior partilhada (Mapa e Relações), sempre visível para jogador e GM, discreto e à esquerda do toggle GM.
- **FR-006**: O controlo MUST ser operável por teclado (abrir, percorrer, confirmar, fechar) e ter etiqueta acessível localizada; após fechar a lista (escolha, Escape ou clique fora), o foco MUST regressar ao trigger.
- **FR-007**: Clique fora ou Escape MUST fechar a lista sem alterar o idioma.

### Out of Scope

- Novos idiomas além de PT-BR e EN.
- Seletor no hub estático.
- Alterar detecção automática do navegador ou persistência (já cobertas pela 080).
- Tradução de conteúdo escrito pelo mestre.

### Key Entities

- **Idioma activo**: `pt-BR` ou `en`, mostrado como sigla no trigger.
- **Opção do combo-box**: par (código interno, rótulo **traduzido** na lista conforme o locale activo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Utilizador muda de idioma em **≤3 acções** (abrir → escolher → interface actualizada) e vê o resultado em **menos de 1 segundo**.
- **SC-002**: Após recarregar, **100%** das sessões mantêm o idioma escolhido no combo-box.
- **SC-003**: Em desktop e em viewport ≤800px, o combo-box cabe na barra sem esconder o toggle GM.
- **SC-004**: Utilizador de teclado completa a troca de idioma **sem rato** (abrir, escolher, confirmar) e o foco regressa ao trigger após fechar.

## Assumptions

- O comportamento de i18n da 080 (detecção, fallback PT-BR, persistência) permanece; esta frente só muda o **controlo visual e de interacção**.
- “Combo-box” significa um único **botão** que abre uma **lista custom** (dropdown/listbox), não um campo de texto pesquisável e não um `<select>` nativo.
- Siglas no trigger (`PT` / `EN`) mantêm-se **com chevron**; nomes na lista seguem o locale da UI (não endónimos fixos).
- Versão alvo na implementação: incremento de patch/minor a decidir no plano (não bloqueia a spec).
