# Contract: API export / import

**Feature**: 097  
**Auth**: cookie sessão (095) + CSRF em mutações

## Export

```http
GET /api/c/{slug}/admin/export
Cookie: session=…
```

| Caso | Status | Notas |
|------|--------|-------|
| Anónimo | 401 | |
| Autenticado sem membership | 403 | |
| Membro não-dono | 403 | |
| Dono | 200 | `Content-Type: application/zip`; `Content-Disposition: attachment; filename="{slug}-export.zip"` |

Corpo: zip conforme [package-zip.md](./package-zip.md).

## Import

```http
POST /api/campanhas/import
Cookie: session=…
X-CSRF-Token: …
Content-Type: multipart/form-data
```

Campos:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `file` | sim | Ficheiro `.zip` |
| `slug` | não | Override; se omitido, tenta `slug_origem` |

| Caso | Status | Body (exemplo) |
|------|--------|----------------|
| Anónimo | 401 | |
| CSRF em falta | 403 | |
| Zip inválido / entradas / schema / FKs / imagens | 400 | `{ "detail": { "code": "…" } }` |
| Slug ocupado e sem override válido | 409 | `SLUG_OCUPADO` |
| Slug inválido | 400 | `SLUG_INVALIDO` |
| Sucesso | 201 | `{ "slug", "id", "nome", "sistema" }` |

Importador torna-se **dono**. Campanha nova; zero efeito em campanhas existentes.

## Fora de escopo

UI de download/upload (098). Endpoints públicos de listagem inalterados.
