# Quickstart: validar retratos nas listas de personagens

## Pré-requisitos

- Ambiente local da aplicação conforme o guia do repositório.
- Campanha de teste com personagens com retrato válido, sem retrato e com URL que falha ao carregar.
- Acesso à lista de personagens do Mapa e à lista do mapa de Relações.

## Validação automatizada

Adicionar cenários independentes em `frontend/e2e/mapa-retratos.spec.ts` e `frontend/e2e/relacoes-retratos.spec.ts`, usando as respostas determinísticas de `frontend/e2e/personagem-retratos-fixtures.ts` e aproveitando a configuração de campanha existente. A cobertura deve verificar retrato correto, fallback para ausência/falha, associação à linha correta e preservação da lista ao buscar, selecionar ou filtrar.

Executar a suíte alvo em `frontend/`:

```bash
npm run test:e2e -- e2e/mapa-retratos.spec.ts e2e/relacoes-retratos.spec.ts
```

Executar as verificações de tipagem e lint aplicáveis:

```bash
npm run build
npm run lint
```

## Cenários de aceitação manual

1. **Mapa com retrato**: abrir o painel lateral e confirmar que a linha do personagem exibe a imagem correspondente, recortada circularmente sem distorção.
2. **Relações com retrato**: abrir a lista e comparar a miniatura com o retrato do token do mesmo personagem.
3. **Sem retrato ou falha**: confirmar que as duas listas exibem iniciais legíveis e não mostram ícone de imagem quebrada nem espaço vazio.
4. **Busca, filtro e seleção**: pesquisar e selecionar personagens em ambas as telas; confirmar que nomes, metadados, ordem e ações continuam relacionados ao mesmo personagem.
5. **Responsividade e acessibilidade**: repetir em viewport estreito e confirmar ausência de rolagem horizontal; verificar que a linha continua anunciando o nome uma única vez.

## Resultado esperado

Os retratos válidos aparecem nas duas listas, os casos sem imagem ou com falha mantêm o fallback de iniciais, e as interações existentes permanecem inalteradas. Nenhuma chamada de API, entidade ou migração é adicionada.
