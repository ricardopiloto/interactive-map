# Quickstart: Novos Tipos de Vínculo

**Feature**: `081-novos-tipos-vinculo`  
**Purpose**: Validar catálogo de 8 tipos, persistência, direcção default, qualificadores e doc ([spec.md](./spec.md), [contracts/](./contracts/)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Modo GM desbloqueado
- Pelo menos dois personagens na Rede (`/relacoes`)
- UI PT-BR e EN (seletor no header)

## Scenarios

### 1. Criar Adversário (US1, FR-002)

1. GM → **+ Conexão** → modo recíproco → tipo **Adversário** → guardar.
2. Reabrir o vínculo.
3. **Expect**: tipo Adversário; API `tipo_ab: "adversario"`; sem 422.

### 2. Seleccionar Vínculo de Sangue pré-preenche A→B (US1, FR-005)

1. Nova conexão, modo recíproco, tipo ainda Conhecido, direcção Mútuo.
2. Mudar tipo para **Vínculo de Sangue**.
3. **Expect**: rádio direcção **A → B** seleccionado (não Mútuo).
4. Guardar; reabrir.
5. **Expect**: `direcao: "a_para_b"` persistido; editável para Mútuo ou B→A.

### 3. Editar Blood Bond existente não reset da direcção (FR-005)

1. Vínculo Vínculo de Sangue com direcção **B→A** (ou Mútuo) gravado.
2. Abrir edição **sem** mudar o tipo.
3. **Expect**: direcção gravada intacta (não volta sozinha para A→B).
4. Mudar tipo para Amizade e de volta para Vínculo de Sangue.
5. **Expect**: direcção passa a A→B (re-selecção).

### 4. Duas vias mistura tipos (edge)

1. Modo duas vias: A→B **Adversário**, B→A **Amizade** → guardar.
2. **Expect**: grafo duas cores/tipos; sem crash; `tipo_ba: "amizade"`.

### 5. Grafo, filtro e legenda (US2, SC-002)

1. Abrir `/relacoes`.
2. **Expect**: 8 chips e 8 entradas de legenda na ordem Aliado, Vínculo de Sangue, Amizade, Inimizade, Adversário, Romance, Família, Conhecido.
3. Filtrar só **Adversário**.
4. **Expect**: só a aresta cobre `#c86b3c` visível; linha sólida.
5. Isolar **Vínculo de Sangue**.
6. **Expect**: linha sólida violeta `#6a3d8c`; seta se `direcao` definida.

### 6. i18n (FR-008)

1. Header → EN.
2. **Expect**: **Adversary**, **Blood Bond** em select, chips e legenda.
3. Voltar PT → **Adversário**, **Vínculo de Sangue**.

### 7. Qualificadores (US3, FR-007)

1. Tipo **Aliado** → datalist inclui **Lacaio** (e Mentor, Medo, …).
2. Tipo **Vínculo de Sangue** → **Lacaio** e **Medo**.
3. Tipo **Adversário** → **Rival**, **Traidor**, **Antigo aliado**, **Medo**.

### 8. Legados intactos (SC-003)

1. Editar um vínculo Amizade/Inimizade existente.
2. **Expect**: tipo, cor, sugestões (Inimizade sem Lacaio) iguais a 0.15.0.

### 9. Documentação (FR-009, SC-004)

1. Abrir `docs/feature-rede-relacoes.md` §6.
2. **Expect**: tabela com 8 tipos; §6.1 com Lacaio em Aliado e linha Vínculo de Sangue / Adversário; `docs/v2/feature-rede-relacoes.md` **não** exigido.

### 10. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa (`Record<VinculoTipo, …>` completo).
