# Contract: Rewrite de URLs na leitura

**Feature**: `096-uploads-cota`

## Regra

Em respostas JSON da API (públicas e admin), campos que contenham paths de imagem:

- Se começa com `/uploads/c/{slug}/` → reescrever para `/api/c/{slug}/media/` + resto (`map|portraits|locals` + ficheiro).
- Uploads novos MUST já devolver path de mídia (sem depender do rewrite).

Campos típicos: `retrato_url`, `imagem_url` (local), `url` do upload, `map_url` / `mapa_arquivo` na config.

## Não fazer

- UPDATE em massa nas linhas da BD nesta fase.
- Redirect HTTP de `/uploads/…` (continua 404).

## Testes

Resposta com valor legado `/uploads/c/teste/portraits/x.webp` → cliente recebe `/api/c/teste/media/portraits/x.webp`.
