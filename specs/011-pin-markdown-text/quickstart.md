# Quickstart: Validar Markdown na descrição do pin

## Prerequisites

- Frontend e backend rodando; pelo menos um local
- Credenciais GM

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Texto puro (SC-002, FR-003)

1. Como GM, editar local com descrição só prosa; salvar.
2. Sair do Modo GM; abrir o pin.
3. **Esperado**: texto simples legível.

### B — Markdown básico (SC-001, FR-002)

1. Como GM, definir descrição contendo negrito, lista e título curto; salvar.
2. Como jogador, abrir o pin.
3. **Esperado**: formatação visível no modal.

### C — Link seguro (SC-006, FR-011)

1. Incluir `[Exemplo](https://example.com)` na descrição; salvar; abrir pin.
2. Clicar no link.
3. **Esperado**: abre em nova aba; SPA não “some” por baixo.

### D — Sem imagem (SC-005, FR-010)

1. Incluir `![foto](https://example.com/x.png)` na descrição; abrir pin.
2. **Esperado**: nenhuma imagem carregada (Network sem request dessa URL por causa do MD).

### E — Conteúdo inseguro (SC-004, FR-007)

1. Incluir `<script>alert('x')</script>` e/ou `[x](javascript:alert(1))`; abrir pin.
2. **Esperado**: sem execução de script; link javascript não navega.

### F — Hint GM sem preview (FR-005, FR-006)

1. Abrir formulário de local no Modo GM.
2. **Esperado**: indicação de Markdown no campo; **sem** preview/pré-visualizar.

### G — Round-trip (SC-003, FR-004)

1. Salvar Markdown; reabrir edição GM.
2. **Esperado**: textarea mostra o mesmo texto digitado (sintaxe MD intacta).

## Referências

- [spec.md](./spec.md)
- [contracts/ui-pin-markdown.md](./contracts/ui-pin-markdown.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
