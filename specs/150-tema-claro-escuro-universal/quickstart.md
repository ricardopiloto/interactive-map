# Quickstart: Tema claro e escuro em todos os gêneros

## Pré-requisitos

- Node/npm instalados conforme as instruções de `frontend/README.md`.
- Dependências do frontend instaladas.
- Ambiente E2E e campanha de teste preparados conforme a configuração existente.

## Validação automatizada

1. Preparar os dados e a sessão E2E conforme o fluxo documentado no projeto.
2. A partir de `frontend/`, executar somente os E2Es focados de tema nos projetos desktop e mobile:

   ```bash
   npm run test:e2e -- --project=desktop e2e/theme-selector-menu.spec.ts e2e/theme-selector-trigger.spec.ts
   npm run test:e2e -- --project=mobile e2e/theme-selector-menu.spec.ts e2e/theme-selector-trigger.spec.ts
   ```

3. Executar a validação de contraste disponível:

   ```bash
   npm run test:contrast
   ```

4. Executar a compilação de produção do frontend:

   ```bash
   npm run build
   ```

## Matriz de aceitação manual/automatizada

Para cada gênero (`fantasia`, `gotico`, `scifi`, `urbano`):

1. Definir o dispositivo como claro e selecionar Auto; verificar que a campanha usa sua paleta clara.
2. Definir o dispositivo como escuro, mantendo Auto; verificar que a campanha muda para sua paleta escura.
3. Selecionar Claro e depois alterar o dispositivo para escuro; verificar que permanece claro.
4. Selecionar Escuro e depois alterar o dispositivo para claro; verificar que permanece escuro.
5. Recarregar a campanha e entrar em outra campanha de gênero diferente; confirmar que a preferência persiste e cada campanha mantém sua própria identidade.
6. Verificar legibilidade de texto, controles, estados interativos e foco visível nos dois modos, em português e inglês.

## Resultado esperado

Os quatro gêneros devem renderizar combinações claras e escuras legíveis; Auto acompanha o dispositivo; Claro/Escuro permanecem explícitos; o valor `codex.theme` continua sendo reutilizado; controles do seletor continuam acessíveis e sem erros de contraste críticos.

## Resultado da validação da implementação

- E2E focado no desktop: 15 testes passaram (8 do menu e 7 do acionador); cobre pt-BR/en, seleção explícita nos quatro gêneros, identidade do acento após recarga, isolamento entre contextos, Auto e estabilidade das escolhas explícitas.
- E2E focado no mobile: 14 testes passaram (8 do menu e 6 do acionador); o teste de área mínima do acionador é exclusivo do desktop.
- `npm run test:contrast`: passou nas oito combinações gênero/modo e nos pares de cor configurados.
- `npm run build`: passou.
- `npm run lint`: passou com cinco avisos preexistentes de Fast Refresh/dependências React.
