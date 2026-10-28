# Spec Delta

## MODIFIED Requirements

### Requirement: Arranque seguro dos formulários públicos
Com o endereço de contacto configurado, ou com um provedor real de e-mail configurado, e o modo de depuração desligado, o sistema SHALL recusar-se a arrancar se o proxy reverso não estiver declarado como confiável, para que o limite por IP dos formulários públicos (contacto, registo e recuperação de senha) não trate todos os visitantes como um só cliente, mesmo com o registo fechado.

#### Scenario: Contacto configurado sem proxy confiável
- **WHEN** o endereço de contacto está configurado, o modo de depuração está desligado e o proxy não está declarado como confiável
- **THEN** a aplicação não arranca e indica o motivo

#### Scenario: Provedor de e-mail configurado sem proxy confiável
- **WHEN** um provedor real de e-mail está configurado, o modo de depuração está desligado e o proxy não está declarado como confiável
- **THEN** a aplicação não arranca e indica o motivo

#### Scenario: Contacto sem configuração
- **WHEN** o endereço de contacto não está configurado
- **THEN** a aplicação arranca sem exigir essa declaração por causa do contacto
