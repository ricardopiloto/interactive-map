# Quickstart: Anel de foco mais aberto (≤3 conexões)

**Feature**: `089-relacoes-few-spread`  
**Purpose**: Validar US1 ([spec.md](./spec.md), [contracts/ui-focus-sparse-spacing.md](./contracts/ui-focus-sparse-spacing.md)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Personagens com **2**, **5** e **8** conexões visíveis (criar no Modo GM se preciso)
- Ideal: um com **3** e um com **4** para o limiar
- Viewport de secretária

## Scenarios

### 1. ≤3 mais aberto (FR-001, SC-001)

1. Abrir `/relacoes` e seleccionar um personagem com **2** conexões visíveis.
2. **Expect**: anel interior visivelmente mais aberto que a folga padrão (~30% mais distância entre vizinhos).
3. Nomes e textos nas linhas legíveis.

### 2. Limiar 3 vs 4 (FR-001, FR-002)

1. Personagem com **3** conexões: anel aberto (312).
2. Personagem com **4** conexões: anel padrão (240), **não** o aberto.

### 3. 4–6 inalterado (FR-002, SC-002)

1. Seleccionar personagem com **5** conexões visíveis.
2. **Expect**: anel interior como hoje (folga padrão), sem abertura 089 e sem compacto 088.

### 4. >6 intacto (FR-003, SC-003)

1. Seleccionar personagem com **8** conexões visíveis.
2. **Expect**: anel compacto da 088, sem regressão.

### 5. Vista geral e anel exterior (FR-004, SC-004, SC-005)

1. Clicar o fundo: vista geral com folga **087** (120).
2. Com o personagem de 2 seleccionado, o anel **exterior** (não-directos) mantém folga 240.

### 6. Zero conexões

1. Seleccionar personagem sem vínculos visíveis.
2. **Expect**: só o disco central; sem anel interior a espaçar.

### 7. Manual

1. `docs/manual-relacoes.md` palco: com 3 ou menos conexões o anel interior fica mais aberto; com mais de 6 continua mais junto.

### 8. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa.
