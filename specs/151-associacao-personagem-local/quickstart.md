# Quickstart: Associar personagens a Locais

## Pré-requisitos

- Backend e frontend configurados conforme os READMEs do projeto.
- Uma campanha E2E com acesso de mestre e pelo menos um PJ, um NPC e dois Locais.

## Validação automatizada

No diretório `backend/`, executar os testes focados em associação, visibilidade e autorização:

```bash
DEBUG=false uv run pytest tests/test_local_personagens.py tests/test_visibility_local_arco.py
DEBUG=false uv run pytest tests/test_admin_auth_matrix.py -k local_update_requires_campaign_membership
```

No diretório `frontend/`, executar os E2E específicos e o build, sem rodar a suite completa:

```bash
npm run test:e2e -- --project=desktop e2e/local-personagem-association.spec.ts e2e/local-personagem-visibility.spec.ts
npm run build
```

## Resultado desta implementação

- Funcionalidade: implementação concluída conforme spec — o editor recebe PJ e NPC, identifica seus tipos em pt-BR/en e os detalhes do Local apresentam os vínculos com tipo e navegação.
- Backend: 6 testes focados passaram (associação/persistência, visibilidade de PJ/NPC e autorização); 7 testes não relacionados foram excluídos pelo filtro.
- Frontend: `npm run build` passou. O Vite manteve o aviso existente de chunk JavaScript acima de 500 kB.
- E2E: validação parcial não aprovada; a leitura administrativa confirmou os IDs após salvar, mas a reabertura não confirmou a seleção dos chips. O diagnóstico está registrado para acompanhamento pela spec 152 em `docs/test-performance.md`; não altera o escopo nem o status de implementação da spec 151. A suite completa não foi executada.

## Cenário ponta a ponta

1. Entrar na campanha como mestre e abrir a edição de um Local.
2. Associar um PJ e um NPC e salvar.
3. Reabrir a edição e confirmar que ambos continuam selecionados e que o tipo é identificável.
4. Abrir os detalhes do Local e confirmar que os dois personagens aparecem com o tipo e que cada chip navega para o detalhe correto.
5. Remover somente a associação do PJ, salvar e recarregar; confirmar que o NPC continua associado e que o PJ continua existindo.
6. Entrar como jogador: verificar que associações visíveis aparecem e que personagens ou Locais ocultos não são revelados.
7. Tentar atualizar os IDs sem autenticação e com uma conta sem vínculo com a campanha; confirmar que a escrita é recusada pelo controle de acesso existente.
8. Repetir os rótulos do editor e detalhe em pt-BR e inglês.

## Resultado esperado

PJs e NPCs podem ser vinculados ao mesmo Local, as alterações persistem, nomes e tipos são apresentados corretamente e dados ocultos ou de outra campanha não ficam acessíveis.
