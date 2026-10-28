# Spec Delta

## Purpose

Mostra a versão da aplicação em execução e os links legais num rodapé consistente, e garante que a versão vem de uma única fonte alinhada em todos os componentes.

## ADDED Requirements

### Requirement: Rodapé com versão e links legais fora das campanhas
O sistema SHALL mostrar um rodapé com a versão da aplicação e links para os termos de uso, a política de privacidade e o contacto nas páginas que não pertencem a uma campanha (por exemplo, página inicial, explorar, painel, conta, administração, registo, termos, privacidade e contacto). O rodapé SHALL aparecer no mesmo formato para pessoas autenticadas e não autenticadas e em ambos os idiomas. Dentro de uma campanha o sistema SHALL NOT mostrar o rodapé nem os links dos termos, da privacidade ou do contacto, incluindo no menu de navegação da campanha.

#### Scenario: Página fora de campanha
- **WHEN** uma pessoa abre a página inicial, o painel, o explorar, a administração, o registo, os termos ou o contacto
- **THEN** vê o rodapé com a versão e os três links

#### Scenario: Login
- **WHEN** uma pessoa abre o login na sua própria página
- **THEN** vê o rodapé, e quando o login aparece sobre outra página não vê o rodapé duplicado

#### Scenario: Página de campanha sem rodapé
- **WHEN** uma pessoa abre qualquer página de uma campanha
- **THEN** não vê rodapé nem links de termos, privacidade ou contacto, nem na navegação da campanha

#### Scenario: Idioma
- **WHEN** a pessoa muda o idioma
- **THEN** os rótulos do rodapé mudam e a versão permanece a mesma

### Requirement: Versão de fonte única e alinhada
A versão mostrada SHALL vir de uma única fonte definida no momento da construção da aplicação, e a mesma versão SHALL constar no manifesto do backend e o seu ficheiro de bloqueio, no manifesto do frontend e o seu ficheiro de bloqueio, no README e na última entrada publicada do CHANGELOG. O projeto SHALL ter uma verificação automática que falha quando essas versões divergem.

#### Scenario: Versões alinhadas
- **WHEN** os manifestos, o README e o CHANGELOG têm a mesma versão
- **THEN** a verificação passa e o rodapé mostra essa versão

#### Scenario: Ficheiros em falta
- **WHEN** a verificação corre num ambiente onde alguns desses ficheiros não existem
- **THEN** a verificação é ignorada em vez de falhar

#### Scenario: Versões divergentes
- **WHEN** uma das versões difere das demais
- **THEN** a verificação falha e indica qual fonte diverge
