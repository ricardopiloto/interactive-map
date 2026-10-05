# Spec Delta

## Purpose

Garante que a primeira navegação para uma campanha carrega os dados dessa campanha, sem refresh e sem usar o slug de outra campanha.

## ADDED Requirements

### Requirement: Abrir mesa carrega o mapa na primeira navegação
Quando uma pessoa abre uma campanha a que tem acesso a partir do Painel, o sistema SHALL mostrar o mapa e os dados dessa campanha na primeira navegação, sem exigir refresh. Isto SHALL valer também quando a configuração dessa campanha já estiver em memória. Uma falha real da API SHALL continuar a poder mostrar erro; a ausência momentânea do slug da rota SHALL NOT ser apresentada como falha de carregamento.

#### Scenario: Abrir mesa com a configuração já em memória
- **WHEN** a pessoa já abriu a campanha nesta sessão, voltou ao Painel e escolhe "Abrir mesa"
- **THEN** o mapa dessa campanha aparece na primeira navegação, sem a mensagem "Falha ao carregar dados" e sem refresh

#### Scenario: Refresh continua a carregar
- **WHEN** a pessoa atualiza a página do mapa de uma campanha a que tem acesso
- **THEN** o mapa dessa campanha volta a aparecer

### Requirement: Mudar de página dentro da campanha carrega os dados
Ao passar do mapa para Relações, Rota, Sessões ou Linha do Tempo da mesma campanha, o sistema SHALL carregar os dados dessa página na primeira entrada, usando a campanha da rota.

#### Scenario: Do mapa para Relações
- **WHEN** a pessoa está no mapa de uma campanha e abre Relações
- **THEN** a página de Relações mostra os dados dessa campanha, sem mensagem de falha de carregamento causada pela troca de página

### Requirement: Sair da campanha não reutiliza o slug anterior
Depois de sair de uma campanha, o sistema SHALL NOT usar o slug dessa campanha num carregamento da campanha seguinte. A saída SHALL deixar de tratar a campanha anterior como a campanha ativa.

#### Scenario: Abrir outra campanha a seguir
- **WHEN** a pessoa sai de uma campanha para o Painel e abre uma segunda campanha
- **THEN** o mapa apresentado é o da segunda campanha
