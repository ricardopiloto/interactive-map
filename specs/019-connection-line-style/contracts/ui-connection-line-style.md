# UI Contract: Estilo da linha de conexão

Escopo: `.campaign-map__connection-line` (e overlay `.campaign-map__connections`) em `frontend/src/components/map/`.

## Must

| Propriedade | Requisito |
|-------------|-----------|
| Cor do stroke | Família vermelho **visitado** (`#e5484d`); tom **mais claro** que o pin visitado sólido |
| Opacidade | Moderada **~55–65%** (mapa legível sob o traço; rota ainda clara) |
| Sombra | `drop-shadow` (ou equivalente) **suave/discreto**; sem glow colorido ou animação |
| Visibilidade | Inalterada vs 017: linhas só com local de origem selecionado e `saida_ids` válidos |

## Must not

- Usar accent roxo/lilás do tema no stroke da conexão
- Alterar cores de pins, grupo ou legenda como objetivo desta feature
- Introduzir setas, rótulos na linha ou cores diferentes por destino
- Mudar API, `saida_ids` ou regras de cadastro

## Acceptance check

1. Selecionar local com ≥2 saídas → linhas vermelho-claras (família visitado), translúcidas, com sombra suave.
2. Comparar com pin visitado sólido → linha claramente mais clara/transparente.
3. Deselecionar → linhas somem (017).
