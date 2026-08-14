# Quickstart: Vista geral mais compacta

**Feature**: `087-relacoes-overview-compact`  
**Purpose**: Validar US1 ([spec.md](./spec.md), [contracts/ui-overview-spacing.md](./contracts/ui-overview-spacing.md)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Rede com **≥4 PJs** e **≥12 NPCs** visíveis (criar no Modo GM se preciso)
- Viewport de secretária (palco largo, não só o breakpoint mobile)

## Scenarios

### 1. Vista geral mais junta, sem sobrepor (US1, FR-001, FR-003, SC-002, SC-003)

1. Abrir `/relacoes` **sem** seleccionar ninguém.
2. **Expect**: anel de NPCs visivelmente mais perto dos PJs do que com a folga 240 antiga; discos do mesmo anel mais juntos.
3. Percorrer nomes no anel exterior (12 e, se possível, 20 NPCs).
4. **Expect**: nenhum disco ou nome tapa o vizinho; cada item distinguível.

### 2. Zoom mínimo — campanha típica (FR-002, SC-001)

1. Sem selecção, zoom out até ao **mínimo** (− até parar).
2. **Expect**: com ≥4 PJs e ≥12 NPCs, todos os discos no palco sem pan. Se algum ficar fora, confirmar que a folga já está no chão (itens não sobrepostos) — pan aceite.

### 3. Foco inalterado (FR-004, SC-004)

1. Seleccionar personagem com **4** conexões visíveis: anel interior como após 086 (folga 240).
2. Seleccionar personagem com **8** conexões visíveis: anel interior compacto 086 (160), sem regressão.
3. Clicar o fundo: volta à vista geral **compacta** (120), não à antiga 240.

### 4. Manual

1. `docs/manual-relacoes.md` palco: vista geral mais junta; **não** dizer que a vista geral «não muda».

### 5. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa.
