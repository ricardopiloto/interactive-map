# Contract: require_membro

**Feature**: `095-contas-sessao-permissoes`

## Substitui

`verify_admin` / HTTP Basic em `/api/c/{slug}/admin/*` (incl. upload e `/session`).

## Algoritmo

1. Extrair cookie `codex_session` → lookup `Sessao` por hash do token.
2. Sessão inválida/expirada/revogada ou utilizador `activo=false` → **401** `AUTENTICACAO_NECESSARIA`.
3. Resolver campanha pelo `{slug}` (404 opaco 094 se má).
4. Sem linha `Membro` (usuario, campanha) → **403** `NAO_MEMBRO` (ou `PERMISSAO_NEGADA`).
5. Refresh `ultimo_acesso`; yield contexto (usuario, campanha, membro).

## Não aplica

- Rotas públicas `/api/c/{slug}/…` (exceto admin).
- `/api/auth/*`, `/api/health`.
- GET uploads estáticos `/uploads/c/{slug}/…` (permanecem públicos até 096).
