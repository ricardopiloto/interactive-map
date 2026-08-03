# Research: 007-visible-zoom-controls

## 1. Causa raiz provável (controles “fora da tela”)

**Decision**: Tratar como falha de **cadeia de altura + containing block**. `.campaign-map__controls` usa `position: absolute; bottom: 3.5rem` relativamente a `.campaign-map`. Se `.campaign-map` (ou ancestrais) não fica limitado à viewport útil — por exemplo filho flex sem `flex: 1` / `min-height: 0`, crescendo com o stage (`min-height: 540px` + imagem) — o “bottom” do mapa fica abaixo da área visível e `overflow: hidden` em `.map-page` corta os botões. Em tela cheia o sintoma fica óbvio porque a expectativa é “controles no canto do mapa na tela”, mas o box do mapa pode estar mais alto que a janela.

**Rationale**: Controles absolutos no rodapé de um container mais alto que a viewport aparecem “fora da tela”; combina com o report de fullscreen.

**Alternatives considered**:
- Culpar só `bottom: 3.5rem` insuficiente vs. barra mobile → possível contribuinte, mas não explica desktop fullscreen sozinho
- Culpar `react-zoom-pan-pinch` movendo os botões → improvável se `MapControls` já está fora de `TransformComponent` (verificar na implementação)

## 2. Estratégia de correção

**Decision**: Duas frentes, nesta ordem:

1. **Limitar a viewport do mapa**: garantir que o nó que envolve `CampaignMap` ocupe exatamente o restante de `.map-page__main` após o header (`flex: 1; min-height: 0; min-width: 0`) e que `.campaign-map` tenha `height: 100%` (ou `flex: 1`) dentro desse box.
2. **Ancorar chrome ao box visível**: manter `.campaign-map__controls` (e legenda) `position: absolute` no `.campaign-map` limitado; ajustar `bottom`/`right` com margem segura acima da legenda e, no mobile, acima da barra inferior **se** a barra sobrepõe o mapa (preferir que o grid mobile já reserve a linha da barra e o mapa não se estenda por baixo dela).

**Rationale**: Corrige a causa (box alto demais) e endurece o inset; alinha FR-001/002/005.

**Alternatives considered**:
- `position: fixed` nos controles → frágil com sidebar/header; rejeitado como default
- Mover controles para o header da página → redesign fora de escopo
- Só reduzir `bottom` sem consertar altura → mascara desktop mas não resolve container overflow

## 3. Relação com TransformWrapper

**Decision**: Manter `MapControls` **dentro** de `TransformWrapper` (necessário para `useControls`) mas **fora** de `TransformComponent`, para que pan/zoom do conteúdo não desloquem os botões (FR-005 / SC-004). Se a lib criar um wrapper `position`ado que cresce com o conteúdo, reancorar os controles em um sibling absoluto sob `.campaign-map` (portal interno / filho direto de `.campaign-map`) e passar handlers via props — só se a verificação mostrar que o containing block está errado.

**Rationale**: `useControls` exige contexto; FR-005 exige chrome fixo na janela do mapa.

**Alternatives considered**: Duplicar API de zoom fora do contexto → overkill

## 4. Mobile + barra inferior

**Decision**: Confiar no grid `.map-page--mobile` (`1fr` + `auto` para a barra) para que a altura do mapa já exclua a barra. Validar que controles com `bottom` ~1–1.5rem (acima da legenda) cabem no box. Se a legenda e a coluna de botões colidirem em viewports baixas, preferir empilhar/encurtar gap ou reduzir `bottom` dos controles sem cobrir a legenda por completo.

**Rationale**: FR-002; grid já existe — evitar double-counting da barra com `bottom` enorme.

**Alternatives considered**: `env(safe-area-inset-bottom)` extra além da barra → útil em notch devices como polish, não bloqueante

## 5. Escopo de arquivos

**Decision**: Prioridade `MapPage.css` (filho flex do mapa) + `CampaignMap.css` (insets / height). Tocar `MapPage.tsx` só se faltar um wrapper semântico (`map-page__map` / similar). Não alterar backend.

**Rationale**: YAGNI; sintoma é layout.
