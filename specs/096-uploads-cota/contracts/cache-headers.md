# Contract: Cache-Control de mídia

**Feature**: `096-uploads-cota`

| Categoria | Cache-Control |
|-----------|----------------|
| `map` | `public, max-age=31536000, immutable` |
| `locals` | `public, max-age=31536000, immutable` |
| `portraits` | `private, no-store` |

Aplicar em **todas** as respostas 200 de `GET …/media/…`, incluindo retrato servido a anónimo por visibilidade.

Objectivo: após ocultar personagem, o pedido anónimo seguinte não reutiliza cópia HTTP guardada.
