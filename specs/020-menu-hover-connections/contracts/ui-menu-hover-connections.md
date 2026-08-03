# UI Contract: Hover no menu mostra conexões

Escopo: overlay `.campaign-map__connections` / `.campaign-map__connection-line` e estado `selectedLocalId` + `hoveredLocalId` (MapPage → CampaignMap).

Supersede parcial de `specs/017-location-connections/contracts/ui-map-connection-lines.md` (antes: “Não desenhar por hoveredLocalId”).

## Quando desenhar

| Condição | Linhas |
|----------|--------|
| `selectedLocalId != null` | Saídas do local **selecionado** (017); ignore `hoveredLocalId` para linhas |
| `selectedLocalId == null` e `hoveredLocalId != null` | Saídas do local **hovered** (menu Locais ou lista GM) |
| Ambos null | Nenhuma |
| Origem com `saida_ids` vazios / destinos ausentes | Nenhuma / pular órfãos |

## Geometria e estilo

- Inalterados vs 017/019 (percent coords, stroke, sombra, `pointer-events: none`).

## Interação

| Ação | Efeito |
|------|--------|
| Hover aba Locais / lista GM (sem seleção) | Linhas daquele local + destaque pin; **sem** pan/zoom |
| Hover com seleção ativa | Só destaque pin; linhas ficam as da seleção |
| Mouse leave (sem seleção) | Oculta linhas |
| Abrir/selecionar / fechar | Como 017 |
| Hover em pin no mapa | Não obrigatório nesta feature |

## Must not

- Trocar linhas por hover enquanto há seleção
- Disparar pan/zoom no hover (016)
- Mudar cadastro de saídas ou estilo 019
- Mostrar linhas por hover em abas que não listam locais

## Acceptance check

1. Sem seleção: hover A → linhas A; leave → some.
2. A selecionado: hover B → pin B destaca; linhas continuam A.
3. Lista GM: mesma regra que aba Locais.
