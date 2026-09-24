# Contract: `campaignApi.listWaypoints` (uso em `MapPage`)

**Feature**: 131

## Correção ao verificar o código de novo

Uma checagem anterior (registrada no `BKLG-019`) assumiu que `campaignApi.listWaypoints` já aceitava um `slug` explícito, porque a função de mais baixo nível `campaignApiPrefix(slug?: string)` aceita. **Isso não se propaga hoje** — o helper interno de `campaign.ts` descarta essa possibilidade:

```ts
// frontend/src/api/campaign.ts (estado atual)
function p(path: string): string {
  return `${campaignApiPrefix()}${path}`   // sempre sem slug — sempre via requireCampaignSlug()
}

listWaypoints: (linkedOnly = false) =>
  api.get<Waypoint[]>(`${p('/waypoints')}${linkedOnly ? '?linked_only=true' : ''}`),
```

Ou seja: **todo** método de `campaignApi` (não só `listWaypoints`) depende do estado de módulo hoje — nenhum aceita slug explícito ainda. A correção precisa de três passos pequenos, não um.

## Mudança desta feature

**1. `p()` ganha um segundo parâmetro opcional**, repassado pra `campaignApiPrefix`:

```ts
function p(path: string, slug?: string): string {
  return `${campaignApiPrefix(slug)}${path}`
}
```

**2. `listWaypoints` ganha um segundo parâmetro opcional e repassa pra `p()`**:

```ts
listWaypoints: (linkedOnly = false, slug?: string) =>
  api.get<Waypoint[]>(`${p('/waypoints', slug)}${linkedOnly ? '?linked_only=true' : ''}`),
```

**3. `MapPage.tsx` passa o `slug` da rota** (já obtido via `useParams<{ slug: string }>()` no topo do componente):

```ts
// antes
void campaignApi.listWaypoints(false)
// depois
void campaignApi.listWaypoints(false, slug)
```

## Por que isso é suficiente

- `slug` da rota está disponível de forma síncrona na primeira renderização de `MapPage` — não depende de nenhum efeito de outro componente ter rodado antes.
- Quando `slug` não é passado (todo o resto do código que já chama `listWaypoints` sem esse argumento), o comportamento continua idêntico ao de hoje — `p()`/`campaignApiPrefix()` caem no mesmo caminho de sempre (estado de módulo). Mudança aditiva, não quebra nenhum call site existente.
- Nenhuma mudança de endpoint, nenhuma mudança de resposta da API.

## Não coberto por este contrato

Os outros métodos de `campaignApi` (`listLocais`, `listNpcs`, etc.) continuam dependendo só do estado de módulo — não fazem parte do sintoma reportado em `BKLG-019` (o stack trace aponta especificamente pra `listWaypoints`) e ficam fora do escopo desta correção pontual (ver Assumptions em `spec.md`). Se o mesmo sintoma aparecer em outro call site no futuro, o mesmo padrão (`slug?` opcional repassado) pode ser aplicado ponto a ponto, sem precisar de desenho novo.
