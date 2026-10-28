# Proposal

## Why

A política de privacidade manda a pessoa "contactar o operador pelos canais da instância", mas hoje não existe nenhum canal. Com o registo aberto a qualquer pessoa, é preciso um meio de contacto que funcione para visitantes e utilizadores, sem expor o e-mail do operador nem criar um sistema de tickets. Aproveita-se para dar visibilidade à versão em execução, que hoje não aparece em lado nenhum e anda desalinhada entre ficheiros (1.1.0 no `package.json`, no `pyproject.toml` e no README; 1.3.0 no CHANGELOG).

## What Changes

- Nova página pública `/contato` para qualquer pessoa (com ou sem sessão): nome, e-mail para resposta, assunto (categoria) e mensagem.
- Novo endpoint público `POST /api/contato` que envia a mensagem por e-mail ao administrador da instância (variável `CONTATO_EMAIL`), com `reply-to` o e-mail da pessoa. Resposta sempre genérica; a mensagem **não é guardada** na aplicação.
- Novo `GET /api/contato/config` indica se o contacto está disponível e a chave pública do Turnstile.
- Defesas reaproveitadas do registo: limite por IP, contador por e-mail com hash, limite diário da instância (com a categoria de privacidade num teto próprio, separado do geral), honeypot, Turnstile opcional, limites de tamanho e de links na mensagem, nenhum dado pessoal nos logs. Nenhum e-mail de confirmação é enviado à pessoa (evita usar o formulário para enviar e-mail a terceiros).
- Rodapé da aplicação (`SiteFooter`) com a versão (ex.: `v1.3.0`) e links para `/termos`, `/privacidade` e `/contato`, **só fora das campanhas** (home, painel, explorar, administração, conta e demais páginas públicas). Dentro de uma campanha não há rodapé nem links legais, nem no menu de navegação da campanha.
- Fonte única da versão: `frontend-v2/package.json`, injetada no build e alinhada (1.3.0) com `pyproject.toml`, README e CHANGELOG, com um teste que falha se divergirem.
- Texto legal: a seção de contacto passa a apontar para `/contato`; a política de privacidade passa a descrever o tratamento da mensagem do formulário; corrige-se a frase "cookies de terceiros próprios".
- Textos em pt-BR e en.

## Capabilities

### New Capabilities
- `contato-publico`: formulário público de contacto entregue por e-mail ao operador, com antispam e sem armazenamento.
- `rodape-versao`: rodapé com versão e links legais, e a regra de fonte única da versão.

### Modified Capabilities
<!-- Nenhuma: as capacidades de auth/registo ainda estão na change registo-autonomo (não arquivada). -->

## Impact

- **Dependência:** esta change reutiliza peças da change `registo-autonomo` (`EmailSender`, Turnstile, contador por e-mail em `auth_lockout`, tratamento 429, páginas legais, runbook). Deve ser implementada depois de `registo-autonomo` estar na mesma branch/`main`.
- Backend: novo router `app/routers/contato.py`, serviço `app/services/contato.py`, extensão de `EmailSender.send` com `reply_to`, `app/config.py` (`CONTATO_EMAIL`, `CONTATO_LIMITE_DIARIO`, `CONTATO_LIMITE_PRIVACIDADE`), `app/main.py` (router e validação de arranque dos formulários públicos), generalização do contador por janela e da limpeza de contadores de `auth_lockout`, extração da validação de formato de e-mail de `routers/auth.py` para `auth_admin.py`.
- Frontend (`frontend-v2`): rota `/contato` nos dois blocos de `main.tsx`, `SiteFooter` e a sua inclusão nas páginas fora de campanha (`CampaignLayout` não muda), `vite.config.ts`/`vitest.config.ts` (versão injetada), locales pt-BR/en, textos legais.
- Operação: `CONTATO_EMAIL` em `.env.example` e no runbook; alinhamento de versões em `pyproject.toml` (e `backend/uv.lock`), `frontend-v2/package.json` (e `package-lock.json`), README.
- Fora de escopo: respostas dentro da aplicação, tickets, armazenamento de mensagens, anexos, e-mail de confirmação à pessoa.
