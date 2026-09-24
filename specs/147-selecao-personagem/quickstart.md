# Quickstart: validar seleção de personagem

Este roteiro valida os fluxos E2E no app ativo. Execute-o quando a correção de implementação for feita; nenhum comando de teste foi executado durante a elaboração deste plano.

## Pré-requisitos

- Dependências instaladas no `backend/` e `frontend/` (`uv sync --group dev` e `npm ci`).
- Chromium do Playwright instalado (`npx playwright install chromium`).
- Nenhum serviço ocupando as portas 4173 ou 8001.

## Preparar dados E2E

Na raiz do repositório:

```bash
cd backend
DATA_DIR=../frontend/e2e/.data \
E2E_ORIGIN=http://127.0.0.1:4173 \
CORS_ORIGINS=http://127.0.0.1:4173,http://localhost:4173 \
COOKIE_SECURE=false \
uv run python ../frontend/e2e/seed_e2e.py
```

## Validar seleção do Mapa

```bash
cd frontend
DATA_DIR="$PWD/e2e/.data" E2E_ORIGIN=http://127.0.0.1:4173 E2E_API_PORT=8001 \
  npx playwright test e2e/mapa-retratos.spec.ts
```

Resultado esperado: clicar na linha abre a ficha do mesmo personagem; os casos de retrato ausente/quebrado continuam mostrando detalhes e fallback sem impedir seleção.

## Validar seleção em Relações

```bash
cd frontend
DATA_DIR="$PWD/e2e/.data" E2E_ORIGIN=http://127.0.0.1:4173 E2E_API_PORT=8001 \
  npx playwright test e2e/relacoes-flows.spec.ts e2e/relacoes-retratos.spec.ts
```

Resultado esperado: a seleção pela lista e pelo grafo atualiza o nó selecionado e os detalhes para o mesmo personagem, em desktop e mobile.

## Verificação complementar

```bash
cd frontend
npm run build
```

O build deve concluir sem erros. As provas de comportamento permanecem os cenários Playwright acima; a compilação sozinha não valida a sincronização entre seleção, grafo e painel.
