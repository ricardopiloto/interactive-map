# Quickstart: Home e painel (098)

Validação local. Contratos: [contracts/](./contracts/).

## Pré-requisitos

- Backend com 093–097; frontend Vite.
- Dois mestres (A/B) e campanhas de teste (CLI).

## Setup

```bash
# terminal 1
cd backend && uv run uvicorn app.main:app --reload --port 8000
# terminal 2
cd frontend && npm run dev
```

## Cenários

### 1. Home pública (SC-001 / SC-003)

```bash
curl -sS http://127.0.0.1:8000/api/campanhas/catalogo
# só listada+activas; abrir http://localhost:5173/ → clicar → /c/{slug}
```

### 2. Painel isolamento (SC-002)

Login A → `/painel` só mesas de A.  
`GET /api/campanhas/minhas` com cookie A sem slugs de B.

### 3. Criar + home (SC-005)

No painel: criar `listada` → permanece `/painel` → anónimo refresh em `/` vê a mesa.  
Mudar para `so_link` → some da home; fica no painel.

### 4. Cota / export / import

Painel mostra uso; ≥90% aviso. Export dono → zip. Import zip → mesa nova na lista.

### 5. i18n + mobile (SC-006)

Alternar idioma; DevTools ≤800px — listar/criar/cota alcançáveis.

### 6. Suite

```bash
cd backend && uv run pytest tests/test_catalogo_publico.py tests/test_painel_minhas.py \
  tests/test_campanha_criar_http.py tests/test_visibilidade_patch.py -q
```

## Fora deste quickstart

UI super-admin / co-mestre. Corte `/opt` (099).
