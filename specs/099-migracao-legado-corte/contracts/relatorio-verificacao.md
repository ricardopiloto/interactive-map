# Contract: Relatório de verificação

**Feature**: 099  
**Emitido por**: `campanha importar-legado` (stdout + `--relatorio`)

## JSON

```json
{
  "origem": "/path/copia-wfrp",
  "destino_slug": "wfrp",
  "destino_uuid": "<uuid>",
  "tabelas": {
    "arco": { "antes": 0, "depois": 0 },
    "npc": { "antes": 12, "depois": 12 },
    "local": { "antes": 8, "depois": 8 },
    "local_npc": { "antes": 3, "depois": 3 },
    "local_conexao": { "antes": 4, "depois": 4 },
    "grupo_posicao": { "antes": 1, "depois": 1 },
    "vinculo": { "antes": 5, "depois": 5 },
    "waypoint": { "antes": 0, "depois": 0 },
    "route_segment": { "antes": 0, "depois": 0 },
    "map_scale": { "antes": 1, "depois": 1 }
  },
  "ficheiros_uploads": { "antes": 20, "depois": 20 },
  "alembic_destino": "<revision head>",
  "origem_intacta": true,
  "resultado": "PASS"
}
```

Chaves de `tabelas`: lista canónica em [data-model.md](../data-model.md). Tabela inexistente **nos dois** lados: `antes=0` `depois=0`. Existe só num lado: `FAIL`.

`antes` = `COUNT(*)` no `mapa.db` **origem** (ficheiro copiado, sem ponte).  
`depois` = `COUNT(*)` no `campanha.db` **destino** após ponte+stamp.  
`ficheiros_uploads`: número de ficheiros regulares (não directórios) sob a pasta uploads, recusivo.

## PASS / FAIL

- `PASS` sse cada par `antes==depois`, `ficheiros_uploads` iguais, `origem_intacta==true`, Alembic destino = head.
- `FAIL` → operação aborta com rollback; `resultado` no JSON (se o ficheiro for escrito, só após decisão; preferir escrever o FAIL **e** reverter destino).

## Uso no corte

Runbook MUST exigir dois relatórios PASS (`wfrp` e `wod`) no **ensaio em cópias** antes da janela. Relatório FAIL → MUST NOT publicar o corte.
