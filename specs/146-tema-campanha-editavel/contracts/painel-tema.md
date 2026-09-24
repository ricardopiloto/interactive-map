# Contract: Edição do tema visual no Painel

**Feature**: `146-tema-campanha-editavel`

## Selection and confirmation

- Cada cartão de campanha do dono mostra o gênero atualmente confirmado e um controle com as quatro opções já localizadas.
- O usuário pode escolher uma opção diferente, salvar ou cancelar a seleção pendente.
- Enquanto a requisição está pendente, a ação daquela campanha indica processamento e evita gravações concorrentes para o mesmo cartão.
- Uma escolha igual ao gênero confirmado não deve sugerir que há alteração pendente.

## Success

- A opção salva passa a ser o valor confirmado no cartão; a lista do Painel reflete o valor retornado pela API.
- A configuração em memória daquele slug é invalidada, para que a próxima abertura/recarga da campanha busque o gênero novo.
- Ao carregar a campanha, `CampaignShell` aplica a paleta existente e as regras atuais de suporte a modo claro/escuro.

## Failure and cancel

- Cancelar restaura o gênero confirmado antes da seleção e não chama a API.
- Erro de validação, autorização, rede ou persistência apresenta mensagem localizada e preserva a seleção confirmada; não apresenta estado de sucesso.
- O estado de processamento termina após sucesso ou erro e o controle pode ser usado novamente quando permitido.

## Theme preference separation

- O controle descreve a identidade/gênero compartilhado da campanha e usa as chaves de gênero já existentes (`painel.genre_*`).
- Não altera nem grava `codex.theme`.
- Fantasia respeita a preferência pessoal conforme o comportamento existente; Gótico, Sci-Fi e Urbano mantêm a regra existente de modo escuro forçado.
- Preferência Automático/Claro/Escuro fora da campanha permanece igual antes e depois da operação.

## Localization

Copy nova de seleção, salvar, cancelar, processamento e gênero inválido deve existir nas locales `pt-BR` e `en`. Os quatro nomes das opções são reutilizados das chaves existentes.
