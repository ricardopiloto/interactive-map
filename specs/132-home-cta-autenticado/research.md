# Research: CTAs da Home respeitam sessão já autenticada

Sem `[NEEDS CLARIFICATION]` — causa raiz e correção já claras a partir do `BKLG-021`. Um ponto vale registrar, achado ao planejar.

## Decisão 1 — `HomePage` chama `authApi.me()` direto, sem inventar estado compartilhado

**Decisão**: `HomePage.tsx` ganha seu próprio `useEffect` chamando `authApi.me()`, exatamente como `UserMenu.tsx`/`NovoCodexPage.tsx` já fazem — sem contexto/store compartilhado novo.

**Achado ao reconferir o código**: `HomePage` já renderiza dentro de `<SiteChrome>`, que por sua vez renderiza `<UserMenu />` no cabeçalho — e `UserMenu` **já chama `authApi.me()` de forma independente**. Isto é, ao aplicar esta feature, a Home passa a disparar **duas** chamadas a `/api/auth/me` na mesma carga de página (uma do `UserMenu`, outra da própria `Home`), sem cache compartilhado entre elas.

**Racional para não resolver isso agora**: é o mesmo padrão já em uso em toda a aplicação — nenhuma página hoje compartilha o resultado de `me()` entre si (`NovoCodexPage`, `UserMenu`, `AdminConvitesPage` etc. cada uma chama a própria vez). `/api/auth/me` é uma leitura barata, idempotente, via cookie de sessão — duplicar essa chamada numa página não é uma regressão de comportamento, só repete um padrão já aceito. Introduzir um cache/contexto compartilhado de sessão é uma mudança de arquitetura maior que o problema desta spec pede (violaria a Simplicidade da constituição, adicionando uma peça nova pra um custo pequeno).

**Alternativas consideradas**: subir `me()` pra `SiteChrome` e passar como prop/contexto pras páginas filhas — resolveria a duplicação de verdade, mas mexe num componente de layout usado em toda a aplicação, fora do escopo pontual desta correção. Fica registrado como possível item futuro de otimização, não faz parte desta feature.

## Decisão 2 — Estado assume "não autenticado" até `me()` responder, sem estado de "carregando"

**Decisão**: `const [isAuthenticated, setIsAuthenticated] = useState(false)`, virando `true` só no sucesso de `me()`.

**Racional**: já é a premissa registrada na spec (Assumptions) — evita um terceiro estado ("carregando") que faria os CTAs ficarem desabilitados ou mostrarem um spinner por uma fração de segundo, pior experiência que simplesmente assumir "não autenticado" (o pior caso é continuar caindo no login, comportamento já existente hoje, nunca pior que isso).
