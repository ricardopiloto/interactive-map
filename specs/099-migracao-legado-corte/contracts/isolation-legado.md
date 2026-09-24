# Contract: Isolamento após import legado

**Feature**: 099  
**Extende**: matrizes 094 / 096 (rotas `/api/c/{slug}/…` e mídia). **Sem rota HTTP nova.**

## Setup

Duas fixtures importadas no mesmo `control.db`: slug `wfrp` (sistema wfrp4e) e slug `wod` (sistema wod), N/M distintos.

## Matriz

| Actor | Pedido | Esperado |
|-------|--------|----------|
| anónimo | `GET /api/c/wfrp/locais` | só locais WFRP |
| anónimo | `GET /api/c/wod/locais` | só locais WoD |
| anónimo | `GET /api/c/wfrp/media/portraits/{ficheiro-wod}` | 404 opaco |
| anónimo | `GET /api/c/wod/media/map/{ficheiro-wfrp}` | 404 opaco |
| dono WFRP | listagens `/api/c/wod/…` | 403 ou 404 conforme 095 (não membro) — **sem** corpo de WFRP |
| dono WoD | simétrico | sem dados WFRP |

Disco: zero ficheiros da fixture WFRP sob o sítio UUID da WoD (e inverso).

Catálogo 098: ambas `listada` aparecem; cada card aponta ao slug correcto.

## Origem

Após import, hashes de `mapa.db` + árvore uploads das **origens de teste** iguais aos pré-import. N/A para `/opt` em CI.
