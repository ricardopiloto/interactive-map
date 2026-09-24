# Quickstart: Campos de texto padronizados em Sessões e Linha do Tempo

## Pré-requisitos

- Frontend instalado conforme `frontend/README.md`.
- Uma campanha acessível e uma sessão autenticada no modo mestre para abrir os formulários de criação/edição.

## Executar a aplicação

Na pasta `frontend/`:

```bash
npm run dev
```

Abra `/c/<slug>/sessoes` e `/c/<slug>/linha-do-tempo` na campanha local.

## Verificação manual

1. Abra a criação de Novo Codex e observe os campos de texto como referência: altura, espaçamento interno, borda, raio, fundo, tipografia e contorno de foco.
2. Abra “Nova sessão” e compare título, rótulo de data e área de escrita do resumo com os campos de Novo Codex; confirme que dimensões e estados visuais correspondem.
3. Digite, selecione e apague texto; confirme que o indicador de foco tem o mesmo contorno e afastamento da referência e que o campo não corta o valor.
4. Abra uma sessão existente para edição e confirme que título, data e resumo permanecem preenchidos e salvam sem mudança de comportamento.
5. No campo de resumo, alterne entre escrita e prévia Markdown; confirme que as abas continuam funcionando e que a área de escrita segue o modelo visual de Novo Codex.
6. Repita a comparação em “Novo evento” e na edição de um evento em `/c/<slug>/linha-do-tempo`, cobrindo título, rótulo de era e descrição.
7. Repita a inspeção em tema claro e escuro, em desktop e em viewport estreita; confirme que os tokens preservam contraste e foco visível.
8. Confirme que os campos numéricos, seletores e checkboxes mantêm apresentação e comportamento anteriores.

## Validação de build

Na pasta `frontend/`:

```bash
npm run build
```

**Resultado esperado**: TypeScript e Vite concluem o build sem erros. Não se espera mudança em chamadas de API nem nos valores gravados.
