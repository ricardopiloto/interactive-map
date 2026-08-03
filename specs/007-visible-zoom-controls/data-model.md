# Data Model: 007-visible-zoom-controls

Nenhuma alteração de modelo de dados persistido, schemas ou APIs.

Esta feature altera apenas o **layout / geometria de apresentação** do chrome do mapa.

## Entidades de UI (conceituais)

### Viewport do mapa

| Conceito | Descrição |
|----------|-----------|
| Área útil do mapa | Retângulo visível após header da página e (no mobile) barra inferior |
| Box `.campaign-map` | Deve coincidir com a área útil (altura limitada, não crescer com o stage) |
| Conteúdo pan/zoom | Stage/imagem dentro de `TransformComponent` — pode ser maior que a viewport |

### Chrome de controles

| Controle | Papel |
|----------|--------|
| +, −, 1:1 | Zoom; agrupados em `.campaign-map__controls` |
| Mapa (GM) | Substituição de mapa; mesmo grupo |
| Legenda | Inferior-esquerda; não deve empurrar controles para fora da tela |

## Regras de posicionamento (validação)

1. Controles ancorados ao **box da viewport do mapa**, não ao bounding box do conteúdo transformado.
2. Todos os botões do grupo devem estar completamente dentro do box visível (nenhum clip pela borda da janela).
3. Pan do conteúdo não altera a posição dos controles relativa à viewport do mapa.
