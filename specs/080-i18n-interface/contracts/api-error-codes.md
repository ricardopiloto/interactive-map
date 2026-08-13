# API Contract: Códigos de erro estruturados

**Feature**: `080-i18n-interface`  
**Scope**: Erros **surfaced na UI** (toast, inline, alert, AdminGate, status de página)

## Response shape

**Content-Type**: `application/json`

**Body** (4xx/5xx):

```json
{
  "detail": {
    "erro": "ARQUIVO_EXCEDE_TAMANHO_MAXIMO",
    "detalhes": {
      "limite_bytes": 20971520
    }
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| `detail.erro` | string | yes |
| `detail.detalhes` | object | no |

Legacy responses where `detail` is a plain string MUST be treated by frontend as unknown → localized generic (`comum:erros.GENERICO`).

## Frontend mapping

| `erro` | Translation key | `detalhes` keys |
|--------|-----------------|-----------------|
| `ADMIN_NAO_CONFIGURADO` | `comum:erros.ADMIN_NAO_CONFIGURADO` | — |
| `AUTENTICACAO_NECESSARIA` | `comum:erros.AUTENTICACAO_NECESSARIA` | — |
| `CREDENCIAIS_INVALIDAS` | `comum:erros.CREDENCIAIS_INVALIDAS` | — |
| `CATEGORIA_UPLOAD_INVALIDA` | `comum:erros.CATEGORIA_UPLOAD_INVALIDA` | `categorias` (string[]) |
| `TIPO_ARQUIVO_NAO_PERMITIDO` | `comum:erros.TIPO_ARQUIVO_NAO_PERMITIDO` | `content_type` |
| `ARQUIVO_EXCEDE_TAMANHO_MAXIMO` | `comum:erros.ARQUIVO_EXCEDE_TAMANHO_MAXIMO` | `limite_bytes` |
| `FADIGA_INVALIDA` | `comum:erros.FADIGA_INVALIDA` | — |
| `FADIGA_FORA_INTERVALO` | `comum:erros.FADIGA_FORA_INTERVALO` | `min`, `max` |
| `MODULO_MECANICA_DESCONHECIDO` | `comum:erros.MODULO_MECANICA_DESCONHECIDO` | `modulo` |
| `PERSONAGEM_NAO_ENCONTRADO` | `comum:erros.PERSONAGEM_NAO_ENCONTRADO` | — |
| `VINCULO_NAO_ENCONTRADO` | `comum:erros.VINCULO_NAO_ENCONTRADO` | — |
| `VINCULO_JA_EXISTE` | `comum:erros.VINCULO_JA_EXISTE` | — |
| `VINCULO_MESMO_PERSONAGEM` | `comum:erros.VINCULO_MESMO_PERSONAGEM` | — |
| `PERSONAGEM_INVALIDO` | `comum:erros.PERSONAGEM_INVALIDO` | — |
| `LOCAL_NAO_ENCONTRADO` | `comum:erros.LOCAL_NAO_ENCONTRADO` | `local_id`? |
| `LOCAL_SEM_ID` | `comum:erros.LOCAL_SEM_ID` | — |
| `LOCAL_SAIDA_PARA_SI` | `comum:erros.LOCAL_SAIDA_PARA_SI` | — |
| `NPCS_NAO_ENCONTRADOS` | `comum:erros.NPCS_NAO_ENCONTRADOS` | `ids` (number[]) |
| `LOCAIS_DESTINO_NAO_ENCONTRADOS` | `comum:erros.LOCAIS_DESTINO_NAO_ENCONTRADOS` | `ids` (number[]) |
| `NPC_NAO_ENCONTRADO` | `comum:erros.NPC_NAO_ENCONTRADO` | — |
| `ARCO_NAO_ENCONTRADO` | `comum:erros.ARCO_NAO_ENCONTRADO` | — |
| `WAYPOINT_NAO_ENCONTRADO` | `comum:erros.WAYPOINT_NAO_ENCONTRADO` | `waypoint_id`? |
| `WAYPOINT_INVALIDO` | `comum:erros.WAYPOINT_INVALIDO` | — |
| `SEGMENTO_NAO_ENCONTRADO` | `comum:erros.SEGMENTO_NAO_ENCONTRADO` | — |
| `SEGMENTO_SELF_LOOP_INVALIDO` | `comum:erros.SEGMENTO_SELF_LOOP_INVALIDO` | — |
| `LOCAL_JA_VINCULADO_WAYPOINT` | `comum:erros.LOCAL_JA_VINCULADO_WAYPOINT` | — |
| `WAYPOINT_JA_VINCULADO_LOCAL` | `comum:erros.WAYPOINT_JA_VINCULADO_LOCAL` | — |
| `ROTA_ORIGEM_DESTINO_IGUAIS` | `comum:erros.ROTA_ORIGEM_DESTINO_IGUAIS` | — |
| `ROTA_ORIGEM_INVALIDA` | `comum:erros.ROTA_ORIGEM_INVALIDA` | — |
| `ROTA_DESTINO_INVALIDO` | `comum:erros.ROTA_DESTINO_INVALIDO` | — |
| `ROTA_CALCULO_FALHOU` | `comum:erros.ROTA_CALCULO_FALHOU` | `motivo`? |
| *(unknown)* | `comum:erros.GENERICO` | — |

## Backend helper

```python
# backend/app/errors.py (conceptual)
raise_api_error("CREDENCIAIS_INVALIDAS", status_code=401)
raise_api_error("ARQUIVO_EXCEDE_TAMANHO_MAXIMO", status_code=413, detalhes={"limite_bytes": n})
```

## Non-goals

- Localizar mensagens Pydantic/FastAPI default não customizadas
- Traduzir erros no servidor
- i18n do hub estático

## Verification

1. UI EN → forçar upload oversized → mensagem EN com limite interpolado, body contém `erro` code.
2. UI PT → mesmo erro → mensagem PT equivalente.
3. Código desconhecido → `GENERICO` EN/PT, sem crash.
