# Quickstart: Validar alinhamento dos nós na Rede de rotas

## Prerequisites

- App a correr; modo GM; mapa carregado
- [ui-digitizer-node-align.md](./contracts/ui-digitizer-node-align.md)

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

## Cenários

### A — Traçar segmento: nó no ponto do mapa (SC-001)

1. GM → **Rede de rotas** → **Traçar segmento**.
2. Escolher um cruzamento/feature óbvia sob um nó existente (ou criar um antes).
3. **Esperado**: centro do marcador do nó sobre a feature; sem desvio lateral notório.

### B — Colocar nó (SC-002)

1. **Colocar nó** → clicar num ponto óbvio.
2. **Esperado**: marcador aparece sob o clique; em Traçar segmento continua alinhado.

### C — Zoom (SC-004)

1. Zoom in/out na Rede; repetir A.
2. **Esperado**: alinhamento mantém-se.

### D — Segmento coerente (FR-005)

1. Traçar segmento entre dois nós (com ou sem intermediários).
2. **Esperado**: linha liga centros dos nós / pontos clicados; sem “salto” entre linha e marcador.

### E — Sem regressão campanha (FR-007)

1. No mapa principal, pins de locais (estilo 034) inalterados.

## Referências

- [spec.md](./spec.md)
- [research.md](./research.md)
