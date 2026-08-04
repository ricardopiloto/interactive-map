# Quickstart: Validar esconder modal ao reposicionar

## Prerequisites

- Frontend + backend a correr; sessão **modo GM**
- Pelo menos um local existente no mapa
- [ui-local-reposition.md](./contracts/ui-local-reposition.md)

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

## Cenários

### A — Modal some e mapa recebe o clique (SC-001, SC-002)

1. GM → Locais → **Editar** um local.
2. Alterar um campo de texto (ex. descrição) sem salvar.
3. Clicar **Reposicionar no mapa**.
4. **Esperado**: dialog desaparece; banner “reposicionar…” visível; mapa clicável.
5. Clicar noutro ponto do mapa.
6. **Esperado**: dialog reaparece; posição x/y actualizada; texto da descrição ainda presente.

### B — Cancelar no banner (SC-004)

1. Editar local → anotar x/y → **Reposicionar no mapa**.
2. Clicar **Cancelar** no banner (não clicar no mapa).
3. **Esperado**: dialog volta; x/y iguais aos de antes; campos preservados.

### C — Cancelar edição após reposicionar (FR-006)

1. Reposicionar (clicar no mapa) → dialog com novas coords → **Cancelar** no dialog.
2. **Esperado**: pin/local no mapa mantém posição **salva** anterior (não a do rascunho).

### D — Salvar após reposicionar (FR-007)

1. Reposicionar → **Salvar**.
2. **Esperado**: pin reflecte a nova posição após refresh/lista.

### E — Sem regressão add-pin / move-group

1. Adicionar local (fluxo add-pin) e mover grupo: banner e cliques funcionam como antes.

## Referências

- [spec.md](./spec.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
