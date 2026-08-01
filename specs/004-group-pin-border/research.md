# Research: 004-group-pin-border

## 1. Cor e papel da borda

**Decision**: Usar contorno escuro equivalente ao dos pins de local — `2px solid var(--color-bg)` (ou o mesmo token/mecanismo que o pin local já usa). Remover `border-color: var(--color-accent)` do grupo.

**Rationale**: Clarificação A + assumption da spec (“mesmo papel visual da borda dos pins de local”).

**Alternatives considered**:
- Preto puro `#000` → menos alinhado ao tema Nocturne
- Manter accent + outline externo → rejeitado na clarificação

## 2. `clip-path` na bandeira vs `border`

**Decision**: Se `border` for cortado pelo `clip-path` da bandeira, complementar ou substituir o efeito de contorno com `filter: drop-shadow(...)` (ou sombra escura equivalente) que acompanhe a forma clipada; brasão (sem clip agressivo / com `border-radius`) pode manter `border` escura simples. Resultado visual: borda escura contínua em ambos.

**Rationale**: Em CSS, `clip-path` frequentemente descarta a área da `border`; drop-shadow segue o alpha da forma.

**Alternatives considered**:
- Remover `clip-path` e redesenhar a bandeira → fora de escopo
- SVG com stroke → overkill para este delta

## 3. Legenda

**Decision**: Aplicar o mesmo tratamento escuro em `.campaign-map__legend-party` (e variantes bandeira/brasão), proporcional ao tamanho pequeno da miniatura.

**Rationale**: FR-006 / SC-004.

**Alternatives considered**: Só o ícone no mapa → falharia SC-004.

## 4. Escopo de arquivos

**Decision**: Preferir apenas `frontend/src/components/map/CampaignMap.css`. Não tocar backend, tipos nem JSX salvo se for necessário para classes (não esperado).

**Rationale**: YAGNI; marcadores já usam classes corretas.
