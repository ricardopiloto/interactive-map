# Quickstart: validar estado de locais e rolagem de sessões

## Pré-requisitos

- Backend e frontend instalados segundo os guias do repositório.
- Banco de teste descartável com duas campanhas para comprovar isolamento.
- Usuário mestre autorizado a editar locais e uma campanha com o Mapa disponível.
- Para o E2E de Sessões, campanha descartável com registros suficientes para a lista exceder a altura da janela.
- Nunca executar os cenários de migração ou edição destrutiva nos dados locais de desenvolvimento ou produção.

## Estado Conhecido/Visitado

1. Criar ou escolher um Local Conhecido que tenha `data_sessao` vazio.
2. Definir ou preservar um rótulo de sessão e uma cor personalizada diferentes dos presets; editar o Local, trocar para Visitado e salvar.
3. Confirmar no mapa e no detalhe/lista do Local que o estado aparece como Visitado.
4. Fechar e reabrir o editor e recarregar a página; confirmar que Visitado persiste e que o rótulo e a cor continuam iguais.
5. Trocar Visitado para Conhecido, salvar e repetir a verificação após recarga.
6. Consultar as leituras pública e administrativa do Local e confirmar que ambas expõem o valor atual dentro da campanha correta.
7. Repetir update para o mesmo ID em uma segunda campanha e comprovar que cada banco mantém seu estado independente.
8. Tentar gravar valor fora de `conhecido`/`visitado`; confirmar rejeição e que o estado previamente persistido não muda.

### Migração

Usar uma cópia descartável de banco de campanha anterior à nova revisão contendo Locais com `data_sessao` vazio, nulo e preenchido. Atualizar e confirmar o backfill para Conhecido/Visitado conforme [data-model.md](data-model.md). Validar upgrade e downgrade em cópias; antes de testar downgrade após alterar novos estados, manter backup do banco.

Testes de backend esperados:

```bash
cd backend
uv run pytest tests/test_local_status.py tests/test_local_status_migration.py
```

## Lista completa de Sessões

1. Criar pelo fluxo administrativo uma quantidade de sessões que ultrapasse a altura de uma janela desktop (por exemplo, 20 registros com títulos e resumos longos) em uma campanha descartável.
2. Abrir `/c/{slug}/sessoes` em viewport desktop. Percorrer a tela com wheel/trackpad e teclado (Page Down/End); confirmar que a primeira e a última sessões podem ser lidas e que nenhuma fica inacessível.
3. Repetir em viewport mobile com touch; confirmar que a última sessão continua alcançável e o espaço da navegação inferior não encobre seu conteúdo.
4. Redimensionar a janela entre tamanhos e repetir a verificação.
5. Abrir uma lista curta e confirmar que ela continua legível sem corte.

O cenário E2E deve observar a rolagem real do navegador e a entrada final, sem depender da presença visual da barra de rolagem do sistema operacional.

## Execução desta implementação

- `tests/test_local_status_migration.py` e `tests/test_local_status_isolation.py`: aprovados (2 testes).
- E2Es `local-status.spec.ts` e `sessoes-scroll.spec.ts` no projeto desktop: aprovados. A lista foi percorrida com wheel/tecla End; o Local alternou nos dois sentidos após recarga sem mudar cor ou rótulo.
- `npm run build`: aprovado.
- Os testes HTTP pytest de `test_local_status.py` foram escritos, mas não concluíram neste ambiente: `TestClient` ficou travado durante a autenticação/setup por mais de 30 s. O mesmo travamento ocorreu com o teste preexistente `test_local_arco_validation.py`. As operações de API cobertas por esse contrato foram exercitadas pelo E2E desktop.
- O projeto mobile emulado não entregou gestos touch ao contêiner de rolagem usando CDP. O E2E mantém a validação da região rolável no viewport estreito; a confirmação por toque em dispositivo/navegador mobile real permanece como passo manual abaixo.

Para verificar toque em mobile real, abra uma campanha com lista longa, faça gestos verticais até a última sessão e confirme que a navegação inferior não encobre o fim do conteúdo.

```bash
cd frontend
npx playwright test e2e/local-status.spec.ts e2e/sessoes-scroll.spec.ts
npm run build
```

## Resultado esperado

- Estado selecionado nos dois sentidos é persistido e consistente após recarga, sem sobrescrever a cor ou o rótulo de sessão.
- Nenhuma leitura ou gravação afeta outra campanha.
- Todas as sessões podem ser percorridas em desktop e mobile quando a lista excede o viewport.
