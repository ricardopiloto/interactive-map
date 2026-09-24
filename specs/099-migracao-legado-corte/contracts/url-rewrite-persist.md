# Contract: Reescrita persistida de URLs (legado)

**Feature**: 099  
**Âmbito**: só `campanha.db` do **destino** após a cópia.

## Campos

- `npc.retrato_url`
- `local.imagem_url`

## Transformação

Destino final: `/api/c/{slug}/media/{map|portraits|locals}/{arquivo}` onde `{slug}` é o slug **deste** import.

| Entrada | Acção |
|---------|--------|
| `/uploads/c/{x}/(map\|portraits\|locals)/{f}` | reescrever slug + prefixo mídia |
| `/uploads/(map\|portraits\|locals)/{f}` | prefixo mídia + slug novo |
| `/api/c/{x}/media/…` | substituir `{x}` pelo slug novo |
| vazio / NULL | intacto |
| path que não mapeia a uma categoria conhecida | FAIL `URL_MIDIA_DESCONHECIDA` + rollback |

Idempotente: correr duas vezes no destino não corrompe.

Origem: zero UPDATEs. O rewrite-on-read 096 permanece como rede de segurança nas respostas HTTP.
