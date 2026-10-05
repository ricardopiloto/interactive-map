# Tasks

## 1. Configuração

- [x] 1.1 Adicionar `DEEPSEEK_API_KEY` (e demais variáveis necessárias, ex. URL base/modelo) a `Settings` (`app/config.py`), seguindo o padrão de `validation_alias` já usado para `ADMIN_USER`/`MAX_UPLOAD_BYTES`; verificar com um teste confirmando que a ausência da variável não derruba a aplicação e resulta em IA tratada como indisponível
- [x] 1.2 Documentar a(s) variável(is) nova(s) no `.env.example` (ou equivalente já usado pelo projeto); verificar lendo o arquivo e confirmando a entrada nova

## 2. Módulo de cliente DeepSeek

- [x] 2.1 Criar o módulo de serviço (ex. `app/services/ia_provider.py`) com a função de chamada ao DeepSeek via `httpx`, usando a credencial de `Settings`; verificar com um teste que mocka a chamada HTTP e confirma o payload enviado e a resposta tratada
- [x] 2.2 Implementar o estado de falha explícito para timeout, erro de resposta e credencial ausente/inválida, sem expor detalhes internos do provedor ao chamador externo; verificar com testes cobrindo os três casos (timeout, erro HTTP do provedor, credencial ausente) e confirmando que a mensagem resultante não contém a credencial nem o corpo de erro bruto do provedor

## 3. Checagem de módulo habilitado por campanha

- [x] 3.1 Decidir e documentar o nome exato do valor em `Campanha.modulos_ativos` que habilita IA (ex. `"ia_arcos"` vs. um nome mais genérico como `"ia"`), reaproveitando o padrão de leitura já usado em `app/services/mecanica.py` (`key in active_set` sobre `campanha.modulos_ativos`); verificar com um teste confirmando que uma chamada ao módulo de IA é bloqueada quando o valor não está na lista da campanha
- [x] 3.2 Integrar essa checagem como pré-condição obrigatória antes de qualquer chamada ao cliente DeepSeek (seção 2); verificar com um teste confirmando que nenhuma chamada HTTP é feita quando o módulo está desabilitado (mock de rede não é nem invocado)

## 4. Privacidade e isolamento por campanha

- [x] 4.1 Implementar a montagem do payload de IA a partir de dados de uma única campanha, filtrando entidades ocultas com `is_visivel_para_jogador` (`app/services/visibility.py`) antes de incluir qualquer conteúdo; verificar com um teste que injeta uma sessão oculta e confirma sua ausência no payload resultante
- [x] 4.2 Verificar e documentar, com teste, que não existe caminho de código que combine dados de duas campanhas numa mesma chamada; verificar com um teste de dois campanhas simultâneas confirmando payloads completamente independentes

## 5. Autorização

- [x] 5.1 Exigir que o chamador desta infraestrutura já tenha passado pela checagem de mestre autorizado (reaproveitando o mecanismo já usado nos endpoints admin de `Arco`/`Evento`/`Sessao`); verificar com um teste confirmando que uma tentativa sem contexto de mestre é rejeitada antes de qualquer chamada ao provedor

## 6. Testes de integração

- [x] 6.1 Escrever um teste de integração ponta a ponta (com o cliente DeepSeek mockado) cobrindo o fluxo completo: módulo habilitado → mestre autorizado → dados filtrados por visibilidade → chamada ao provedor → resposta tratada; verificar que o teste passa e cobre também o caminho de módulo desabilitado
- [x] 6.2 Adicionar esta capability à documentação de dependências de features futuras de IA (BKLG-040, BKLG-015, e o motor de geração de arcos de `linha-tempo-por-arcos`), registrando que todas devem consumir esta infraestrutura em vez de chamar o provedor diretamente; verificar lendo o `docs/backlog/backlog.md` atualizado
