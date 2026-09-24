# Contract: matriz de autenticação admin

**Feature**: `095-contas-sessao-permissoes`  
**Obrigatória** (FR-010, SC-001, constituição I–II).

## Setup

1. Campanhas A e B; utilizador UA membro só de A; UB membro só de B (ambos activos, com sessão).
2. Enumerar **todas** as rotas registadas cujo path contenha `/admin` sob o prefixo de campanha (introspecção FastAPI ou lista gerada no teste).

## Casos por rota admin

| Actor | Esperado |
|-------|----------|
| Sem cookie | Não 2xx de sucesso autenticado (401) |
| Sessão UB em slug A | 403 (não membro) |
| Sessão UA em slug A | Não 401 (200 ou 4xx de validação em métodos sem body) |

Cobrir pelo menos um POST de upload com cookie UA (sucesso de auth) e sem cookie (401).

## Regressão

Caracterizações públicas 092/094 continuam sem login. Testes que usavam `auth=TEST_GM_AUTH` Basic MUST passar a usar cookie de sessão de membro.
