# Contract: resolução de sessão por slug

API interna usada por HTTP (`CAMPAIGN_SLUG`), CLI/testes (slug explícito) e, em 094, pela URL.

## Resolve

Entrada: `slug: str`.

1. Lookup em `control.db` por slug.
2. Se não existe → erro `CAMPANHA_NAO_ENCONTRADA`.
3. Se `activa=false` → erro `CAMPANHA_INACTIVA`.
4. Abrir / obter engine em `{DATA_DIR}/{caminho}/campanha.db` (cache por UUID).
5. Ensure schema: legado → ponte + stamp; senão upgrade até head.
6. Devolver `Session` desse engine.

HTTP: se `CAMPAIGN_SLUG` vazio → `CAMPAIGN_SLUG_AUSENTE` (não resolve «primeira» campanha).

## Isolamento (teste obrigatório)

Dadas campanhas A e B:

- Escrever local (ou grupo) só em A → listagem ao resolver B **não** o contém.
- Grupo id=1 com coords distintas em A e B → cada resolve devolve o seu.
- Resolve A → B → A no mesmo processo: sem mistura (cache não cruza UUID).

## Uploads / config

Com sessão resolvida: `uploads/` = sítio da campanha; `GET /api/config` reflecte `sistema` / `modulos_ativos` / mapa desse registo + pasta.
