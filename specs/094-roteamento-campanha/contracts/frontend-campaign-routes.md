# Contract: rotas frontend por campanha

**Feature**: `094-roteamento-campanha`

## Rotas

| Path | UI |
|------|-----|
| `/c/:slug` | Mapa da campanha |
| `/c/:slug/relacoes` | Rede de Relações |
| `/` | Ecrã «não encontrado» / peça link com slug (sem mapa) |
| `/relacoes` | Idem |
| slug que a API rejeita (404 config/conteúdo) | Ecrã campanha indisponível (i18n) |

## API client

- Toda chamada de conteúdo: `/api/c/${slug}/…` (admin: `/api/c/${slug}/admin/…`).
- Slug vem de `useParams` (ou prop do layout da campanha), não de env Vite como fonte da mesa.
- `VITE_API_BASE` = origem do host apenas.

## Config cache

- Estrutura keyada por `slug`.
- Visitar A depois B MUST NOT reutilizar config de A para B.
- `markHasMapImage` / clear MUST afectar só o slug corrente.

## Mídia

- URLs de imagem/mapa usam `/uploads/c/${slug}/…` (ou o `url` devolvido pelo admin upload).
- Não depender de um único `VITE_MAP_URL` global para multi-mesa.

## i18n

Novas chaves pt-BR + en para: campanha não encontrada; peça um link com identificador de campanha (copy exacta no implement).
