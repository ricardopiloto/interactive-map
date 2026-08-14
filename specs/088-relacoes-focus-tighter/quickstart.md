# Quickstart: Anel de foco ainda mais compacto

**Feature**: `088-relacoes-focus-tighter`  
**Purpose**: Validar US1 ([spec.md](./spec.md), [contracts/ui-focus-inner-spacing.md](./contracts/ui-focus-inner-spacing.md)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Pelo menos um personagem com **4** conexões visíveis e outro com **8** (criar no Modo GM se preciso)
- Ideal: um com **12** conexões, incluindo um tipo de nome longo (ex. Vínculo de Sangue) e, se possível, um vínculo de duas pontas
- Viewport de secretária

## Scenarios

### 1. ≤6 inalterado (FR-002, SC-002)

1. Abrir `/relacoes` e seleccionar um personagem com **4** conexões visíveis.
2. **Expect**: anel interior com a folga padrão de foco (como após 086/087) — **não** o compacto novo.

### 2. >6 cerca de 30% mais junto (FR-001, SC-001)

1. Seleccionar um personagem com **8** conexões visíveis.
2. **Expect**: anel interior visivelmente mais compacto do que o compacto 086 (160); discos vizinhos ~30% mais perto.
3. **Expect**: nenhum disco ou nome tapa o vizinho.

### 3. Textos dos vínculos legíveis (FR-003, SC-003)

1. Com o personagem de 8 (e, se existir, o de 12) seleccionado, ler os rótulos nas **linhas** destacadas (modo de rótulos de foco).
2. **Expect**: cada texto de vínculo lê-se sem adivinhar; pílulas não se fundem umas com as outras nem com os nomes dos discos.
3. Se algum texto ficar ilegível: **não** aceitar 112 — a folga tem de subir (contrato: `COMPACT_INNER_TIGHTEN`).

### 4. Vista geral e anel exterior intactos (FR-004, SC-004, SC-005)

1. Clicar o fundo: vista geral com a folga **087** (120) — NPCs não mais juntos do que após 087.
2. Com o personagem de 8 seleccionado, observar o anel **exterior** (quem não tem vínculo directo).
3. **Expect**: esse anel com a folga 240 de sempre.

### 5. Limiar exacto (FR-005)

1. Personagem com **6** conexões visíveis: folga padrão (240), sem compactar.
2. Personagem com **7**: já usa 112.

### 6. Manual

1. `docs/manual-relacoes.md` palco: com >6 conexões o anel interior fica **ainda** mais junto; textos das linhas continuam legíveis.

### 7. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa.
