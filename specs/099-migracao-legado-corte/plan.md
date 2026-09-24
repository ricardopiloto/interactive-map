# Implementation Plan: Migração das instâncias legadas e corte

**Branch**: `099-migracao-legado-corte` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/099-migracao-legado-corte/spec.md`

**Release**: **2.0.0** no fecho do corte (CHANGELOG `[Unreleased]` até implementar). Modelo de deploy: uma instância Codex; 078 deixa de ser procedimento corrente.

**Depends on**: 098–093 Implemented. Distinto de 097 (zip). Padrão snippets: 078.

## Summary

Import de operador: copiar `mapa.db`+`uploads/` de uma árvore de instância para um sítio UUID novo, ponte+stamp só no destino, reescrever URLs de mídia, dono 095, relatório de contagens. Ensaio em cópias obrigatório. Corte: publicar `campaign-codex.1nodado.com.br` (snippets stdout, sem editar o host), Codex no ar **antes** de parar `/opt/codex-*`, janela 14 dias. Scripts `nova-campanha.sh` / `migrar-wfrp.sh` recusam. Slugs produção `wfrp` / `wod`. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12; bash para snippets/scripts 078  
**Primary Dependencies**: FastAPI/SQLModel/Alembic já no repo; stdlib `shutil`/`hashlib`/`json` — **sem** dependência nova (IV)  
**Storage**: lê origem (árvore); escreve `DATA_DIR/campanhas/<uuid>/` + `control.db`; **nunca** `/opt/codex-*`  
**Testing**: pytest — TDD import legado, relatório, origem intacta, isolamento WFRP/WoD, recusas, scripts aposentados, snippets sem write  
**Target Platform**: CLI operador + docs/runbook; Campaign Codex no mesmo compose; host Caddy/Tunnel colado à mão  
**Project Type**: CLI + ops runbook (sem UI nova, sem API de import legado)  
**Performance Goals**: fixture de ensaio local em tempo de teste típico; cópia de produção limitada ao I/O do disco (10 GB omissão)  
**Constraints**: origem só leitura; zip 097 intocado; sem redirect dos hosts antigos; cota omissão 10×1024³ com `--cota-bytes`  
**Scale/Scope**: 1 serviço import legado; 1 comando CLI; 1 script snippets; 2 scripts 078 a recusar; runbook + README/manuais; 2 fixtures  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: Import = sítio UUID novo; WFRP ⊥ WoD; matriz [isolation-legado.md](./contracts/isolation-legado.md); sem `campanha_id` no conteúdo. Sem rota HTTP nova (matriz 094/096 cobre GET). **PASS**
- **II. Testes primeiro**: import legado, contagens, origem intacta, recusa zip/`.db`, cota, scripts 078, isolamento — testes a falhar **antes**. **PASS** (planeado)
- **III. Produção legada**: Esta **é** a spec de corte. Código/testes MUST NOT escrever em `/opt/codex-*`; ensaio = fixtures/cópias. Snippets não editam Caddy do host. **PASS**
- **IV. Simplicidade**: Reutilizar `create_campanha`, `ensure_campaign_schema`, `assign_owner`, reconcile 096. Sem zip segundo formato. Sem dep nova. **PASS**
- **V. i18n**: Sem copy UI nova. Erros CLI por código. Manuais: URL Codex (pt-BR; en se o ficheiro existir). **PASS**
- **VI. Migrações**: Ponte + stamp na **cópia**; sem revisão Alembic nova; rollback = apagar sítio + linha controle. **PASS**

**Post-Phase 1**: Unchanged. Contratos cobrem CLI, relatório, rewrite, runbook, isolamento, scripts 078. Sem UI; sem Alembic novo; `/opt` fora do código.

## Project Structure

### Documentation (this feature)

```text
specs/099-migracao-legado-corte/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-importar-legado.md
│   ├── relatorio-verificacao.md
│   ├── url-rewrite-persist.md
│   ├── runbook-corte.md
│   ├── isolation-legado.md
│   └── scripts-aposentados.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/services/legacy_import.py     # copiar, ponte, rewrite, relatório, rollback
backend/app/cli.py                         # campanha importar-legado
backend/tests/fixtures/legado/wfrp/        # mapa.db + uploads (mínimo)
backend/tests/fixtures/legado/wod/
backend/tests/test_cli_importar_legado.py
backend/tests/test_isolation_legado.py
backend/tests/test_scripts_aposentados.py
backend/tests/test_snippets_codex.py
scripts/imprimir-snippets-codex.sh         # stdout Caddy + tunnel
scripts/nova-campanha.sh                   # aviso + exit 1
scripts/migrar-wfrp.sh                     # aviso + exit 1
docs/runbook-corte-campaign-codex.md       # runbook humano (14 dias, ordem)
README.md / docs/manuais.md / manuais      # URLs /c/wfrp /c/wod
CHANGELOG.md / backend/README.md
```

**Structure Decision**: Núcleo Python no backend (testável, reusa 093/095/096). Snippets em script bash no estilo 078 (templates já em `deploy/snippets/`). Sem router FastAPI novo. FE intocado.

## Complexity Tracking

> Sem violações — tabela vazia de propósito.
