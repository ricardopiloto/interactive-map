# Contract: CampaignCard (119)

**Feature**: `119-home-explorar-painel`  
**Visual SoT**: `frontend-next/src/components/common/CampaignCard.tsx`

## Component API

```ts
type CampaignCardProps = {
  slug: string
  nome: string
  sistema: string
  genero: string // resolve via resolveGenreId
  capa_url?: string | null
  linkTo?: string
  compact?: boolean
  footer?: React.ReactNode
  className?: string
}
```

## Variants

| Surface | `compact` | `linkTo` | `footer` |
|---------|-----------|----------|----------|
| Home featured | true | `/c/:slug` | optional / none |
| Explorar | false | `/c/:slug` | optional (API-backed only) |
| Painel | false | omit | required: visibility, quota, actions |

## Rules

- MUST be the **only** campaign card markup used on `/`, `/explorar`, `/painel` after this feature.
- MUST NOT nest interactive links when `footer` already contains the primary «Abrir» control (omit `linkTo`).
- Cover: image if `capa_url`; else genre-tinted placeholder (no fake player count).
- MUST NOT render fields absent from API.

## MUST NOT

- Duplicate Home/Painel-specific card components as the default
- Call new endpoints to fill prototype-only metadata
