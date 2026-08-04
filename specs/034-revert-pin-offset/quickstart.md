# Quickstart: Validar reversão da 030

## Prerequisites

- App a correr; modo GM
- [ui-revert-pin-030.md](./contracts/ui-revert-pin-030.md)
- Preferir ponto de referência visual óbvio no mapa (cruzamento, canto de edifício)

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

## Cenários

### A — Reposicionar sem desvio lateral (SC-001)

1. Editar local → Reposicionar → clicar num ponto claro.
2. **Esperado**: pin centrado/alinhado ao ponto clicado como no estilo antigo (sem desvio “para o lado” da âncora 030).

### B — Móvel sem redução 030 (SC-002)

1. Viewport &lt; 800px (ou DevTools).
2. **Esperado**: pins **não** ~20% menores por regra 030; mesmo tamanho base 24px (salvo outros estilos pré-existentes).

### C — 030 diferida (SC-003)

1. Abrir `specs/030-pin-size-offset/spec.md`.
2. **Esperado**: Status **Deferred / Staged**; pasta intacta.

### D — 032/033 intactos (SC-004)

1. Reposicionar: modal esconde; Cancelar no banner OK; pin segue draft até cancelar edição/salvar.
2. **Esperado**: sem regressão desses fluxos.

## Referências

- [spec.md](./spec.md)
- [research.md](./research.md) — tabela pré-030 vs 030
