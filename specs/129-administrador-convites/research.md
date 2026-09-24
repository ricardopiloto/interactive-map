# Research: Administrador da aplicação e convites de mestres

Sem `[NEEDS CLARIFICATION]` — o TR ([`docs/v2/tr-admin-convites.md`](../../docs/v2/tr-admin-convites.md)) já resolveu as decisões de arquitetura antes desta spec existir. Este documento consolida os pontos que precisaram de confirmação adicional ao planejar (releitura do código atual).

## Decisão 1 — `require_admin` é uma guarda nova, irmã de `require_dono`, não uma extensão de `require_membro`

**Decisão**: `require_admin(usuario: Usuario = Depends(require_session_user)) -> Usuario`, checando `usuario.is_admin`, sem parâmetro de `slug`.

**Racional**: confirmado em [`backend/app/deps/auth.py`](../../backend/app/deps/auth.py) — `require_dono` é literalmente `require_membro` mais uma checagem de `papel`, porque dono é um conceito *por campanha*. Administrador não é por campanha — é um atributo direto do `Usuario`, então a guarda certa parte de `require_session_user` (sessão, sem `slug`), não de `require_membro`.

**Alternativas consideradas**: reaproveitar `require_membro` de alguma campanha "especial" pra representar admin — rejeitado, mistura dois conceitos que a spec deixa explicitamente separados (administrador de aplicação ≠ dono de campanha).

## Decisão 2 — Router novo, fora do pacote `admin/` existente

**Decisão**: `backend/app/routers/administrador.py`, prefixo `/api/admin`, montado direto em `main.py`.

**Racional**: confirmado em [`backend/app/routers/admin/__init__.py`](../../backend/app/routers/admin/__init__.py) — o pacote `admin/` inteiro é montado com prefixo `/api/c/{slug}/admin` e `dependencies=[Depends(require_membro)]`, ou seja, é exclusivamente por campanha (arcos, locais, NPCs, etc. de uma campanha específica). Encaixar a rota de convite ali exigiria um `slug`, que não faz sentido pra uma ação de escopo de aplicação inteira. Um router novo, independente, é mais simples que forçar a rota existente a aceitar um `slug` que ela não usa.

## Decisão 3 — `me()` precisa devolver `is_admin`

**Decisão**: `GET /api/auth/me` passa a retornar `{email, id, is_admin}` em vez de só `{email, id}`.

**Racional**: confirmado em [`backend/app/routers/auth.py`](../../backend/app/routers/auth.py) — hoje `me()` não expõe papel nenhum. O frontend precisa saber se o usuário é admin pra decidir se mostra o item de menu/rota (a segurança real continua no backend, via `require_admin`; isso é só pra não mostrar uma opção que vai ser recusada).

**Alternativas consideradas**: endpoint separado (`GET /api/admin/eu-sou-admin`) só pra essa checagem — rejeitado, é informação barata de incluir na resposta que o frontend já busca sempre (`me()` já é chamado no bootstrap da sessão).

## Decisão 4 — Próxima revisão Alembic

**Decisão**: `006_usuario_is_admin.py`, adicionando `is_admin BOOLEAN NOT NULL DEFAULT 0` à tabela `usuario`.

**Racional**: confirmado em `backend/alembic_control/versions/` — a última revisão é `005_genero.py`. Segue a numeração sequencial já em uso.
