# Validação do backfill Local ↔ Waypoint

## Desenvolvimento — 2026-10-15

- Catálogo ativo: `shadow-of-the-demon-lord`, `wfrp`, `world-of-warhammer`.
- Antes da aplicação: 3 Locais sem Waypoint em `wfrp`; 0 nas demais campanhas.
- O comando `python -m app.backfill_local_waypoints` fez backup de cada `campanha.db` ativa com `sqlite3.Connection.backup()` antes de abrir sessões para escrita. Cada cópia passou em `PRAGMA integrity_check`.
- Backups da primeira execução: `backend/data/backups/local-waypoint-20261015T213215Z/`.
- Resultado da primeira execução: 3 Waypoints criados em `wfrp`; 0 nas demais. Segunda execução: 0 em todas.
- Comparação do backup inicial de `wfrp` com o banco após o backfill: os 5 Locais mantiveram exatamente seus pares `(id, x, y)`; os Waypoints passaram de 44 para 47; todos os Locais têm um nó nas mesmas coordenadas.
- O handler de `GET /api/c/{slug}/admin/locais` retornou 7 Locais no catálogo ativo e nenhum com `waypoint_id` vazio.

## Ensaio contra cópia real de produção — 2026-10-16

- Origem: tarball do volume Docker `campaign-codex_mapa-data` (identificado como o volume realmente montado em `/app/data` do container `api` em produção, confirmado por `docker inspect`, distinto de `codex-wfrp_mapa-data` — instância antiga pré-corte — e de `interactive-map_mapa-data` — volume órfão sem dado de campanha). Extraído em `tmp/producao-copia/` (fora do controle de versão, `tmp/` já está no `.gitignore`). Cópia intocada preservada em `tmp/producao-copia-pristine/` para comparação.
- Catálogo ativo real: `wfrp`, `wod`, `cronicas-de-saphyr`, `warhammer-prenuncios-de-perdicao` (as duas últimas sem nenhum Local cadastrado ainda).
- **Gap de schema encontrado e resolvido**: `control.db` de produção estava em `007_admin_console_timestamps`; o código local já exige `008_remove_genero` (migração nova de `tema-unico-paper-parchment`, ainda não publicada). Rodado `alembic upgrade head` (via `Config.set_main_option` apontando pro `sqlalchemy.url` da cópia, já que o `.ini` tem caminho fixo e não lê `DATA_DIR`) — aplicou limpo, coluna `genero` removida, dados das 4 campanhas intactos. Isso confirma que a migração nova de `control.db` precisa ser aplicada em produção **antes ou junto** do backfill desta change, não é independente.
- Todas as 4 `campanha.db` já estavam em `009_item` (head), sem gap de schema por campanha.
- Backend local subido com `DATA_DIR` apontando pra cópia migrada; confirmado via `GET /api/health` e `GET /api/c/{wfrp,wod}/config` que os dados reais (nome, sistema, imagem de mapa) respondem corretamente.
- Antes do backfill: `wfrp` com 11 Locais e 198 Waypoints (rede de rotas já densa), só 8 vinculados a um Local (3 sem vínculo); `wod` com 8 Locais e 0 Waypoints (nenhum vínculo). As duas campanhas vazias sem Locais, nada a fazer.
- `python -m app.backfill_local_waypoints` (com `DATA_DIR` na cópia): backup online de cada `campanha.db` ativa com `sqlite3.Connection.backup()` + `PRAGMA integrity_check` antes de qualquer escrita, manifest em `tmp/producao-copia/backups/local-waypoint-20261016T014346Z/manifest.json`. Resultado: **3 Waypoints criados em `wfrp`, 8 em `wod`**, 0 nas duas campanhas vazias — batendo exatamente com a contagem prévia de Locais sem vínculo.
- Segunda execução: 0 em todas as 4 campanhas (idempotente, confirmado).
- Amostragem completa (não só parcial): comparando `tmp/producao-copia-pristine/` com a cópia pós-backfill, os 19 Locais de `wfrp`+`wod` mantiveram exatamente seus pares `(id, x, y)` — nenhuma posição mudou — e os 19 agora têm `waypoint_id` preenchido (confirmado contando `waypoint.local_id IS NOT NULL`).

## Produção real — pendente de execução

O ensaio acima já cobre os passos 2-3-5 originais contra dados genuínos de produção (não uma simulação). Falta só a aplicação real:

1. Registrar a janela de manutenção e interromper o backend de produção (ou bloquear escritas) — **a migração `008_remove_genero` do `control.db` precisa ser aplicada no mesmo momento/janela**, já que o ensaio confirmou o gap de schema.
2. Com o backend de produção parado, executar `alembic upgrade head` (via override de `sqlalchemy.url`, como no ensaio, ou copiando `alembic_control.ini` temporariamente) no `control.db` real, depois `python -m app.backfill_local_waypoints` apontando `DATA_DIR` pro volume real — **não** numa cópia desta vez. O comando cria seus próprios backups online antes de escrever.
3. Guardar o caminho do `manifest.json` e dos backups gerados (ficam dentro do próprio `DATA_DIR`, em `backups/local-waypoint-<timestamp>/`).
4. Repetir a amostragem (comparar backup vs. pós-aplicação) e conferir que todos os Locais das campanhas ativas têm `waypoint_id`, sem nenhuma posição alterada.
5. Reiniciar o backend de produção e fazer o smoke test do mapa de cada campanha ativa.

Se a amostragem pós-aplicação falhar, manter o backend parado. Restaurar **cada** `campanha.db` afetado a partir do backup listado no `manifest.json`, usando `sqlite3.Connection.backup()` da cópia para o banco de destino com todas as conexões do serviço fechadas; depois verificar `PRAGMA integrity_check` e reiniciar o backend. Registrar os resultados e caminhos efetivos antes de considerar a task 6.2 concluída.

Exemplo de restauração para uma campanha, com o serviço parado e os caminhos substituídos pelos do manifesto:

```python
import sqlite3

with sqlite3.connect("CAMINHO_DO_BACKUP") as backup:
    with sqlite3.connect("CAMINHO_DA_CAMPANHA_DB") as destination:
        backup.backup(destination)
        assert destination.execute("PRAGMA integrity_check").fetchone() == ("ok",)
```
