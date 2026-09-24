# Contract: Rotas frontend

**Feature**: 098

## Rotas

| Path | Auth UI | Comportamento |
|------|---------|---------------|
| `/` | público | `HomePage` — lista catálogo; clique → `/c/{slug}` (≤2 cliques) |
| `/painel` | sessão | `PainelPage`; sem sessão → `/login?next=/painel` |
| `/login` | — | sucesso sem `next` → `/painel`; `next` interno seguro mantém-se |
| `/convite/:token`, `/reset/:token` | — | pós-activar sem `next` → `/painel` |
| `/relacoes` | — | redirect `/` |
| `/c/:slug`, `/c/:slug/relacoes` | 094 | inalterado |
| `/conta` | sessão | MAY permanecer (perfil mínimo) ou link para painel; não substitui `/painel` |

## Painel

- Lista «minhas campanhas» (ItemPainel).
- Criar: formulário nome/slug/sistema/visibilidade (default `listada`); sucesso → permanece `/painel`, lista actualizada.
- Por item: abrir mesa, alternar visibilidade, indicador cota (+ aviso ≥90%), exportar (dono).
- Global no painel: importar zip.
- Vazio: CTA criar e/ou importar.

## Home

- Só nome + sistema (+ navegação implícita por slug).
- Link «Entrar» → `/login`.
- Se autenticado: link «Painel» (não troca a lista por minhas).
- Vazio: mensagem pt-BR/en.

## i18n / Nocturne

Copy nova em `comum.json` (pt-BR + en). Estilos alinhados a 079; viewport estreito empilha acções.
