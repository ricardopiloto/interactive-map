# Spec Delta

## REMOVED Requirements

### Requirement: Modo "Por descoberta" é opt-in por campanha
**Reason**: A visualização deixa de ser uma configuração do mestre. Quem está na Linha do Tempo escolhe o modo, e o padrão ao abrir a tela continua sendo a cronologia por data do evento.
**Migration**: Remover o controle de habilitar "Por descoberta" da configuração da campanha. O modo passa a aparecer sempre no seletor da Linha do Tempo. Valores já gravados que só serviam para esse opt-in deixam de ter efeito. A gestão de itens e o alerta de sessão oculta continuam restritos ao mestre.

## ADDED Requirements

### Requirement: Modo "Por descoberta" escolhido na Linha do Tempo
A Linha do Tempo SHALL oferecer "Por descoberta" no seletor de modos para mestre e jogador em qualquer campanha, sem configuração prévia. Ao abrir a Linha do Tempo, o modo selecionado SHALL ser o cronológico, por data do evento. A escolha de outro modo SHALL valer enquanto a pessoa permanece nessa tela e SHALL NOT ser gravada como configuração da campanha nem restaurada numa visita seguinte. A configuração da campanha SHALL NOT oferecer um controle para habilitar ou desabilitar esta visualização.

#### Scenario: Abrir a Linha do Tempo
- **WHEN** um mestre ou um jogador abre a Linha do Tempo de uma campanha que não teve este modo configurado
- **THEN** o modo selecionado é o cronológico, por data do evento, e o seletor também oferece "Por descoberta"

#### Scenario: Escolher "Por descoberta" na tela
- **WHEN** a pessoa seleciona "Por descoberta" no seletor da Linha do Tempo
- **THEN** a tela mostra o modo por descoberta e continua oferecendo a volta ao modo cronológico, sem gravar essa escolha na campanha

#### Scenario: Voltar à tela
- **WHEN** a pessoa tinha selecionado "Por descoberta" e abre a Linha do Tempo de novo
- **THEN** o modo selecionado volta a ser o cronológico

#### Scenario: Configuração da campanha não controla o modo
- **WHEN** um mestre abre a configuração da campanha
- **THEN** não há controle para habilitar ou desabilitar a visualização "Por descoberta"
