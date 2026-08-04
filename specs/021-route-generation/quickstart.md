# Quickstart: Validar geração de rotas

## Prerequisites

- Backend + frontend em dev; credenciais GM
- Escala configurada (`miles_per_map_unit` via admin ou seed)
- Ideal: ≥3 waypoints, ≥2 caminhos distintos entre dois Locais vinculados (A e B)

## Setup

```bash
cd backend && uv sync   # inclui networkx após implementação
uv run uvicorn app.main:app --reload --port 8000

cd frontend && npm run dev
```

## Cenários

### A — Digitalizar (US2, SC-002, SC-005)

1. Modo GM → abrir vista **Rede de rotas**.
2. **Esperado**: mapa sem pins de lore; só rede.
3. Criar nós (vincular dois a Locais A e B); traçar segmentos com tipos.
4. Sem auth: escrita admin falha.
5. Sair da vista → pins lore de volta.

### B — Calcular e auto-seleção (US1, SC-001, SC-003)

1. Como jogador: **Calcular rota** → De A, Para B, ritmo normal → Calcular.
2. **Esperado**: lista ordenada por tempo; mais rápida destacada; alternativas tracejadas; pins visíveis.
3. Clicar outra rota na lista → destaque troca.

### C — Ritmo (US3, SC-004)

1. Mesmo A→B com ritmo **cauteloso** vs **arriscado**.
2. **Esperado**: tempo cauteloso ≥ tempo arriscado (mesma geometria).

### D — Sem caminho / sem vínculo (FR-006/007)

1. Local sem waypoint não aparece no seletor.
2. Par sem caminho → lista vazia / mensagem; mapa ok.

### E — Convivência 017

1. Com plan ativo, selecionar um Local com `saida_ids`.
2. **Esperado**: linhas narrativas e overlay de viagem coexistem sem se confundir (estilos/camadas distintas).

## Referências

- [spec.md](./spec.md)
- [contracts/api-routes.md](./contracts/api-routes.md)
- [contracts/ui-route-overlays.md](./contracts/ui-route-overlays.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
