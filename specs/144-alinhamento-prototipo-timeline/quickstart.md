# Quickstart: validar alinhamento do protótipo da Linha do Tempo

## Pré-requisitos

- Aplicação local executável conforme o guia de desenvolvimento do repositório.
- Campanha de teste com acesso mestre e jogador.
- Eventos cobrindo: evento público com Local/Personagem e Sessão visíveis; evento público com sessão oculta; evento oculto; evento sem associações; evento antigo com mês persistido.
- Sessões e entidades de referência configuradas na mesma campanha.

## Validação automatizada

Antes da implementação, criar/ajustar cenários em `frontend/e2e/timeline-flows.spec.ts` para os critérios deste guia. Executar a suíte alvo a partir de `frontend/`:

```bash
npm run test:e2e -- e2e/timeline-flows.spec.ts
```

Executar também as verificações aplicáveis de tipagem e lint:

```bash
npm run build
npm run lint
```

## Cenários de aceitação manual

1. **Mestre**: abrir `/c/{slug}/linha-do-tempo`; confirmar subtítulo e ação de novo evento; expandir/recolher card; confirmar resumo, badge de ocultação, detalhes, links e sessão identificável.
2. **Jogador**: abrir a mesma rota no modo de leitura; confirmar subtítulo, todos os detalhes sem interação, ausência de controles administrativos e nota final quando existem eventos.
3. **Privacidade**: como jogador, confirmar que Evento oculto, associação protegida e título/número de Sessão oculta não aparecem. Confirmar que uma sessão visível vinculada aparece.
4. **Formulário**: como mestre, criar evento com título/ano e dados opcionais; editar associação/descrição e salvar; confirmar que evento antigo com `mes` persistido conserva esse valor após edição de outro campo.
5. **Tema e viewport**: repetir a leitura nos temas disponíveis e em viewport estreito; confirmar legibilidade, foco de teclado nos controles e ausência de rolagem horizontal.
6. **Estado vazio**: remover/ocultar todos os eventos para o papel corrente; confirmar o estado vazio existente e que o lembrete de eventos não revelados não aparece isolado.

## Resultado esperado

Todos os cenários por papel correspondem ao contrato em [timeline-ui.md](./contracts/timeline-ui.md); nenhuma rota, entidade, migração ou dependência é necessária para completar o alinhamento.
