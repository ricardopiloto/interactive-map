# API Contract: `saida_ids` em Local

## LocalRead (público e admin)

```json
{
  "id": 1,
  "nome": "Altdorf",
  "descricao": "…",
  "x": 0.42,
  "y": 0.55,
  "imagem_url": null,
  "data_sessao": null,
  "arco_id": null,
  "npc_ids": [],
  "cor_pin": "#e5484d",
  "saida_ids": [3, 7]
}
```

- `saida_ids`: array de inteiros (IDs de outros locais). Sempre presente (pode ser `[]`).
- Ordem: estável (ex. ordenar por id crescente na serialização) — cliente não depende da ordem para desenhar.

## POST `/api/admin/locais` (GM)

Body pode incluir `saida_ids` (default `[]`).

| Condição | Resposta |
|----------|----------|
| Id inexistente em `saida_ids` | **422** ou **400** com detalhe claro |
| Id duplicado no array | Aceitar após dedupe **ou** 422 — preferir **dedupe silencioso** |
| Id igual ao local criado | N/A no create (sem id ainda); se cliente enviar id “placeholder”, ignorar/rejeitar |

## PUT `/api/admin/locais/{id}` (GM)

| Condição | Resposta |
|----------|----------|
| `saida_ids` omitido | Vínculos de saída **inalterados** |
| `saida_ids: []` | Remove todas as saídas da origem |
| `saida_ids` contém o próprio `{id}` | **422** |
| Id destino inexistente | **422** / **400** |

Cliente do formulário GM deve enviar a lista completa de destinos marcados a cada save (como `npc_ids`).

## DELETE `/api/admin/locais/{id}` (GM)

Remove o local e **todas** as conexões em que ele é origem ou destino. Resposta **204** inalterada.

## Auth

- Escrita: Basic Auth admin — inalterado.
- Leitura pública: inclui `saida_ids`; sem endpoint público de escrita de conexões.
- Sem rotas novas `/conexoes` nesta feature.
