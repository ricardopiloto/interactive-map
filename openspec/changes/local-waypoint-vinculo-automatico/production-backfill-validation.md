# Validação do backfill Local ↔ Waypoint

## Desenvolvimento — 2026-10-15

- Catálogo ativo: `shadow-of-the-demon-lord`, `wfrp`, `world-of-warhammer`.
- Antes da aplicação: 3 Locais sem Waypoint em `wfrp`; 0 nas demais campanhas.
- O comando `python -m app.backfill_local_waypoints` fez backup de cada `campanha.db` ativa com `sqlite3.Connection.backup()` antes de abrir sessões para escrita. Cada cópia passou em `PRAGMA integrity_check`.
- Backups da primeira execução: `backend/data/backups/local-waypoint-20261015T213215Z/`.
- Resultado da primeira execução: 3 Waypoints criados em `wfrp`; 0 nas demais. Segunda execução: 0 em todas.
- Comparação do backup inicial de `wfrp` com o banco após o backfill: os 5 Locais mantiveram exatamente seus pares `(id, x, y)`; os Waypoints passaram de 44 para 47; todos os Locais têm um nó nas mesmas coordenadas.
- O handler de `GET /api/c/{slug}/admin/locais` retornou 7 Locais no catálogo ativo e nenhum com `waypoint_id` vazio.

## Produção — pendente

Esta validação deve ser preenchida antes de aplicar o backfill em produção:

1. Registrar a janela de manutenção e interromper o backend ou bloquear escritas.
2. Configurar `DATA_DIR` para uma **cópia isolada** dos dados de produção e executar `python -m app.backfill_local_waypoints`. O comando cria backups online próprios antes de qualquer escrita.
3. Comparar, por amostragem, Localidades reais na cópia antes e depois: `id`, `x` e `y` devem permanecer iguais; só deve surgir um Waypoint novo para cada Local antes desvinculado, nas mesmas coordenadas.
4. Com o backend de produção ainda sem escritas, executar o comando no `DATA_DIR` real e guardar o caminho do `manifest.json` e dos backups gerados.
5. Repetir a amostragem e conferir que todos os Locais das campanhas ativas têm `waypoint_id`.

Se a amostragem pós-aplicação falhar, manter o backend parado. Restaurar **cada** `campanha.db` afetado a partir do backup listado no `manifest.json`, usando `sqlite3.Connection.backup()` da cópia para o banco de destino com todas as conexões do serviço fechadas; depois verificar `PRAGMA integrity_check` e reiniciar o backend. Registrar os resultados e caminhos efetivos antes de considerar a task 6.2 concluída.

Exemplo de restauração para uma campanha, com o serviço parado e os caminhos substituídos pelos do manifesto:

```python
import sqlite3

with sqlite3.connect("CAMINHO_DO_BACKUP") as backup:
    with sqlite3.connect("CAMINHO_DA_CAMPANHA_DB") as destination:
        backup.backup(destination)
        assert destination.execute("PRAGMA integrity_check").fetchone() == ("ok",)
```
