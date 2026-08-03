# Quickstart: Validar correção do clique → upload de mapa

## Prerequisites

- Frontend e backend rodando (dev)
- Credenciais GM válidas (`ADMIN_USER` / `ADMIN_PASSWORD`)
- Mapa da campanha já visível (URL padrão ou upload prévio)

## Setup

```bash
# terminal 1 — backend
cd backend && uv run uvicorn app.main:app --reload --port 8000

# terminal 2 — frontend
cd frontend && npm run dev
```

Abrir `http://localhost:5173`. Entrar em **Modo GM**.

## Cenários

### A — Clique genérico não abre seletor (SC-001, FR-001)

1. Com mapa visível, clicar várias vezes na área do mapa (fora de botões/pins).
2. **Esperado**: nenhum diálogo nativo de “escolher arquivo”.

### B — Placement sem seletor (SC-002, FR-002)

1. Em Locais (GM), iniciar **adicionar local** (ou reposicionar / mover grupo).
2. Clicar no mapa para definir posição.
3. **Esperado**: posição registrada / fluxo segue; **sem** seletor de arquivo de mapa.

### C — Substituição explícita (SC-003, FR-003)

1. Acionar o controle **Substituir mapa** (ou equivalente no chrome do mapa).
2. Escolher uma imagem válida e confirmar.
3. **Esperado**: mapa atualiza; se cancelar o diálogo, mapa permanece o mesmo (FR-006).

### D — Estado vazio / falha (FR-004)

1. (Opcional) forçar URL inválida ou limpar visualmente o mapa se houver caminho de teste.
2. Em modo GM, carregar mapa pela UI de estado vazio / mesmo controle.
3. **Esperado**: upload possível sem depender do bug de “clique em qualquer lugar”.

### E — Modo jogador (SC-004, FR-005)

1. Sair do Modo GM.
2. Clicar no mapa / pins.
3. **Esperado**: nenhum seletor de arquivo de mapa.

### F — Retratos intactos (regressão)

1. Em modo GM, editar NPC/local e clicar no slot de imagem do formulário.
2. **Esperado**: seletor de arquivo **ainda** abre para retrato/local (comportamento antigo desejado).

## Referências

- [spec.md](./spec.md)
- [contracts/ui-map-upload-triggers.md](./contracts/ui-map-upload-triggers.md)
- [research.md](./research.md)
