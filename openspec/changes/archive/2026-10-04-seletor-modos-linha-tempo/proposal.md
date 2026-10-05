# Proposal

## Why

Os modos "Por arcos" e "Por descoberta" já existem na Linha do Tempo, mas só aparecem depois que o mestre liga um toggle no painel. Quem está na tela não escolhe a visualização: a campanha precisa ser configurada antes. A visualização por data do evento deve continuar sendo a padrão, e a troca de modo deve ser uma decisão de quem está olhando a tela, não uma configuração da campanha.

## What Changes

- O seletor da Linha do Tempo passa a oferecer sempre três modos para mestre e jogador: cronológica (por data do evento), "Por arcos" e "Por descoberta".
- Ao abrir a Linha do Tempo, o modo inicial é sempre o cronológico. A escolha vale enquanto a pessoa está nessa tela e não é gravada na campanha nem no navegador.
- **BREAKING**: os toggles "Linha do Tempo: modo Por arcos" e "Linha do Tempo: modo Por descoberta" saem do painel. Campanhas que estavam com esses modos desligados passam a exibi-los no seletor. Valores já gravados em `Campanha.modulos_ativos` para esses dois nomes deixam de ter efeito e não precisam de migração.
- O toggle de IA para sugerir arcos (`ia_arcos`) permanece uma configuração do mestre. Criar e editar arcos, itens e o alerta de sessão oculta continuam restritos ao mestre; só a escolha da visualização deixa de ser.

## Capabilities

### New Capabilities

(nenhuma.)

### Modified Capabilities

- `linha-tempo-por-arcos`: o requisito "Modo 'Por arcos' é opt-in por campanha" deixa de condicionar o modo a uma habilitação do mestre. "Por arcos" fica sempre no seletor da Linha do Tempo, com o cronológico como padrão ao entrar na tela.
- `linha-tempo-por-descoberta`: o requisito equivalente de opt-in muda da mesma forma. Essa capability está especificada na change concluída `linha-tempo-por-descoberta` e ainda não está em `openspec/specs/` (a change não foi arquivada). O delta desta proposta substitui esse opt-in.

## Impact

- Frontend: `LinhaTempoPage.tsx` deixa de ler `linha_tempo_arcos` e `linha_tempo_descoberta` para montar o seletor, buscar a descoberta e mostrar a gestão de itens. `PainelPage.tsx` e `api/campanhas.ts` perdem os dois toggles. As strings desses toggles em `comum.json` deixam de ser usadas.
- Backend: `MODULOS_TOGGLE_PERMITIDOS` e o schema do `PATCH /api/campanhas/{slug}/modulos` deixam de aceitar `linha_tempo_arcos` e `linha_tempo_descoberta`. `ia_arcos` continua. Os endpoints de leitura de arcos e de descoberta já não consultam esses flags.
- Testes: `backend/tests/test_modulo_toggle.py` cobre hoje ligar e desligar esses dois modos.
