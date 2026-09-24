# Data model: Assistente de criação (120)

Nenhuma entidade de persistência nova. Estado UI até ao POST:

## WizardDraft

| Campo | Tipo | Notas |
|-------|------|--------|
| `nome` | string | Obrigatório para avançar passo 0 |
| `slug` | string | Auto via slugify(nome) até `slugTouched` |
| `slugTouched` | boolean | |
| `sistema` | string | Obrigatório passo 1; datalist suggestedSystems |
| `genero` | `GenreId` | Default `fantasia`; drives `data-genre` |
| `visibilidade` | `'listada' \| 'so_link'` | Default `listada` |
| `step` | 0..3 | |
| `busy` | boolean | Durante POST |
| `error` | string \| null | i18n / API |
| `created` | `{ slug, nome } \| null` | Sucesso |

## Transitions

```text
[unauth] --open /painel/novo--> [login?next=/painel/novo]
[auth] --> [step0] --continuar--> [step1] --> [step2] --> [step3]
[step0] --cancelar--> /painel
[stepN>0] --voltar--> [stepN-1]
[step3] --criar POST--> [success] | [step3+error]
[success] --abrir--> /c/:slug
[success] --painel--> /painel
```

## Validation

- Client: comprimentos mínimos nome/slug/sistema; género sempre definido.
- Server: reutilizar erros do POST actual (slug taken, validation).
- MUST NOT persist draft beyond the page session (refresh perde rascunho — OK).

## Listing effects (post-create)

| Visibilidade | `/painel` (minhas) | `/explorar` (catalogo) |
|--------------|--------------------|-------------------------|
| `listada` | aparece | aparece (regras actuais) |
| `so_link` | aparece | não listada publicamente |
