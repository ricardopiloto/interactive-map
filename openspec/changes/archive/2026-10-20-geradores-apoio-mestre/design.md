# Design

## Context

Ver `proposal.md` — Why. `Campanha.sistema` (`backend/app/models/campanha.py`) já existe e hoje só aceita `wfrp4e`/`wod` na prática (`KNOWN_SISTEMAS`, `backend/app/services/campanha_admin.py:50`), mas o BKLG-029 (já especificado em `specs/140-sistema-agnostico/spec.md`) propõe remover essa validação e aceitar qualquer string. Rotas administrativas (GM-only) já são agrupadas sob `backend/app/routers/admin/__init__.py`, com `APIRouter(prefix="/api/c/{slug}/admin", dependencies=[Depends(require_membro)])` — qualquer rota incluída ali herda a exigência de mestre autenticado, sem precisar repetir a checagem. O frontend-v2 já expõe dois booleanos distintos em `frontend-v2/src/auth/EditModeContext.tsx`: `canEdit` (permissão real de ser mestre da campanha, true sempre que a pessoa tem acesso, independente de qualquer toggle) e `enabled` (o estado do toggle visual "Modo GM" que o próprio mestre liga/desliga, guardado em `sessionStorage`) — são conceitos diferentes, não o mesmo valor com dois nomes.

## Goals / Non-Goals

**Goals:**
- Conteúdo por ambientação sem acoplar a feature a uma lista fechada de sistemas — precisa sobreviver ao BKLG-029 sem quebrar.
- Zero schema novo, zero migração — tabelas vivem no código do backend.
- Reaproveitar o gate de autorização já existente (`require_membro` no grupo de rotas admin) em vez de reimplementar checagem de permissão.

**Non-Goals:**
- Não torna as tabelas editáveis por campanha (ver BKLG-047, follow-up futuro).
- Não introduz um conceito formal de "ambientação" distinto de `Campanha.sistema` — reaproveita o campo existente.

## Decisions

### Conteúdo indexado por `Campanha.sistema`, com fallback explícito pra qualquer valor não mapeado
Alternativa considerada: exigir que toda campanha tenha `sistema` em `{"wfrp4e", "wod"}` pra usar os geradores. Descartada porque o BKLG-029 está prestes a abrir `sistema` pra qualquer string — amarrar os geradores à allowlist atual criaria uma regressão no dia em que essa validação for removida (campanha com `sistema="cyberpunk-red"`, por exemplo, quebraria ou ficaria sem gerador). Decisão: um dicionário `{sistema: conteudo}` no backend, com uma chave `_fallback`/genérica sempre presente, e a lógica de sorteio consulta `conteudo.get(campanha.sistema, conteudo["_fallback"])`. Isso é compatível com o estado atual (dois sistemas) e com o estado pós-BKLG-029 (qualquer sistema), sem exigir mudança nenhuma no código dos geradores quando a allowlist cair.

### Rota nova sob o grupo `admin` já existente, não um novo mecanismo de autorização
A rota dos geradores entra em `backend/app/routers/admin/` (ex. `geradores.py`), registrada em `admin/__init__.py` junto das demais — herda `require_membro` automaticamente. Alternativa de expor os geradores numa rota pública com verificação própria foi descartada: não há motivo pra um jogador acionar os geradores, e o padrão de agrupamento já resolve a restrição de acesso sem código extra.

### Item de navegação condicional em `Shell.tsx`, não uma rota sempre visível
Hoje `lenses` em `frontend-v2/src/components/codex/Shell.tsx` é uma lista fixa de abas sempre visíveis (Mapa, Relações, Rota, Sessões, Cronologia) — nenhuma delas é condicional. A tela de geradores é a primeira a precisar de visibilidade condicional nesse nível de navegação; a decisão é renderizar um item extra só quando **`canEdit` for verdadeiro — nunca `enabled`**. O gate é a permissão de ser mestre (`canEdit`), não o toggle visual de "Modo GM" (`enabled`): usar `enabled` faria o item desaparecer do menu toda vez que o mestre desligasse o toggle de edição, o que não é a intenção — o mestre deve conseguir acessar os geradores independente do toggle estar ligado ou desligado.

### Atalho «Enviar para preparo» acrescenta no cliente, sobre um `PATCH` parcial já existente
O `PATCH /admin/sessoes/{id}` usa `model_dump(exclude_unset=True)`, então enviar só `notas_preparo` não toca nos demais campos nem nos vínculos. O frontend lê a sessão fresca (`GET /admin/sessoes/{id}`), acrescenta `- {rótulo}: {resultado}` ao fim e envia o `PATCH`. Alternativa considerada: endpoint dedicado de append no servidor. Descartada porque o ganho (atomicidade) não paga um endpoint e um contrato novos para um fluxo de um único mestre por vez. Destinos oferecidos: apenas sessões com `visivel_para_todos=false`, pelo mesmo critério da change `sessao-notas-preparo` de que sessão oculta equivale a sessão em preparo; sem nenhuma, o atalho não escreve e orienta o mestre a usar «Preparar próxima sessão».

## Risks / Trade-offs

- **[Risco] Duas abas do mestre acrescentando ao mesmo tempo podem perder uma das notas** (leitura e escrita não são atômicas) → Aceito: o cenário é de um único mestre e a janela entre o `GET` e o `PATCH` é de milissegundos; o texto enviado nunca sobrescreve, só pode ser sobrescrito por um `PATCH` concorrente.
- **[Risco] `notas_preparo` tem teto de 50000 caracteres** → o `PATCH` devolve erro de validação e o atalho mostra mensagem sem perder o resultado sorteado na tela.

- **[Risco] Conteúdo insuficiente nas tabelas gera repetição perceptível em sessão curta** → Mitigação: exigir um mínimo de itens por tabela/ambientação na tarefa de redação de conteúdo (ver `tasks.md`), e sortear sem repetir o último resultado imediato (evita "o mesmo nome duas vezes seguidas").
- **[Risco] Fallback genérico usado sem o mestre perceber que não é específico da ambientação** → Mitigação: fora de escopo bloquear por isso (geradores sempre retornam algo), mas vale um rótulo discreto "conteúdo genérico" quando o fallback for usado — registrar como melhoria desejável, não bloqueante.
- **[Trade-off] Tabelas fixas no código significam deploy pra qualquer ajuste de conteúdo** → Aceito explicitamente como decisão de MVP (ver BKLG-047 pro follow-up de tornar editável).

## Migration Plan

Não aplicável — sem alteração de schema de banco. A feature é puramente código (dados estáticos + rota + UI); deploy normal da aplicação é suficiente.
