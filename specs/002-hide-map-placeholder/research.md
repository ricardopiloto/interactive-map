# Research: 002-hide-map-placeholder

## 1. Por que a mensagem aparece mesmo com mapa?

**Decision**: Tratar a causa raiz como **visibilidade do placeholder não controlada corretamente** — tipicamente CSS `display: grid` em `.campaign-map__placeholder` sobrescrevendo o atributo HTML `hidden` (que depende de `display: none` do user agent).

**Rationale**: O markup atual inicia o placeholder com `hidden` e só remove no `onError` da `<img>`. Se o autor define `display: grid` na classe, o placeholder pode permanecer **visível** mesmo com `hidden` setado, sobrepondo ou competindo com a imagem carregada — exatamente o sintoma “já temos campaign-map mas a mensagem ainda aparece”.

**Alternatives considered**:
- Só checar existência do arquivo no servidor antes de renderizar — mais complexo, não cobre falha de carga, e exige endpoint novo.
- Remover o placeholder por completo — viola US2 (empty state útil).

## 2. Mecanismo de show/hide

**Decision**: Estado React explícito, p.ex. `mapFailed: boolean` (default `false`):

- `onLoad` → `mapFailed = false` (garante limpar após troca de URL)
- `onError` → `mapFailed = true`
- Placeholder renderizado **somente se** `mapFailed` (ou `className` com `display: none` quando ok)
- Ao mudar `mapUrl`, resetar `mapFailed` para `false` e deixar o ciclo load/error decidir

**Rationale**: Fonte única de verdade; evita depender do atributo `hidden` vs. CSS; cobre FR-004 (mutuamente exclusivo).

**Alternatives considered**:
- Apenas `!important` em `[hidden] { display: none }` — funciona, mas estado React é mais claro e testável.
- `background-image` CSS + classes — pior para acessibilidade/`onError`.

## 3. Escopo de superfícies

**Decision**: Corrigir só `CampaignMap.tsx` / `.css` — MapPage e AdminPage já compartilham o componente.

**Rationale**: FR-003 satisfeito sem duplicar lógica.

## 4. Detecção “campaign-map existe”

**Decision**: Não exigir HEAD/API prévia. “Existe” = URL do mapa carrega com sucesso no `<img>` (`onLoad`). “Não existe” = `onError` (404, tipo inválido, etc.).

**Rationale**: Alinha à assumption da spec (publicado e acessível na app); cobre arquivo ausente e URL quebrada com o mesmo empty state.

**Alternatives considered**:
- `GET /api/admin/...` ou listagem de uploads — fora de escopo e acopla ao admin.
