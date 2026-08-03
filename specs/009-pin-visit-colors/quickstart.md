# Quickstart: Validar seletor de cor do pin

## Prerequisites

- Backend + frontend rodando; credenciais GM

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`. Entrar em **Modo GM**.

## Cenários

### A — Criar local com cor (SC-001, SC-004, FR-007)

1. Adicionar local; escolher swatch vermelho; salvar.
2. Adicionar outro com lilás; salvar.
3. **Esperado**: pins com cores distintas; salvar sem cor bloqueado.

### B — Persistência / jogador (SC-002, SC-005, FR-003, FR-008)

1. Editar cor de um local; salvar; recarregar.
2. Sair do Modo GM.
3. **Esperado**: cores mantidas; sem UI de editar cor.

### C — Legenda (FR-005)

1. Observar legenda do mapa.
2. **Esperado**: convenção sugerida visitado / conhecido (e nota de que o GM pode usar outras cores).

### D — Grupo intacto (SC-006, FR-006)

1. Comparar ícone do grupo.
2. **Esperado**: sem mudança de cor por esta feature.

### E — Migração legados

1. Se DB antigo existia sem `cor_pin`, reiniciar backend e listar locais.
2. **Esperado**: todos têm cor (default lilás se não definidos antes).

## Referências

- [spec.md](./spec.md)
- [contracts/api-local-cor-pin.md](./contracts/api-local-cor-pin.md)
- [contracts/ui-pin-color.md](./contracts/ui-pin-color.md)
- [research.md](./research.md)
