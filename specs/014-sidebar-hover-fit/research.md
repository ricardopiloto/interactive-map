# Research: 014-sidebar-hover-fit

## 1. Hover com fundo sutil nos cartões Locais

**Decision**: Em `SideMenu.css`, estilo `:hover` (e opcionalmente `:focus-visible` para teclado) no botão/cartão de local (`.side-menu__card-btn.card` / equivalente na aba Locais), usando tint discreto via `color-mix` com tokens Nocturne (ex.: misturar `--color-text` ou `--color-accent` em baixa opacidade sobre `--color-surface`). Sem transformação de escala, sem sombra forte, sem mudança de padding que desloque a lista.

**Rationale**: Clarificação A (fundo sutil); escopo só Locais jogador (clarificação A da Q2). `:hover` CSS não interfere no `onMouseEnter` do pin (005).

**Alternatives considered**:
- Classe JS `is-hovered` → desnecessário; CSS basta
- Hover em NPC/GM admin → fora de escopo
- Contorno em vez de fundo → rejeitado (clarificação)

## 2. Largura do campo de busca

**Decision**: Corrigir o overflow em `SideMenu.css` (e markup mínimo se útil): o padrão atual combina `.input { width: 100% }` com `margin` horizontal em `.side-menu__search`. Preferir **um** destes padrões estáveis:
1. Wrapper com `padding: 0 var(--space-4)` e o input com `width: 100%; margin: 0; box-sizing: border-box`, **ou**
2. Manter o input como filho direto com `width: 100%; max-width: 100%; margin: 0 var(--space-4); box-sizing: border-box` e `align-self: stretch` num flex column — evitando `width: calc(100% - …)` frágil se box model/padding do `.input` somar além do esperado.

Verificar `box-sizing: border-box` no input (global ou local). Não alterar `.input` global de forma que quebre formulários admin.

**Rationale**: FR-005/SC-003; causa típica = 100% + margins/padding fora do modelo esperado.

**Alternatives considered**:
- `overflow-x: hidden` no menu → mascara o bug; rejeitado como única solução
- Mudar largura do `.side-menu` → fora do pedido

## 3. Convivência com destaque do pin

**Decision**: Não alterar `onLocalHover` / `CampaignMap` hovered pin styles.

**Rationale**: FR-003 / SC-002.

## 4. Backend

**Decision**: Nenhuma mudança.

**Rationale**: Só CSS/UX.
