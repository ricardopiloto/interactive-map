# Contract: legado → ponte → carimbo

## Pré-condição (ensaio 093)

1. `campanha criar` (sítio vazio na head).
2. Substituir `campanha.db` por cópia de fixture **sem** `alembic_version` (formato pré-Alembic / estilo `mapa.db` actual).
3. Contar N locais, M personagens (e vínculos se existirem) **antes** de abrir.

## Ao abrir (resolve)

1. Detectar legado (sem revisão válida).
2. Correr ponte `_migrate_sqlite` **só** nesse engine.
3. `alembic stamp` (ou equivalente) na head da árvore de campanha.
4. Contagens e ids iguais a antes.

## Segunda abertura

Ponte **não** reescreve schema à revelia; `alembic_version` = head.

## Campanha nova (sem cópia)

Abertura: já head; ponte **não** corre.
