# Implementation Plan: Exportar e importar campanha

**Branch**: `097-exportar-importar` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/097-exportar-importar/spec.md`

**Release**: sem bump obrigatório (manter `0.19.1` + CHANGELOG `[Unreleased]`), salvo decisão explícita. Não corta `/opt/codex-*` (099). Sem UI (098).

**Depends on**: 096 (Implemented), 095, 093 — actualizar linha «Draft» da 096 na spec se ainda constar.

## Summary

Pacote zip portátil (contrato fechado: `manifest.json` + `content.json` + imagens nas categorias) para backup e transferência de mesa. Export API **só dono**; CLI operador. Import cria campanha **nova** (UUID novo, IDs preservados, sistema do manifesto), qualquer mestre autenticado vira dono; slug = origem se livre senão slug explícito. Recusa zip mau / `.db` / extras / schema futuro sem rasto. Schema antigo reconhecido → migrar conteúdo até head (sem abrir `.db` de utilizador). Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12 (stdlib `zipfile`); TypeScript/FE **N/A** nesta fase  
**Primary Dependencies**: FastAPI, SQLModel, Alembic (já); **zipfile** stdlib — **sem** dependência nova (IV)  
**Storage**: lê `campanha.db` + `uploads/` da origem; escreve sítio UUID novo + linha `Campanha` + `Membro` dono  
**Testing**: pytest — TDD round-trip contagens, recusas maliciosas, export só-dono, schema futuro/antigo, cota  
**Target Platform**: backend API + CLI; Campaign Codex no repo; legado `/opt` intocado  
**Project Type**: web API + CLI operador  
**Performance Goals**: mesa de teste com imagens < 2 min local (SC-004)  
**Constraints**: Nunca adoptar `.db` enviado; lista fechada de entradas zip; atomicidade (rollback pasta/controlo); sem UI  
**Scale/Scope**: serviços export/import; rotas admin export + import global; CLI; `require_dono`; actualização matriz 095  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: Export A sem dados de B; import = sítio novo; matriz anónimo / não-dono / outra campanha. **PASS** (planeado; FR-001/015)
- **II. Testes primeiro**: export/import, zip mau, `.db`, schema, round-trip — testes a falhar antes. **PASS** (planeado)
- **III. Produção legada**: Zero `/opt/codex-*`. **PASS**
- **IV. Simplicidade**: zip + JSON; stdlib `zipfile`; sem adoptar engine de `.db` alheio. **PASS**
- **V. i18n**: Códigos de erro mapeáveis; copy UI = 098. **PASS**
- **VI. Migrações**: Conteúdo importado na head; schema futuro recusado; antigo migrado via transformações da app (não Alembic sobre `.db` de terceiros). **PASS**

**Post-Phase 1**: Unchanged. Contratos cobrem zip, API/CLI, `require_dono`, segurança. UI 098; legado 099.

## Project Structure

### Documentation (this feature)

```text
specs/097-exportar-importar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── package-zip.md
│   ├── api-export-import.md
│   ├── cli-export-import.md
│   ├── require-dono.md
│   └── security-refusals.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/services/campaign_export.py    # montar zip / serializar conteúdo
backend/app/services/campaign_import.py    # validar, migrar JSON, criar sítio, rollback
backend/app/services/package_schema.py     # versões reconhecidas + migrators
backend/app/deps/auth.py                   # require_dono (papel == dono)
backend/app/routers/admin/export.py        # GET …/admin/export
backend/app/routers/campanhas.py           # POST /api/campanhas/import (fora do slug)
backend/app/cli.py                         # campanha exportar|importar
backend/tests/test_export_import_*.py
backend/tests/fixtures/packages/           # zips bons/maus
CHANGELOG.md / backend/README.md
```

**Structure Decision**: Export sob `/api/c/{slug}/admin/export` (dona). Import em `/api/campanhas/import` (autenticado, cria campanha). Núcleo partilhado CLI↔API. FE omitido.

## Complexity Tracking

> Sem violações — tabela vazia de propósito.
