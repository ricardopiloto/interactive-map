# Quickstart: 029-link-node-local

## Prerequisites

- App GM autenticado; Rede de rotas + gestão de Locais
- [api-link-node-local.md](./contracts/api-link-node-local.md)
- [ui-link-node-local.md](./contracts/ui-link-node-local.md)

## Steps

1. **Nó primeiro**: Rede de rotas → Novo nó **sem** Local num ponto do mapa.
2. **Local depois**: Criar Local noutro sítio do mapa (posição deliberadamente diferente).
3. **Vincular pela Rede**: Na lista de nós, selecionar o Local no select do nó → gravar.
4. Verificar: lista mostra o Local; no mapa principal, o pin do Local está **na mesma posição do nó**.
5. **Desvincular**: Select → Sem Local → pin do Local **permanece** onde estava após o snap (não volta à posição original da criação).
6. **Vincular pelo formulário**: Ligar de novo; ou criar Local novo escolhendo o nó no campo “Nó da rede” → Local nasce/fica na posição do nó.
7. Tentar ligar dois nós ao mesmo Local → erro claro; contagens de nós/segmentos inalteradas.

## Pass criteria

- [x] Edit vínculo na lista de nós
- [x] Edit vínculo no form Local (criar/editar)
- [x] Snap Local → nó ao vincular
- [x] Desvincular não reverte posição
- [x] Unicidade 1:1 com erro
- [x] Novo nó com Local opcional ainda funciona
