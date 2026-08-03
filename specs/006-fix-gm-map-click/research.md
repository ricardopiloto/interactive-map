# Research: 006-fix-gm-map-click

## 1. Causa raiz do seletor de arquivo

**Decision**: Tratar o bug como conflito de interação: em modo GM, `MapPage` passa `mapEditable={isGm}` e `CampaignMap` renderiza `ImageSlot` com `editable` cobrindo o stage. `ImageSlot` chama `input.click()` em **qualquer** clique no container, inclusive quando `src` já existe.

**Rationale**: Explica o sintoma “toda vez que clico na tela… janela para carregar novo arquivo” sem precisar de regressão em pan/placement — o handler do slot compete com (e muitas vezes precede) a intenção do usuário.

**Alternatives considered**:
- Culpar só `handleStageClick` / placement → incompleto; o file picker vem do `<input type="file">` do `ImageSlot`
- Culpar auth GM → irrelevante; o gatilho é UI, não credencial

## 2. Separar “mapa interativo” de “upload de mapa”

**Decision**: Com mapa **carregado e exibido**, renderizar a imagem como superfície não-uploadável (como no modo jogador: `<img>` ou `ImageSlot` **não** editável por clique). Upload/substituição só por:
1. **Ação explícita** “Substituir mapa” / “Trocar mapa” (botão no chrome do mapa ou área GM), e/ou
2. **Estado vazio/falha** (`!showImage` / placeholder), onde o GM pode usar o slot editável ou o mesmo controle explícito.

**Rationale**: Atende FR-001/002/003/004; alinha com assumption da spec (ação deliberada ≠ clique genérico).

**Alternatives considered**:
- `ImageSlot` só abre file picker com double-click / modifier key → pouco descoberta e frágil em touch
- Clique no mapa abre picker só se `placement === 'none'` → ainda conflita com pan e cliques ociosos; rejeitado pela spec
- Remover upload de mapa do produto → falha FR-003/004

## 3. Onde colocar o controle explícito

**Decision**: Preferir um botão discreto no próprio `CampaignMap` (ex. junto aos controles de zoom, visível só quando `mapEditable && showImage`), reutilizando `onMapUploaded` / upload `category="map"`. Alternativa aceitável: botão no header GM de `MapPage` com o mesmo upload.

**Rationale**: Descoberto no contexto do mapa; escopo mínimo; não exige nova aba admin.

**Alternatives considered**:
- Só drag-and-drop sobre o mapa (sem botão) → pouco óbvio; drag pode coexistir como extra, mas não substitui botão para SC-003
- Entrada só no menu lateral → ok, mas menos próxima do mapa; botão no mapa é o default do plano

## 4. Escopo de mudança em `ImageSlot`

**Decision**: Preferir **não** alterar `ImageSlot` globalmente. Em vez disso, `CampaignMap` deixa de montar `ImageSlot` editável quando há imagem válida; monta `<img>` + botão de substituição (ou input file oculto acionado pelo botão). Se for necessário reutilizar upload, extrair um helper fino ou acionar `adminApi.upload('map', file)` no botão.

**Rationale**: `ImageSlot` é compartilhado (NPCs, locais, modal); mudar “não clicar quando tem src” quebraria o padrão “clique para trocar retrato”, desejável nesses contextos.

**Alternatives considered**:
- Prop `clickToReplace?: boolean` em `ImageSlot` → viável se quiser reuso, mas YAGNI se o mapa não usar slot editável no caminho carregado
- `editable={!src}` no mapa → resolve clique com mapa, mas remove substituição via slot; ainda precisa do botão (FR-003)

## 5. Drag-and-drop

**Decision**: Opcional nesta entrega. Se mantido no estado vazio, ok. Com mapa carregado, drop-to-replace no stage **não** é requisito; o botão explícito basta. Evitar drop acidental no stage se for fácil (ou deixar fora de escopo).

**Rationale**: Spec enfatiza clique; drop não foi reclamado. YAGNI.

**Alternatives considered**: Drop sempre substitui mapa em GM → conveniente mas pode surpreender; fora do mínimo.

## 6. Backend / persistência

**Decision**: Nenhuma mudança de API, schema ou storage. Continuar `POST` admin de upload categoria `map` e atualização de `mapUrl` no estado do cliente (`MapPage`).

**Rationale**: Bug puramente de gatilho UI.

**Alternatives considered**: Persistir URL do mapa no DB → fora de escopo desta correção.
