# Data Model: 003-align-prototype-ui

Sem novas entidades narrativas. Delta no singleton do grupo + regras de UI/auth.

## GrupoPosicao (alterado)

| Campo | Tipo | Regras |
|-------|------|--------|
| id | int PK | Sempre `1` (singleton) |
| x | float | `0.0`–`1.0` |
| y | float | `0.0`–`1.0` |
| formato | string | `bandeira` \| `brasao`; default `bandeira` |
| atualizado_em | datetime | Atualizado em PUT |

**Validação**: `formato` fora do enum → 422. Ausência no DB legado → tratar como `bandeira` na leitura.

**Transições**: GM em Modo GM pode alterar `x/y` (clique no mapa) e `formato` (controle na aba Grupo) independentemente.

## Entidades inalteradas

- **Local**, **NPC**, **Arco**, **LocalNPCLink** — campos e relações como em `specs/001-campaign-codex-map/data-model.md`.
- Uploads: caminhos `/uploads/map/campaign-map.*`, `/uploads/locals/…`, `/uploads/portraits/…` inalterados.

## Estado de sessão UI (não persistido no DB)

| Estado | Valores | Notas |
|--------|---------|-------|
| mode | `jogador` \| `gm` | `gm` só após auth OK |
| showAdminGate | bool | Dialog senha |
| adminCreds | Basic token em sessionStorage | Limpo no logout |
| activeTab | `locais` \| `npcs` \| `historia` \| `grupo` | `grupo` só se `gm` |
| placementMode | `none` \| `add-pin` \| `reposition` \| `move-group` | Banners do protótipo |
| selectedLocalId | id \| null | Abre PinModal |
| mobilePanelOpen | bool | Overlay |

## Auth config (env)

| Variável | Uso |
|----------|-----|
| ADMIN_USER | Usuário Basic Auth (não exibir na UI se gate for só senha) |
| ADMIN_PASSWORD | Senha; nunca na UI |

Sem ambos configurados → escritas admin indisponíveis (fail closed).
