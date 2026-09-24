# Contract: Upload e cota

**Feature**: `096-uploads-cota`

## POST `/api/c/{slug}/admin/uploads`

Requisitos: membership (095); CSRF Origin; regras de tipo/tamanho já existentes.

### Body (multipart)

- `category`: `map` | `portraits` | `locals`
- `file`: imagem

### Sucesso (200)

```json
{
  "url": "/api/c/{slug}/media/{category}/{filename}",
  "aviso_cota": false,
  "bytes_usados": 12345,
  "cota_bytes": 10737418240
}
```

- `url` MUST ser path de mídia (nunca `/uploads/…`).
- Se após o upload `bytes_usados * 100 / cota_bytes ≥ 90` e o ficheiro foi aceite: `aviso_cota: true` (UI mostra copy; jogador não vê este endpoint).
- Mapa: grava nome versionado; actualiza `Campanha.mapa_arquivo`; remove mapa anterior; ajusta `bytes_usados` pelo delta líquido.

### Recusa de cota (413 ou 422 — escolher um e fixar na implementação; preferência **413**)

```json
{
  "detail": {
    "erro": "COTA_EXCEDIDA",
    "detalhes": {
      "bytes_usados": 0,
      "cota_bytes": 0,
      "tamanho": 0
    }
  }
}
```

- Ficheiro **não** gravado; `bytes_usados` inalterado.
- Uso resultante: ver [data-model.md](../data-model.md) (`CotaOperacao`).
- Substituição de mapa com resultante ≤ teto → sucesso mesmo se uso actual = 100%.

### Outros erros (inalterados)

`CATEGORIA_UPLOAD_INVALIDA`, `TIPO_ARQUIVO_NAO_PERMITIDO`, `ARQUIVO_EXCEDE_TAMANHO_MAXIMO`, `AUTENTICACAO_NECESSARIA`, `NAO_MEMBRO`.
