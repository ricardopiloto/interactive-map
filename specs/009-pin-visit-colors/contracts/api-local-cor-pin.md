# API Contract: `cor_pin` em Local

## LocalRead (público e admin)

```json
{
  "id": 1,
  "nome": "…",
  "descricao": "…",
  "x": 0.5,
  "y": 0.5,
  "imagem_url": null,
  "data_sessao": null,
  "arco_id": null,
  "npc_ids": [],
  "cor_pin": "#c4b5fd"
}
```

- `cor_pin`: string `#RRGGBB`, sempre presente após deploy/migração.

## POST `/api/admin/locais` (GM)

Body inclui `cor_pin` obrigatório. Sem campo ou hex inválido → **422**.

## PUT `/api/admin/locais/{id}` (GM)

Pode enviar `cor_pin`. Hex inválido → **422**. Omitir em partial update não apaga a cor existente; o cliente GM deve enviar a cor atual ao salvar o formulário completo.

## Auth

- Escrita: Basic Auth admin (Modo GM) — inalterado.
- Leitura pública: inclui `cor_pin`; sem endpoint de escrita pública.
