# Review — Arquiteto de Soluções

**Change:** pagina-contato
**Data:** 2026-10-28 (terceira revisão, após incorporar os pareceres anteriores e a decisão do rodapé)
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos relidos do disco; `backend/uv.lock`, `backend/Dockerfile`, `frontend-v2/{package-lock.json, Dockerfile}`, `.env.example`, `backend/app/services/{registo_config.py, auth_lockout.py}`. Topologia: túnel da Cloudflare → Caddy → `api` (1 worker) e `web`; contextos de build separados.

## Situação das ressalvas anteriores
Resolvidas no design/spec/tasks: A1 (`TRUSTED_PROXY` para formulários públicos, decisão 5 e tarefa 2.6), A3 (limpeza dos contadores `contato:`), A4 (limite de 2 URLs), A6 (validação de `CONTATO_EMAIL`), handler `def`, extração da validação de e-mail, e a decisão do rodapé (só fora de campanha, `CampaignLayout` intocado, com teste de que não renderiza). A2 foi tratada de um modo que cria um problema novo (B2 abaixo). Nada voltou a aparecer das rondas anteriores.

## 1. Definição da arquitetura técnica
Veredito: OK
- Sem componentes novos além de um router/serviço; reutiliza `EmailSender`, contador por janela e tratamento de 429. Envio síncrono com handler `def` é coerente com o worker único.
- O rodapé fora de campanha, página a página, é simples e não toca a área de campanha (cabeçalho fixo, navegação móvel, mapa).

## 2. Integração com a infraestrutura existente
Veredito: Atenção
- **B1 (Atenção): `backend/uv.lock` carrega a versão do projeto.** O lock tem `name = "mapa-campanha-api"`, `version = "1.1.0"` (linha 435). Subir o `pyproject.toml` para 1.3.0 sem atualizar o lock deixa o lock desatualizado: `uv run` (usado no desenvolvimento e no e2e) reescreve o arquivo silenciosamente, e qualquer `uv sync --locked`/`uv lock --check` falharia. O Dockerfile usa `--frozen`, então a imagem não quebra, mas o working tree fica sujo. A tarefa 1.1 deve incluir `uv lock` (atualiza só a linha da versão) e o teste de alinhamento deve incluir o `uv.lock` entre as fontes. No frontend, o `package-lock.json` tem a versão em dois pontos (raiz e `packages[""]`, linhas 3 e 9); atualizar ambos (o `npm ci` do Dockerfile não valida a versão, mas a consistência importa para o teste).
- A exigência `TRUSTED_PROXY=true` quando `CONTATO_EMAIL` está definido (decisão 5) muda o arranque de produção: se o `.env` real ainda tiver `TRUSTED_PROXY=false`, a API não sobe depois do deploy. Colocar isso como primeiro passo do plano de migração e do runbook ("confirmar `TRUSTED_PROXY=true` antes de definir `CONTATO_EMAIL`").
- Quota de e-mail partilhada, sem schema novo, sem porta/serviço novos: sem outras ressalvas.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **B2 (Atenção): a exceção da categoria `privacidade` esvazia o teto global para quem a escolher.** O assunto é escolhido pelo próprio remetente; um atacante que selecione "Privacidade e dados" contorna o teto de 30/dia, ficando só com os limites por IP, por e-mail e o captcha. Com muitos IPs/e-mails isso ainda inunda a caixa e gasta a quota do Resend. A intenção (proteger pedidos de titulares) é correta, mas a exceção deve ter o seu próprio teto, mais folgado: contador `contato:privacidade` com `CONTATO_LIMITE_PRIVACIDADE` (padrão 10/24 h). Assim o canal de privacidade nunca é bloqueado pelo spam geral nem se torna ilimitado. Atualizar a decisão 4 e a spec.
- **B3 (Atenção, menor): os contadores são consumidos antes do envio.** Com o envio síncrono, se o provedor falhar, o pedido falhado já gastou o contador por e-mail e o global. Uma indisponibilidade do Resend esvazia o teto global de 30 sem entregar nada, e a pessoa que repete fica limitada a 3 por e-mail. Recomendação: consumir o contador global (e o de privacidade) só depois do envio bem-sucedido; o contador por e-mail pode continuar a contar tentativas (protege contra repetições), mas com a falha do provedor deve ser devolvido. Registar a ordem no design.
- Segurança preservada: escape, sem injeção de cabeçalhos, sem retransmissão para terceiros (sem e-mail de confirmação), logs sem dados pessoais, CSRF por `Origin`, captcha com falha fechada.
- Manutenibilidade: a generalização de `allow_counter` e do purge por prefixos é pequena e mantém os testes existentes como rede de segurança.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- Alternativas registradas nas decisões 1, 2, 4, 6 e 7. A decisão 7 deixa claros o motivo e a regra do rodapé. Sem diagrama necessário: o fluxo é linear.

## 5. Ponte entre produto e técnico
Veredito: OK
- Cobre fielmente o pedido: contato público para logados ou não, entrega por e-mail ao administrador, versão em rodapé, rodapé fora das campanhas e sem menu legal na campanha. As categorias de assunto seguem como pergunta aberta menor.

## Bloqueantes antes de implementar
- nenhum (B1 e B2 convêm entrar no design/tasks antes do apply)

## Ressalvas a incorporar
- B1 → tarefa 1.1 (`uv.lock` e as duas versões do `package-lock.json`, e o teste de alinhamento) e plano de migração (`TRUSTED_PROXY` antes de `CONTATO_EMAIL`).
- B2 → decisão 4 e spec: contador próprio para a categoria `privacidade` (`CONTATO_LIMITE_PRIVACIDADE`), documentado em `.env.example` e no runbook.
- B3 → decisão 4/2: ordem de consumo dos contadores (global só após sucesso; por e-mail devolvido em falha do provedor).
