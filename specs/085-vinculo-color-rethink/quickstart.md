# Quickstart: Cores de Vínculo

**Feature**: `085-vinculo-color-rethink`  
**Purpose**: Validar paleta Sangue / Inimizade / Adversário e regressão dos outros cinco ([spec.md](./spec.md), [contracts/ui-vinculo-palette.md](./contracts/ui-vinculo-palette.md)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Pelo menos dois personagens na Rede (`/relacoes`)
- Modo GM para criar vínculos de teste (se ainda não existirem os três tipos)

## Scenarios

### 1. Vínculo de Sangue é borgonha (US1, FR-001)

1. Abrir `/relacoes`. Ter (ou criar) um vínculo **Vínculo de Sangue**.
2. Isolar o chip **Vínculo de Sangue**.
3. **Expect**: linha sólida `#9e2436` (vermelho escuro / vinho — **não** violeta `#6a3d8c`); chip e swatch da legenda o mesmo tom; bolinha na ficha igual.

### 2. Inimizade é magenta; Adversário continua cobre (US2, FR-002, FR-003)

1. Ter um vínculo **Inimizade** e um **Adversário** visíveis (ou filtrar um de cada vez).
2. **Expect**: Inimizade sólida `#d12d9a` (fúcsia — **não** vermelho-rosa `#e0707a`); Adversário sólida `#c86b3c` (cobre, igual a 0.16.0).
3. Mostrar os três tipos ao mesmo tempo (chips todos ligados).
4. **Expect**: borgonha, magenta e cobre reconhecíveis em &lt;5 s sem ler etiquetas (SC-001).

### 3. Inimizade ≠ Romance (FR-002, FR-004)

1. Ligar só chips **Inimizade** e **Romance**.
2. **Expect**: magenta saturado vs rosa pastel `#e08fc0` — sem hesitação.

### 4. Duas vias misturam os três (US2 cenário 3)

1. GM → conexão **duas vias**: A→B Vínculo de Sangue, B→A Inimizade.
2. **Expect**: gradiente borgonha ↔ magenta, ambos visíveis.
3. Repetir Sangue + Adversário e Inimizade + Adversário.
4. **Expect**: nenhum par colapsa num único vermelho-acastanhado.

### 5. Cinco tipos intactos (US3, FR-005, SC-003)

1. Comparar Aliado, Amizade, Romance, Família, Conhecido com o estado anterior (ou com [data-model.md](./data-model.md)).
2. **Expect**: mesmas cores; Conhecido continua **tracejado**.

### 6. Documentação (FR-007, SC-004)

1. Abrir `docs/feature-rede-relacoes.md` §6.
2. **Expect**: Vínculo de Sangue = vermelho escuro / borgonha (`#9e2436`); Inimizade = magenta/fúcsia (`#d12d9a`); Adversário = cobre (`#c86b3c`). Sem «violeta» no Sangue nem «vermelho» genérico na Inimizade.

### 7. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa.
