# Implementation Plan: Sistema de RPG system agnostic (aceitar qualquer nome)

**Branch**: `140-sistema-agnostico` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/140-sistema-agnostico/spec.md`

**Backlog**: [BKLG-029](../../docs/v2/backlog.md#bklg-029-produto--sistema-de-rpg-deveria-ser-system-agnostic-aceitar-qualquer-nome)

## Summary

Remover a allowlist `KNOWN_SISTEMAS` que rejeita criação (`SISTEMA_INVALIDO` em `create_campanha`) e importação (`SISTEMA_DESCONHECIDO` em `validate_package_members`). Qualquer string não vazia dentro de `max_length=40` (já em schema/model) passa. `DEFAULT_MODULOS_BY_SISTEMA` / `default_modulos()` mantêm o comportamento especial de `wfrp4e` (fadiga) e `wod` ([]); nomes não mapeados continuam com `modulos_ativos=[]`. Actualizar testes que hoje esperam rejeição; acrescentar casos de criação/import com sistema livre.

## Technical Context

**Language/Version**: Python 3.12+ (uv / FastAPI), TypeScript frontend inalterado na lógica (já é texto livre)

**Primary Dependencies**: Existentes — SQLModel/Pydantic `Field(min_length=1, max_length=40)` em `CriarCampanhaRequest`

**Storage**: SQLite `campanha.sistema` (String 40) — sem migração

**Testing**: pytest — Constitution II: actualizar/escrever testes **antes** ou em lockstep com a remoção da allowlist (`test_campanha_criar_http.py` + import)

**Target Platform**: API `POST /api/campanhas`, import ZIP de campanha, CLI `campanha criar` (via mesmo serviço)

**Project Type**: Web application (backend validation change; frontend já alinhado)

**Performance Goals**: N/A

**Constraints**: FR-001–005; sem schema change; manter módulos default por chave exacta em `DEFAULT_MODULOS_BY_SISTEMA`; não inventar limite de tamanho novo (40)

**Scale/Scope**: `campanha_admin.py`, `campaign_import.py`, testes HTTP/import; opcional limpeza de imports mortos (`KNOWN_SISTEMAS`, códigos se deixarem de ser emitidos)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — validação por campanha; sem cruzar mesas.
- **II. Testes primeiro**: PASS — plan exige actualizar o teste que espera `SISTEMA_INVALIDO` e cobrir sistema livre + regressão `wfrp4e`→fadiga **antes**/junto da remoção da allowlist.
- **III. Produção legada**: PASS / N/A — só criação/import novas; instâncias antigas intactas.
- **IV. Simplicidade**: PASS — remove validação; zero deps; reutiliza `max_length` existente.
- **V. i18n**: PASS — sem copy nova obrigatória; chaves `SISTEMA_INVALIDO` / `SISTEMA_DESCONHECIDO` podem permanecer no mapa de erros (código morto) ou ser removidas se nada as emitir — preferir manter chaves até grep zero de emissão.
- **VI. Migrações**: PASS / N/A — sem alteração de schema.

**Post-design re-check**: PASS — contratos de API actualizam códigos de recusa; testes listados; sem migração.

## Project Structure

### Documentation (this feature)

```text
specs/140-sistema-agnostico/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sistema-livre.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
backend/app/
├── services/campanha_admin.py      # Remover check KNOWN_SISTEMAS; default_modulos intacto
├── services/campaign_import.py     # Remover check SISTEMA_DESCONHECIDO
├── schemas/campanhas.py            # min_length/max_length já OK
├── config.py                       # DEFAULT_MODULOS_BY_SISTEMA intacto
└── services/package_schema.py      # constante SISTEMA_DESCONHECIDO pode ficar

backend/tests/
├── test_campanha_criar_http.py     # inverter caso "desconhecido"; regressão wfrp4e
└── test_import_*.py / novo caso    # manifesto com sistema livre aceito

frontend/                           # Sem mudança funcional esperada (input já livre)
```

**Structure Decision**: Mudança concentrada no serviço de admin + validação de pacote. Frontend/Painel/`NovoCodexPage` já tratam o campo como texto livre — só passam a deixar de receber o erro.

## Complexity Tracking

Nenhuma violação.
