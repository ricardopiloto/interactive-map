# Research: Sistema de RPG system agnostic (aceitar qualquer nome)

Sem `[NEEDS CLARIFICATION]` — causa raiz e direcção confirmadas em [BKLG-029](../../docs/v2/backlog.md#bklg-029-produto--sistema-de-rpg-deveria-ser-system-agnostic-aceitar-qualquer-nome) e na [spec.md](./spec.md).

## Decisão 1 — Remover allowlist; manter mapa de módulos

**Decisão**: Apagar o check `if sistema not in KNOWN_SISTEMAS` em `create_campanha` e o check equivalente em `validate_package_members`. Remover a constante `KNOWN_SISTEMAS` (só usada nesses dois sítios). Manter `DEFAULT_MODULOS_BY_SISTEMA` e `default_modulos(sistema)` exactamente como estão (lookup por chave exacta).

**Rationale**: Spec FR-001/002 pedem aceitar qualquer nome; FR-003/004 pedem preservar módulos especiais só quando o nome corresponde ao mapa. `dict.get(sistema, [])` já faz o certo para nomes livres.

**Alternatives considered**:
- Expandir a allowlist com mais sistemas — não é system-agnostic; manutenção infinita.
- Normalizar para lowercase antes do lookup de módulos — mudaria comportamento actual (`WFRP4e` ≠ `wfrp4e` hoje); spec diz não reabrir essa regra.

## Decisão 2 — Limites de string = Pydantic/SQLModel já existentes

**Decisão**: Não adicionar validação nova de tamanho. `CriarCampanhaRequest.sistema` já tem `min_length=1, max_length=40`; modelo `Campanha.sistema` tem `max_length=40`. Import continua a exigir presença da chave `sistema` no manifesto; valor deve caber no mesmo limite ao persistir (se o import não truncar hoje, falha de DB/validação existente — não alargar nesta spec).

**Rationale**: Assunção da spec — nenhum limite inventado.

**Alternatives considered**: Limite diferente no import — inconsistência criação vs import.

## Decisão 3 — Strip na borda HTTP; sem lowercasing

**Decisão**: Manter `body.sistema.strip()` no router de criação. Não aplicar `.lower()` global. Para import, preservar o valor do manifesto (após qualquer strip já existente no fluxo, se houver).

**Rationale**: Alinha com edge case da spec (espaços nas pontas via strip na criação) e com “correspondência de suporte especial = regra actual” (exact match nas chaves `wfrp4e`/`wod`).

**Alternatives considered**: Canonicalizar todos os sistemas para slug lowercase — scope creep e risco em exports já gravados.

## Decisão 4 — Testes: inverter rejeição; cobrir módulos

**Decisão** (Constitution II):
1. Em `test_campanha_criar_http.py`, o caso `sistema: "desconhecido"` passa a esperar **201/200** (sucesso) e `modulos_ativos` vazio (ou sem fadiga).
2. Manter/assegurar caso `sistema: "wfrp4e"` → módulos incluem `fadiga`.
3. Acrescentar (ou estender) teste de import com manifesto `sistema` livre (ex. `"shadowdark"`) sem `SISTEMA_DESCONHECIDO`.

**Rationale**: Único teste que hoje trava a feature; import não tem assert dedicado à allowlist — precisa de cobertura positiva.

**Alternatives considered**: Só apagar o assert — cobertura insuficiente para SC-002.

## Decisão 5 — Códigos de erro e i18n

**Decisão**: Deixar de **emitir** `SISTEMA_INVALIDO` / `SISTEMA_DESCONHECIDO`. Podem permanecer definidos em `package_schema` / locales para compat documental até limpeza futura; não é obrigatório apagar as chaves i18n nesta feature.

**Rationale**: SC-003 é sobre o fluxo normal do utilizador, não sobre greps de ficheiros de locale.

**Alternatives considered**: Remover chaves i18n já — cosmético; pode ficar para polish se grep mostrar zero usos.
