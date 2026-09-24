# Quickstart: Administrador e convites (129)

## Pré-requisitos

- Backend com specs 093–095 (`control.db`, sessão real) já funcionando.
- Um usuário mestre já ativo (`usuario criar` + aceitar convite).

## 1. Bootstrap do primeiro administrador

```bash
cd backend
python -m app.cli usuario promover-admin --email mestre@exemplo.com
# stdout: OK admin=mestre@exemplo.com
```

## 2. Não-admin é recusado

```bash
# Autenticado como um mestre SEM is_admin
curl -X POST http://localhost:8000/api/admin/convites \
  -H "Content-Type: application/json" \
  -b "cookie-de-sessao=..." \
  -d '{"email": "outro@exemplo.com"}'
# Esperado: 403
```

## 3. Admin convida pela UI

1. Logar com o e-mail promovido no passo 1.
2. Abrir `/admin/convites` (rota só visível no menu se `me().is_admin === true`).
3. Informar um e-mail livre, confirmar.
4. Esperado: link de convite aparece na tela.
5. Abrir o link (aba anônima), definir senha, confirmar que ativa igual a um convite de CLI.

## 4. Rebaixar

```bash
python -m app.cli usuario rebaixar-admin --email mestre@exemplo.com
# Login de novo com esse e-mail: /admin/convites não aparece mais no menu, e POST direto retorna 403
```

## 5. Regressão — criação de campanha continua sem restrição

1. Logado como qualquer mestre (admin ou não), criar uma campanha via `/painel/novo`.
2. Esperado: funciona exatamente como antes desta feature, sem nenhuma checagem de `is_admin`.

## Automatizado

```bash
cd backend && python -m pytest tests/test_admin_convites_route_matrix.py tests/test_cli_promover_admin.py -q
```
