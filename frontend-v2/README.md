# Campaign Codex — frontend-v2

Este diretório está em migração e **ainda não é o frontend de produção**. O serviço `web` continua usando `frontend/` até a validação de paridade funcional e visual.

A base visual vem de `paper-parchment-pages-main`. A aplicação será adaptada à stack do frontend atual: React, Vite, `react-router-dom`, client HTTP próprio e npm. Não reutilize estilos ou componentes visuais de `frontend/` ou `frontend-next/`.

O plano, as etapas de validação e o cutover estão em [frontend-v2-paper-parchment](../openspec/changes/frontend-v2-paper-parchment/). A troca do `build.context` em `docker-compose.yml` só ocorre na task 12.2, depois da validação em paralelo da task 12.1.
