# Quickstart: Sistema agnóstico (140)

Validar [spec.md](./spec.md) SC-001–003 e [contracts/sistema-livre.md](./contracts/sistema-livre.md).

## Pré-requisitos

```bash
# backend
cd backend && uv run uvicorn app.main:app --reload --port 8000
# frontend (opcional p/ UI)
cd frontend && npm run dev
```

Conta de mestre autenticada.

## 1. Criação com sistema livre (SC-001 / SC-003)

1. Abrir `/painel/novo` (ou `POST /api/campanhas` autenticado).
2. Preencher nome/slug/género; sistema = `shadowdark` (ou outro fora de `wfrp4e`/`wod`).
3. Esperado: campanha criada; **sem** “Sistema desconhecido” / `SISTEMA_INVALIDO`.
4. Confirmar em config/painel que o sistema gravado é o digitado e que não há módulo fadiga (a menos que o nome seja exactamente `wfrp4e`).

## 2. Regressão wfrp4e (SC-002)

1. Criar campanha com sistema `wfrp4e`.
2. Esperado: `modulos_ativos` inclui `fadiga` (comportamento especial intacto).

## 3. Campo vazio (FR-005)

1. Tentar criar sem sistema (UI ou body inválido).
2. Esperado: bloqueio de validação de obrigatório / 422 — **não** a mensagem de sistema desconhecido.

## 4. Import (US2)

1. Exportar uma campanha ou montar um ZIP válido; no manifesto pôr `"sistema": "mothership"`.
2. Importar.
3. Esperado: import **não** falha com `SISTEMA_DESCONHECIDO` (pode falhar por outros motivos do pacote).

## 5. Pytest

```bash
cd backend && uv run pytest tests/test_campanha_criar_http.py -q
# + teste(s) de import actualizados/novos para sistema livre
uv run pytest tests/test_import_roundtrip.py tests/test_import_schema.py -q
```

Esperado: verde; nenhum assert a exigir `SISTEMA_INVALIDO` para nomes livres.

## Grep sanity (pós-implementação)

```bash
rg -n 'KNOWN_SISTEMAS|SISTEMA_INVALIDO|SISTEMA_DESCONHECIDO' backend/app backend/tests
```

Esperado: zero checks de allowlist em `campanha_admin` / `campaign_import`; testes sem expectativa de rejeição por nome livre.
