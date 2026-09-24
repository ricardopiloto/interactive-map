# Quickstart: CTAs da Home respeitam sessão já autenticada (132)

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Uma conta de mestre ativa, pra testar autenticado.

## Cenário A — Autenticado, "Entrar como mestre"

1. Logar, depois navegar de volta pra `/`.
2. Clicar em "Entrar como mestre".
3. Esperado: vai direto pra `/painel`, sem nenhuma tela/modal de login aparecer.

## Cenário B — Autenticado, "Criar meu primeiro codex"

1. Ainda autenticado, rolar até o CTA final e clicar em "Criar meu primeiro codex".
2. Esperado: vai direto pro Painel já no ponto de criação (`#criar`), sem login.

## Cenário C — Não autenticado (regressão)

1. Sem sessão (deslogado), clicar nos dois CTAs.
2. Esperado: comportamento idêntico ao de antes desta feature — abre o login (modal), destino certo preservado após autenticar.

## Cenário D — Clique rápido durante o carregamento

1. Recarregar a Home autenticado e clicar num CTA o mais rápido possível, antes da página "assentar".
2. Esperado: na pior das hipóteses cai no login (nunca trava, nunca dá erro) — não é uma falha, é o comportamento documentado no Edge Case da spec.

## Verificação técnica

```bash
cd frontend && npx tsc --noEmit
```

## Esperado

- Nenhuma mudança visual nos dois CTAs.
- Sem sessão: zero regressão no fluxo de login existente.
