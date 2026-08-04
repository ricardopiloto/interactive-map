# Quickstart: Validar pin ao reposicionar

## Prerequisites

- Frontend + backend; sessão **modo GM**
- Local existente visível no mapa
- [ui-pin-draft-position.md](./contracts/ui-pin-draft-position.md)
- 032 já presente (modal esconde ao reposicionar)

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

## Cenários

### A — Pin move antes de salvar (SC-001, SC-002)

1. GM → Editar local → anotar posição do pin.
2. **Reposicionar no mapa** → modal some.
3. Clicar noutro ponto do mapa.
4. **Esperado**: pin nesse ponto **imediatamente**; formulário reabre com x/y coerentes; ainda **sem** ter clicado Salvar.

### B — Cancelar edição restaura (SC-003)

1. Repetir A (pin no novo sítio, formulário aberto).
2. **Cancelar** no formulário (não salvar).
3. **Esperado**: pin volta à posição do passo 1.

### C — Cancelar no banner (SC-004)

1. Editar → Reposicionar → **Cancelar** no banner (sem clicar no mapa).
2. **Esperado**: pin e coords iguais aos de antes; modal de edição de volta.

### D — Salvar confirma (FR-006)

1. Reposicionar (pin no novo sítio) → **Salvar**.
2. **Esperado**: pin permanece no novo sítio após fechar o formulário / refresh da lista.

### E — Sem regressão 032 / add-pin

1. Reposicionar: modal não cobre o mapa.
2. Add-pin e mover grupo: comportamento anterior intacto.

## Referências

- [spec.md](./spec.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
