# Quickstart: Migração legada e corte (099)

Validação local. Contratos: [contracts/](./contracts/). Modelo: [data-model.md](./data-model.md). **Não** apontar a `/opt/codex-*` neste guia.

## Pré-requisitos

- Backend 093–098 (`control.db`, auth, mídia, home/painel).
- Utilizador mestre activo (095) para `--email`.
- `uv` no `backend/`.
- Fixtures `backend/tests/fixtures/legado/wfrp/` e `…/wod/` (árvore `mapa.db` + `uploads/`; o implement cria-as nos testes).

## 1. Import legado (ensaio)

```bash
cd backend
uv run campaign-codex campanha importar-legado \
  --origem tests/fixtures/legado/wfrp \
  --slug wfrp --sistema wfrp4e --nome "WFRP" \
  --email mestre@example.com \
  --relatorio /tmp/rel-wfrp.json
# stdout: OK wfrp campanhas/<uuid> PASS
# origem fixture inalterada; /tmp/rel-wfrp.json resultado PASS
```

Repetir com `wod` / `wod`. Relatório FAIL → não há campanha pela metade.

## 2. Isolamento

```bash
# GET /api/c/wfrp/locais ≠ locais de wod
# GET mídia de A com slug B → 404
```

Ver [isolation-legado.md](./contracts/isolation-legado.md).

## 3. Recusas

```bash
uv run campaign-codex campanha importar-legado --origem /tmp/x.zip …   # ERRO ORIGEM_INVALIDA
uv run campaign-codex campanha importar-legado --origem … --cota-bytes 1  # ERRO COTA_EXCEDIDA se uploads > 1
```

## 4. Scripts 078

```bash
./scripts/nova-campanha.sh wod-x 8020 8091 wod
# exit 1; aviso de aposentadoria; nenhuma pasta nova
./scripts/migrar-wfrp.sh
# idem
```

## 5. Snippets (não colar em CI)

```bash
./scripts/imprimir-snippets-codex.sh --porta-api 8000 --porta-web 8080
# stdout contém campaign-codex.1nodado.com.br; deploy/Caddyfile e hub/campanhas.json intactos
```

## 6. Suite

```bash
cd backend && uv run pytest tests/test_cli_importar_legado.py tests/test_isolation_legado.py tests/test_scripts_aposentados.py tests/test_snippets_codex.py -q
```

Esperado: vermelho em TDD; verde após implementação.

## Fora deste quickstart

Cortar produção (`/opt`, Cloudflare) — só o runbook humano em [runbook-corte.md](./contracts/runbook-corte.md), depois de dois PASS reais em **cópias**.
