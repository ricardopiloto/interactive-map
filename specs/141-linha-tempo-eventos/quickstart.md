# Quickstart: Linha do Tempo / Eventos (141)

Validar [spec.md](./spec.md) SC-001–005 e [contracts/eventos-api.md](./contracts/eventos-api.md).

## Pré-requisitos

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Campanha com locais, personagens e (opcional) sessões; conta mestre + conta jogador membro.

Aplicar migração campaign `004_evento` no fluxo habitual do projeto antes dos testes manuais.

## 1. Pytest (Constitution II)

```bash
cd backend && uv run pytest tests/test_eventos_isolation.py tests/test_eventos_visibility.py tests/test_eventos_crud.py -q
# nomes exactos conforme tasks.md; incluir na matriz admin se existir ficheiro dedicado
```

Esperado: isolamento A/B; jogador não vê evento oculto nem chips ocultos; mestre CRUD OK; validação título/ano.

## 2. Nav + lista (SC-001)

1. Abrir `/c/:slug/linha-do-tempo` (ou pelo menu ao lado de Sessões).
2. Com ≥3 eventos de anos distintos (seed/API), confirmar ordem do mais antigo no topo.
3. Expandir um card: título, ano/era, descrição, chips.

## 3. CRUD mestre (SC-002)

1. Como mestre: «+ Novo Evento» com só título + ano → aparece na ordem certa.
2. Editar: adicionar locais/personagens/sessão/era/visibilidade.
3. Remover com confirmação; cancelar não apaga.
4. Recarregar → persistido.

## 4. Jogador (SC-003)

1. Evento `visivel_para_todos=false` → ausente para jogador; presente para mestre.
2. Evento visível com personagem/local oculto → evento visível; chip oculto ausente (sem nome).
3. Chip permitido → navega para mapa/relações.

## 5. i18n (SC-004)

Alternar pt-BR / en: nav, botões, empty state, erros de formulário — sem chaves cruas.

## 6. Isolamento (SC-005)

Pedido autenticado/anónimo a slug B com ids de eventos de A → sem dados de A (já coberto por pytest).

## Grep sanity (pós-implementação)

```bash
rg -n 'Evento|evento_service|/eventos|linha-do-tempo|linhaTempo' \
  backend/app frontend/src --glob '!**/node_modules/**'
```

Esperado: modelo + routers + página + nav; **sem** chaves `eventos` em `campaign_export` / `campaign_import` nesta versão.
