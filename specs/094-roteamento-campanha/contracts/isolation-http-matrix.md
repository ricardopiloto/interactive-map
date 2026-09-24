# Contract: matriz de isolamento HTTP

**Feature**: `094-roteamento-campanha`  
**Obrigatória** (constituição I + FR-007).

## Setup

1. Criar campanhas A e B (`activa=true`; B pode ser `so_link` num caso extra).
2. Popular A: pelo menos 1 local (e opcionalmente 1 ficheiro em `uploads/` de A).
3. Credenciais Basic Auth de teste (mesmo par de instância para A e B).

## Casos

| # | Pedido | Esperado |
|---|--------|----------|
| 1 | `GET /api/c/{A}/locais` | Contém local de A |
| 2 | `GET /api/c/{B}/locais` | **Não** contém local de A |
| 3 | `GET /api/c/{A}/admin/locais` + Basic Auth | Só A |
| 4 | `GET /api/c/{B}/admin/locais` + Basic Auth | Só B (sem local de A) |
| 5 | `GET /uploads/c/{B}/{ficheiro-só-em-A}` | 404 |
| 6 | `GET /uploads/c/{A}/{ficheiro-só-em-A}` | 200 (ou ficheiro) |
| 7 | `GET /api/c/{inexistente}/config` | 404 + `CAMPANHA_NAO_ENCONTRADA` |
| 8 | Mesmo com slug de campanha `activa=false` | **Idêntico** a 7 |
| 9 | `GET /api/locais` | 404 |
| 10 | `GET /api/c/{so_link}/config` | 200 com sistema dessa Campanha |

Anónimo nos GETs públicos; admin nos GETs admin. Escrita admin sob A MUST NOT criar linhas visíveis em B (pelo menos um POST mínimo ou assert via listagem).
