# Contract: `POST /api/admin/convites`

**Feature**: 129

## Guarda

`require_admin` — sessão válida (cookie) **e** `Usuario.is_admin == True`. Anónimo → 401. Sessão válida sem `is_admin` → 403. Nenhum `slug` envolvido (rota de escopo de aplicação, não de campanha).

## Request

```json
{
  "email": "novo-mestre@exemplo.com"
}
```

## Success response (200/201)

```json
{
  "email": "novo-mestre@exemplo.com",
  "link": "https://.../convite/<token>"
}
```

Internamente chama `create_usuario_with_invite(session, email)` — mesma função que a CLI (`usuario criar`) já usa. Nenhuma duplicação de lógica de criação de usuário-pendente-mais-convite.

## Erros

| Código | HTTP | Quando |
|---|---|---|
| `AUTENTICACAO_NECESSARIA` | 401 | Sem sessão |
| `ACESSO_NEGADO` (ou equivalente já usado pra "sem permissão" nas rotas admin) | 403 | Sessão válida, `is_admin = False` |
| `EMAIL_INVALIDO` | 400 | Mesma validação que `create_usuario_with_invite` já faz |
| `EMAIL_DUPLICADO` | 409/400 (mesmo código HTTP que a CLI já mapeia) | E-mail já cadastrado |

## Efeitos colaterais

- Cria `Usuario` pendente (`activo=False`) + `Convite` tipo `activar` — idêntico ao que a CLI já faz.
- O link retornado usa `invite_url(token, "activar")`, mesma função já usada pela CLI — formato do link não muda.

## Rota nova entra na matriz de teste admin (spec 095)

Casos obrigatórios: anónimo → 401; mestre autenticado sem `is_admin` → 403; administrador autenticado → 200/201 com efeito real.
