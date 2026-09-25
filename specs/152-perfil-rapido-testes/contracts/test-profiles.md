# Contrato de comandos de perfis de teste

Este contrato descreve os comandos locais para feedback rápido e validação completa.

## Perfil rápido

- Possui um comando curto, invocável localmente, com dependências já instaladas.
- Conclui em até dois minutos no ambiente de referência documentado.
- Invocação: `./scripts/test-fast.sh [--frontend|--backend|--all]` a partir de qualquer diretório do repositório; sem opção, usa `--all`.
- Executa nove testes de baixo custo sem cliente HTTP: mapeamento legado de gênero e verificações CLI/snippets; executa também lint e contraste do frontend.
- Requer `uv`, Node.js/npm, `backend/.venv` com grupo `dev` e `frontend/node_modules` já instalados. Não instala/sincroniza dependências, faz build nem seed.
- O perfil `--frontend` roda lint e contraste sem exigir ambiente backend; `--backend` roda nove testes unitários/CLI selecionados; `--all` combina ambos. Não depende de sessão ou serviço E2E.
- Retorna código diferente de zero quando qualquer etapa executada falhar ou não puder iniciar.
- Relata etapa que falhou e duração das etapas principais.
- A seleção de validações deve acompanhar o escopo e risco. A suíte pytest completa, build e Playwright amplo ficam para mudanças de alto risco, marcos de entrega e CI; testes focados e jornadas afetadas servem para o ciclo normal de desenvolvimento.

## Perfil completo

- Preserva comandos existentes para toda a suíte pytest e para Playwright desktop e mobile, disponíveis para execução seletiva conforme o risco.
- Inclui as validações aplicáveis ao escopo, como build, lint, contraste, autenticação, permissões, migração, import/export e isolamento.
- Continua executável em ambiente limpo, com setup e seed documentados.
- Não pode depender de executar o perfil rápido antes.
- Comandos: backend `cd backend && uv run pytest`; frontend `cd frontend && npm run build && npm run lint && npm run test:contrast`; E2E `cd frontend && npm run test:e2e` após preparar o seed descrito em `frontend/e2e/seed_e2e.py`.

## Paralelismo

O contrato não garante suporte a paralelismo adicional. A execução paralela só pode ser oferecida se diretórios, bancos, credenciais, sessões e portas forem isolados por worker e se a suíte completa passar com resultados estáveis.
