# Research: 030-pin-size-offset

## 1. Causa provável do desvio lateral

**Decision**: Tratar o desalinhamento como problema de **âncora CSS** (não de dados). Hoje `.campaign-map__pin` usa `left`/`top` em % + `margin-left: -12px` / `margin-top: -22px` + `transform: rotate(-45deg)` com origem implícita no **centro** da caixa. A combinação margem ± meia largura + rotação não garante que a **ponta** do pin coincida com o ponto `(x,y)`; o mesmo padrão (margens fixas) aplica-se a `.campaign-map__party--bandeira` / `--brasao`.

**Rationale**: Coordenadas vêm corretas do modelo; o utilizador reporta desvio “para o lado” na web; FR-007 exige não alterar coords guardadas.

**Alternatives considered**:
- Ajustar `x`/`y` no backend/seed → rejeitado (dados corretos; bug de apresentação)
- Offset por JS em runtime → overkill; CSS basta

## 2. Estratégia de realinhamento

**Decision**: Reancorar pins e grupo para que a ponta (local) ou a âncora inferior/centro (grupo) fique no ponto `left`/`top`, tipicamente via:
- `transform` que combine `translate(...)` + `rotate(...)` com `transform-origin` na ponta/âncora, **ou**
- margens recalculadas de forma consistente com o tamanho e a rotação,

e aplicar a **mesma** lógica em desktop e móvel. Em estados `--selected` / `--hovered` que usam `scale(...)`, fixar `transform-origin` na âncora para o scale não “deslizar” o pin lateralmente.

**Rationale**: Clarificação — alinhamento em todos os viewports; SC-001 / SC-004; FR-006.

**Alternatives considered**:
- Corrigir só desktop (media min-width) → rejeitado na clarificação A
- Trocar forma do pin (imagem SVG) → fora de escopo

## 3. Breakpoint móvel para tamanho

**Decision**: Usar media query alinhada a `MOBILE_BP` em `MapPage.tsx` (`window.innerWidth < 800` → viewport móvel). Preferir `@media (max-width: 799px)` para pins/grupo. **Não** reutilizar só o bloco existente `@media (max-width: 720px)` de controles/legenda, para não diverger do layout `map-page--mobile`.

**Rationale**: Spec assume o modo móvel da aplicação; FR-003/004.

**Alternatives considered**:
- 720px (já no CSS do mapa) → inconsistente com sidebar móvel a 800
- Detecção por user-agent → rejeitado (assumption da spec)

## 4. Magnitude da redução (~15–25%)

**Decision**: Alvo ~20% (meio da faixa). Ex.: pin desktop `24px` → móvel `~19–20px`; party bandeira/brasão com a mesma proporção. Ajustar offsets/margins/`transform` em conjunto com o novo tamanho (variáveis CSS `--pin-size` / `--party-*` recomendadas para não dessincronizar âncora e tamanho).

**Rationale**: Clarificação A (~15–25%); SC-002; toque (FR-005 / SC-003).

**Alternatives considered**:
- `transform: scale(0.8)` só no móvel sem mudar box → pode confundir hit-target e âncora; preferir width/height explícitos + âncora recalculada
- Reduzir legenda na mesma proporção → não obrigatório (FR-008)

## 5. Escopo de arquivos

**Decision**: Preferir apenas `frontend/src/components/map/CampaignMap.css`. Não tocar backend, digitizer, nem APIs. `CampaignMap.tsx` permanece com `left: ${x*100}%` / `top: ${y*100}%`.

**Rationale**: YAGNI; posicionamento percentual já correto.

**Alternatives considered**: Classe `is-mobile` via props do `MapPage` → possível mas desnecessária se media query bater com `MOBILE_BP`.
