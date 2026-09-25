# Implementation Plan: Otimizar a execução dos testes

**Branch**: `152-perfil-rapido-testes` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/152-perfil-rapido-testes/spec.md`

## Summary

Estabelecer uma linha de base reproduzível por suíte e etapa, depois oferecer um perfil local rápido e preservar comandos completos para os gates de entrega. As evidências apontam três custos prováveis: fixtures de backend que inicializam banco/campanha em cada teste, Playwright serial com projetos desktop e mobile, e a inicialização E2E que recompila o frontend antes de servir o preview. Timeouts de teste/servidor são longos e os dados E2E compartilham um único diretório, portanto paralelização só será considerada com isolamento comprovado. Nenhuma cobertura, teste de isolamento ou gate obrigatório pode ser removido para atingir as metas.

## Technical Context

**Language/Version**: Python 3.12+; Node.js compatível com Vite atual; TypeScript 6

**Primary Dependencies**: pytest, FastAPI TestClient, Playwright, Vite e npm já existentes; nenhuma dependência nova prevista

**Storage**: diretórios temporários SQLite por teste no backend; `DATA_DIR` e fixture persistente no E2E

**Testing**: backend `uv run pytest`; frontend lint/build/contraste; Playwright E2E

**Target Platform**: desenvolvimento local Linux/macOS/Windows suportado pelas ferramentas já adotadas; CI continua usando os fluxos completos

**Project Type**: tooling de desenvolvimento para aplicação web full-stack

**Performance Goals**: perfil rápido até 2 minutos e redução mediana mínima de 25% nas suítes recorrentes que sejam otimizáveis, medidos após dependências instaladas em ambiente de referência documentado

**Constraints**: cobertura e gates de qualidade mantidos; sem novos pacotes por padrão; execução serial permanece até demonstrar isolamento seguro; falhas de ambiente precisam ser distinguíveis de falhas de teste

**Scale/Scope**: comandos e configuração de testes de `backend/` e `frontend/`; sem alterar runtime ou instâncias de produção

## Constitution Check

- **I. Isolamento entre campanhas — PASSA**: não altera rotas ou dados de produto. Os testes de isolamento existentes devem permanecer nos fluxos completos e seus dados devem continuar separados.
- **II. Testes primeiro — PASSA**: a feature melhora os próprios fluxos de validação. Não altera autenticação, permissões, migrações de produção ou import/export; os gates existentes devem permanecer obrigatórios no ciclo completo.
- **III. Produção legada — PASSA**: alterações limitadas a scripts/configuração de desenvolvimento e documentação.
- **IV. Simplicidade — PASSA**: reutiliza pytest, Playwright, npm e shell disponíveis; qualquer dependência adicional exigiria justificativa específica.
- **V. i18n — N/A**: não há copy de produto.
- **VI. Migrações — N/A**: não há mudança de schema de produto.

**Reavaliação pós-design — PASSA**: o perfil rápido é explicitamente parcial; os comandos completos permanecem documentados e executáveis. A medição compara inventário de testes antes/depois. Workers paralelos não serão habilitados sem dados e serviços isolados por worker. Não há dependências ou exceções constitucionais.

## Project Structure

### Documentation (this feature)

```text
specs/152-perfil-rapido-testes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── test-profiles.md
```

### Source Code

```text
backend/pyproject.toml           # configuração e comandos pytest
backend/tests/conftest.py       # criação de DB/campanha e cliente por teste
frontend/package.json           # comandos npm existentes
frontend/playwright.config.ts   # projetos, workers, timeouts e webServers
frontend/e2e/                   # specs e fixtures/seeds E2E
scripts/                        # possível ponto para comando local unificado
backend/README.md
frontend/README.md
```

**Structure Decision**: preservar os comandos atuais de suíte completa e adicionar um perfil local focado/documentado nos scripts de desenvolvimento, provavelmente com um invocador raiz. O perfil deve selecionar um subconjunto pequeno e de alto sinal, incluir verificações rápidas de frontend e testes backend focados, e oferecer E2E desktop focado quando os serviços e dados E2E já estiverem preparados. A decisão final de seleção e localização do comando deve vir após medir a linha de base; não se deve recompilar ou reseedar em cada execução rápida sem necessidade.

## Complexity Tracking

Sem violações da constituição ou dependências novas. Qualquer ampliação de paralelismo exige provar isolamento dos diretórios de dados, bancos, usuários, sessões e portas.
