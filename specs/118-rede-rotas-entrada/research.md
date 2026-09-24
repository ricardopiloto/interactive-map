# Research: Rede de rotas — entrada e casca (118)

## 1. Ponto de abertura: Mapa → Rota

**Decision**: Remover o `menuitem` «Rede de rotas» de `MapPage` (`map-page__gm-menu`). Manter o botão/menu GM e as restantes entradas (novo NPC, arco, mover grupo, formato). Em `RotaPage`, com `useEditMode().enabled` (e/ou `canEdit` alinhado ao protótipo GM), renderizar botão absoluto no topo-direita do stage (classe tipo `rota-page__digitizer-btn`) que faz `setDigitizerOpen(true)`. Montar o **mesmo** `RouteDigitizerView` em overlay tela cheia sobre a área do mapa (props: `mapUrl`, `locais`, `onCampaignChanged` / refresh waypoints, `onClose`), espelhando o padrão actual do MapPage.

**Rationale**: FR-001–004; protótipo `RotaPage` + menu Mapa ainda tem outras acções (confirmado no código).

**Alternatives considered**:
- Remover o menu GM inteiro — falha FR-004 (NPC/arco/grupo ficariam sem entrada).
- Duplicar um `RouteDigitizer` “leve” na Rota — viola FR-002 / YAGNI.
- Abrir digitalizador numa rota React dedicada — fora de escopo; protótipo é overlay.

## 2. Estado e limpeza no MapPage

**Decision**: Apagar estado `routeDigitizerOpen`, o mount `{routeDigitizerOpen && …}`, o import de `RouteDigitizerView`, e efeitos que só existiam para fechar o digitizer — desde que nenhum outro caminho no Mapa o abra. Confirmar com grep `RouteDigitizer` / `routeDigitizer` em `MapPage` e dependentes.

**Rationale**: Evitar código morto; SC-001.

**Alternatives considered**: Deixar o mount atrás de `false` — dívida.

## 3. Casca: zoom (DigControls)

**Decision**: Alinhar `DigControls` ao chrome de zoom do `CampaignMap` pós-115: `IconButton` (ou botões com as mesmas regras CSS) em stack, `border-radius: var(--radius-full)`, fundo translúcido, `box-shadow: var(--shadow-md)`, ícones Tabler se o mapa já os usa — **sem** mudar `zoomIn`/`zoomOut`/`resetTransform`. Preferir **reutilizar** selectors/padrão de `CampaignMap.css` (classes partilhadas ou cópia mínima em `RouteDigitizer.css` apontando aos mesmos tokens), não inventar um terceiro look.

**Rationale**: FR-005 / SC-002; DigControls hoje usa `Button` genérico num canto superior — visualmente diferente do mapa.

**Alternatives considered**:
- Só CSS em cima de `Button` rectangular — difícil bater pílula/círculo 40×40 do mapa.
- Importar `map-canvas__*` do protótipo — divergente dos nomes reais pós-115.

## 4. Casca: «Novo nó» / «Traçar segmento» como chips

**Decision**: Trocar os `Button` de modo por `Chip` com `onClick` + `aria-pressed` / variante activa (kit 117), **sem** alterar o state machine `mode` / `draftA` / `draftMids`. «Lista» (narrow) e «Sair» podem permanecer `Button`/`ghost` se o protótipo não os trate como chips.

**Rationale**: Protótipo usa `.chip` + `is-active`; kit já tem Chip interactivo.

**Alternatives considered**: Só className `ui-chip` em `<button>` nativo — possível, mas Chip já encapsula.

## 5. Lista / escala vs MapSidePanel

**Decision**: **Não** reescrever a lógica de `DigitizerListPanel` nem mover o estado de escala para outro sítio. Actualizar CSS da coluna/folha (raios `--radius-full` ou alinhados ao painel, sombras `--shadow-md` / surface do `MapSidePanel`, linhas tipo `map-page__row`) para a captura bater com o protótipo. Escala permanece no sítio funcional actual (barra/tools); só tokens/tipografia/espaçamento se a captura exigir. Envolver a lista em `MapSidePanel` **só** se a paridade visual falhar com CSS puro **e** o wrap não alterar callbacks/API do painel — default = CSS + padrões de classe, não fork estrutural.

**Rationale**: Spec: comportamento inalterado; «padrão do MapSidePanel» = linguagem visual, não obrigatoriamente o mesmo React tree nesta iteração.

**Alternatives considered**:
- Portar lista para `MapSidePanel` como no protótipo — risco em sheet móvel/`digitizer-list--sheet` já calibrado.
- Deixar lista com `--radius-md` / elevation-column antiga — falha SC-002.

## 6. O que NÃO muda (comportamento)

**Decision**: Zero mudanças em: criação/remoção de waypoints, traço com pontos intermediários, tipos de via, `saveScale`, focus-to-element, APIs admin, validação de erros. Diffs em `RouteDigitizerView.tsx` limitados a markup/apresentação (Chip/IconButton/className/aria).

**Rationale**: FR-006 / SC-003; protótipo simplifica o traço — **não** é referência de comportamento.

**Alternatives considered**: «Aproveitar» para alinhar traço ao protótipo (sem mids) — explicitamente fora de escopo.

## 7. i18n e dependências

**Decision**: Reusar `t('mapPage.routeNetwork')` (já pt-BR/en) no botão da Rota. Specs 114–116: só **consumir** artefacto visual 115 (zoom); não regenerar nem editar specs/planos delas.

**Rationale**: FR-007–008; Assumptions do spec.

**Alternatives considered**: Nova chave `rota.digitizerOpen` — desnecessária.
