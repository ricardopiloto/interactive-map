# cota-campanha Specification

## Purpose
Define o limite de armazenamento de cada campanha, o seu valor padrão e o comportamento quando o limite é atingido ou já está excedido.

## Requirements

### Requirement: Cota padrão de 300 MB
Toda campanha SHALL ter uma cota de armazenamento cujo valor padrão é 300 MB, configurável por instalação. Campanhas criadas, importadas de pacote ou migradas do legado SHALL receber essa cota, salvo indicação explícita do admin. Todas as campanhas existentes SHALL passar a ter a cota padrão quando a mudança for aplicada.

#### Scenario: Nova campanha
- **WHEN** uma campanha é criada
- **THEN** a sua cota é de 300 MB

#### Scenario: Campanhas existentes
- **WHEN** a mudança é aplicada a uma instalação com campanhas de cota anterior
- **THEN** todas passam a ter a cota de 300 MB

#### Scenario: Valor configurado
- **WHEN** a instalação define outro valor padrão
- **THEN** as campanhas novas usam esse valor

### Requirement: Bloqueio de upload acima da cota
Quando um upload fizer o uso da campanha ultrapassar a cota, o sistema SHALL recusá-lo com o erro de cota excedida e SHALL manter os dados existentes intactos. A importação de um pacote cujo conteúdo exceda a cota SHALL ser recusada.

#### Scenario: Upload que excede
- **WHEN** o dono envia um ficheiro que faria o uso passar de 300 MB
- **THEN** o envio é recusado com erro de cota excedida e o uso permanece o mesmo

#### Scenario: Pacote maior que a cota
- **WHEN** o dono importa um pacote cujas imagens somam mais que a cota
- **THEN** a importação é recusada e nenhuma campanha é criada

### Requirement: Campanha já acima da cota continua utilizável
Uma campanha cujo uso já excede a cota SHALL continuar legível e exportável, e SHALL só deixar de aceitar novos uploads. O sistema SHALL mostrar ao dono que a cota está excedida.

#### Scenario: Uso acima do novo limite
- **WHEN** uma campanha tem 400 MB em uso e a cota passa a 300 MB
- **THEN** a campanha abre e exporta normalmente, novos uploads são recusados, e o Painel indica a cota excedida

### Requirement: Aviso de cota próxima do limite
O sistema SHALL avisar o dono quando o uso atingir 90% da cota, e o Painel SHALL mostrar o uso e a cota em unidades legíveis.

#### Scenario: Uso a 90%
- **WHEN** o uso chega a 270 MB de 300 MB
- **THEN** o Painel mostra o aviso de cota quase cheia
