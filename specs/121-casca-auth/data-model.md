# Data model: Casca visual de autenticação (121)

Nenhuma entidade persistida, migração ou formato de API novo. A feature não modifica os dados nem o estado funcional das páginas. Esta tabela documenta os dados de UI existentes que a casca deve continuar acomodando:

| Página | Dados/estado de UI existente | Origem e uso |
|---|---|---|
| Login | `email`, `password`, `busy`, `error` | Campos de entrada; POST de login; erro local traduzido |
| Convite | `token`, `password`, `busy`, `error` | `token` da rota `/convite/:token`; aceitar convite |
| Reset | `token`, `password`, `busy`, `error` | `token` da rota `/reset/:token`; confirmar reset |
| Conta | `email` | Perfil obtido por `authApi.me()`; ações existentes incluem logout e links |

## Invariantes

- Os valores de token continuam sendo lidos dos parâmetros da URL; a casca não os copia para estado nem os remove.
- `email`, `password`, `autocomplete`, `required` e `minLength` mantêm os tipos e regras atuais.
- A UI não persiste campos nem cria sessão por conta própria; os dados continuam sob autoridade de `authApi`.
- Login continua a usar `next` válido ou `/painel`; convite continua a ir para `/painel`; reset continua a ir para `/login`; Conta mantém a consulta de sessão, logout e redirecionamento atuais.
- `/convite/:token` e `/reset/:token` permanecem rotas separadas e acessíveis por deep-link.
