# Contract: confirm/alert migration

| Call site | Hoje | Depois |
|-----------|------|--------|
| RelacoesPage ×2 | confirm | ConfirmDialog |
| NpcAdminList, LocalAdminList, ArcoAdminList | confirm | ConfirmDialog |
| RouteDigitizerView ×2 | confirm | ConfirmDialog |
| ImageUploadField, ImageSlot, CampaignMap | alert | toast.error |

Gate: `rg 'window\.(confirm|alert)' frontend/src` → empty.
