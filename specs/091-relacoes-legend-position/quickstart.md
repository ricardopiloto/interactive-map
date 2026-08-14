# Quickstart: Legenda da Rede no mesmo sítio que no mapa

**Feature**: `091-relacoes-legend-position`  
**Purpose**: Validar US1 ([spec.md](./spec.md), [contracts/ui-legend-overlay.md](./contracts/ui-legend-overlay.md)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Viewport de secretária; repetir o cenário 6 em viewport estreita (≤800px)

## Scenarios

### 1. Mesmo canto que o mapa (FR-001, SC-001)

1. Abrir `/mapa` e notar a chave no canto inferior esquerdo do palco.
2. Abrir `/relacoes`.
3. **Expect**: chave da Rede no **mesmo canto** do palco (não na coluna).

### 2. Coluna sem bloco Legenda (FR-002, SC-003)

1. Percorrer a coluna: busca, tipos, lista, estado, Isolar.
2. **Expect**: **não** há «Legenda» nem PJ/NPC/tipos no fundo da coluna; a lista usa o espaço extra.

### 3. Forma compacta (FR-003, FR-009, FR-010, SC-002, SC-007)

1. Ler a overlay.
2. **Expect**: lista **vertical** (PJ, NPC, 8 tipos); **sem** título; **sem** fundo; mais transparente que o resto da UI; nomes e cores identificáveis; grafo visível por baixo.

### 4. Fixa no palco (FR-004, SC-005)

1. Pan e zoom o grafo.
2. **Expect**: a overlay **não** se move; os discos sim. Zoom +/− / 1:1 no canto inferior direito, clicável (FR-005, SC-004).

### 5. Gestos atravessam (FR-011, SC-008)

1. Arrastar um disco (ou o fundo) até ficar sob a chave; clicar / hover.
2. **Expect**: selecciona, destaca ou arrasta o grafo; a chave não «come» o clique.

### 6. Telemóvel (FR-006, SC-006)

1. Viewport estreita (coluna acima do palco).
2. **Expect**: a chave continua no canto inferior esquerdo **do palco**, não volta à coluna.

### 7. Palco vazio (FR-007)

1. Filtro de estado sem personagens.
2. **Expect**: overlay ainda visível.

### 8. Manual e i18n (FR-008)

1. `docs/manual-relacoes.md` descreve a chave no palco.
2. Alternar PT/EN: PJ/PC, NPC e nomes dos tipos correctos.

### 9. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa.
