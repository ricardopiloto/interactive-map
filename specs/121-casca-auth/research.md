# Research: Casca visual de autenticação — 121

## 1. Onde aplicar a casca partilhada

**Decision**: Evoluir os estilos já partilhados `.auth-page` e `.auth-card` em `frontend/src/styles/global.css`. Login, convite e reset usam essas classes em `<form>`; Conta usa-as num `<div>`.

**Rationale**: As quatro páginas já partilham o mesmo wrapper e cartão. Uma única alteração CSS mantém as superfícies coerentes sem introduzir um novo componente ou reestruturar fluxos existentes.

**Alternatives considered**: Criar quatro folhas de estilo por página ou um componente wrapper novo. Ambas repetem estrutura/estilos sem benefício funcional nesta feature.

## 2. Referência visual e tokens

**Decision**: Usar o protótipo `frontend-next/src/pages/LoginPage.tsx` e `LoginPage.css` como referência de proporções e hierarquia: fundo em gradiente, cartão centrado com largura máxima aproximada de 380px, campos pílula e botão primário largo. Derivar cores da paleta por tokens já usados em `frontend/src/styles/tokens.css` (incluindo acento, fundo e `--radius-full`); manter margem e scroll seguros em viewport estreita.

**Rationale**: O produto já expõe tokens de género/tema e raios. `--map-gradient` é definido no tema do protótipo, mas não está disponível nos tokens de produção, então a casca deve compor um gradiente usando tokens de produção em vez de depender de uma variável ausente.

**Alternatives considered**: Copiar literalmente `var(--map-gradient)` do protótipo, que ficaria indefinido no frontend de produção; adicionar uma paleta ou tema novo, fora do escopo.

## 3. Preservação dos fluxos

**Decision**: Não alterar handlers, estado, campos, API, parâmetros de rota, erros, autocomplete nem navegação em `AuthPages.tsx`. Os caminhos atuais chamam `authApi.login`, `aceitarConvite`, `confirmarReset`, `me` e `logout`; apenas os seletores CSS compartilhados mudam.

**Rationale**: FR-002, FR-003 e FR-006 exigem que tokens e contratos permaneçam iguais. Os redirects existentes cobrem `next`/`/painel` e login pós-reset.

**Alternatives considered**: Fundir convite/reset como estado de alternância no Login. Rejeitada: quebra deep-links com token e contradiz explicitamente o requisito.

## 4. Campos e botões

**Decision**: Estilizar inputs existentes dentro de `.auth-card` com `--radius-full` e tokens de campo/foco; aplicar largura total aos botões primários do cartão por seletor compartilhado ou prop `block` do kit `Button`, sem substituir tipos, autocomplete ou required/minLength.

**Rationale**: O kit já oferece botões primários e classe `ui-btn--block`; a tela já usa inputs nativos com atributos semânticos existentes.

**Alternatives considered**: Substituir campos por componentes ou criar um segundo kit de formulários. Desnecessário para uma alteração só visual e aumenta risco de diferenças no comportamento de acessibilidade/gestores de senhas.

## 5. Copy e link auxiliar

**Decision**: Reutilizar as chaves existentes em `comum.json`. Um link opcional para jogadores/explorar só deve entrar se o destino público estiver confirmado e houver copy em pt-BR e en; não é necessário para cumprir a casca visual.

**Rationale**: Evita escopo não obrigatório e mantém o princípio de i18n caso a interface ganhe texto.

**Alternatives considered**: Copiar o toggle convite do protótipo. Rejeitada: protótipo é ilustrativo e não representa o fluxo de tokens real.
