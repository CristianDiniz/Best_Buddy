# Arquitetura — guia de cada arquivo

Este documento explica, arquivo por arquivo, o que cada um faz e por que existe.
Para instruções de uso (rodar local, alternar mock/API, deploy), veja o `README.md`.
Para o contrato de dados esperado da API, veja `API_CONTRACT.md`.

---

## Raiz

### `index.html`
Página de entrada do site. Não tem UI própria — só decide para onde mandar o
usuário: se já existe uma sessão salva (`bbStorage.isAuthenticated()`), redireciona
para `pages/home/index.html`; caso contrário, para `pages/auth/login.html`. É o
arquivo que o GitHub Pages serve quando alguém acessa a raiz do domínio.

### `README.md`
Guia de uso: como rodar localmente, como alternar entre dados mockados e API
real, como funciona o deploy. Ponto de partida para quem chega no projeto.

### `API_CONTRACT.md`
Especificação do formato de request/response que cada endpoint deve ter,
escrita do ponto de vista do que o front **espera**. Serve de referência para
quem for corrigir/construir o backend, e documenta as divergências já
conhecidas entre esse contrato e o backend Django atual (bug de import
`Animal`/`Animais`, campos inexistentes nos serializers, falta de FK em
`Adocao`, ausência de apps de Comunidade).

### `ARCHITECTURE.md`
Este arquivo.

---

## `.github/workflows/deploy.yml`
Workflow do GitHub Actions. A cada push em `main`, publica a raiz do
repositório como site estático no GitHub Pages (via `actions/configure-pages`,
`upload-pages-artifact` e `deploy-pages`). Não há passo de build porque o
projeto é HTML/CSS/JS puro — o conteúdo do repositório é publicado como está.

---

## `css/`

### `css/src/input.css`
Fonte do Tailwind: importa as fontes (Sora/Inter), define a camada `base`
(reset, scrollbar, seleção de texto, `prefers-reduced-motion`) e a camada
`components`, onde cada classe `bb-*` que já existia no projeto (header,
nav, cards, formulários, botões, grid de animais, estados, footer, telas
de auth, alertas) é recomposta com `@apply` sobre utilitários Tailwind —
ou seja, os nomes de classe no HTML/JS **não mudaram**, só a forma como são
definidos. Também define utilitários extra como `.bb-stagger` (delay
escalonado para animação de entrada de listas) e `.bb-skeleton` (shimmer de
loading).

### `css/tailwind.build.css`
CSS **gerado** (minificado) a partir de `css/src/input.css` +
`tailwind.config.js`, rodando `npm run build:css`. É esse arquivo que todo
`.html` do projeto carrega — fica versionado no repositório para que o
GitHub Pages continue publicando estático puro, sem precisar rodar Node no
deploy. Nunca editar esse arquivo à mão.

### `tailwind.config.js` (raiz do projeto)
Define a paleta de cores (`brand`, `surface`, `ink` — os mesmos valores que
estavam em `tokens.css`), fontes (`display`/`body`), sombras, gradientes de
fundo e as animações customizadas usadas em todo o projeto (`fade-in-up`,
`scale-in`, `shimmer`, `float` etc.).

---

## `js/config.js`
Arquivo de configuração central, carregado antes de qualquer outro script.
Define `window.BB_CONFIG` com três chaves:
- `USE_MOCKS`: `true` usa os dados fake de `js/mocks/`; `false` faz o front
  chamar a API real via `js/api/client.js`.
- `API_BASE_URL`: endereço do backend quando `USE_MOCKS` for `false`.
- `MOCK_LATENCY_MS`: atraso artificial (em ms) nas respostas mockadas, para
  conseguir testar visualmente os estados de loading mesmo sem rede real.

Esse é o **único arquivo que muda** quando o backend fica pronto — nenhuma
página ou componente precisa ser tocado.

---

## `js/utils/` — utilitários sem estado de UI

### `js/utils/storage.js`
Encapsula tudo que é gravado no `localStorage`: token de acesso, token de
refresh e dados do usuário logado. Expõe `bbStorage` com métodos como
`setSession()`, `getAccessToken()`, `getUser()`, `isAuthenticated()` e
`clearSession()`. Centralizar aqui significa que, se um dia a estratégia
mudar (por exemplo, para cookies `httpOnly`), só esse arquivo muda.

### `js/utils/auth-guard.js`
Script "porteiro": incluído no `<head>` ou início do `<body>` de toda página
que exige login. Ao carregar, checa `bbStorage.isAuthenticated()`; se não
houver sessão, redireciona imediatamente para a tela de login, preservando a
URL original em `?next=` para voltar depois do login.

### `js/utils/validation.js`
Funções puras de validação de formulário: `isEmail`, `isRequired`,
`minLength`, `isCPF` (valida formato/quantidade de dígitos, não o dígito
verificador), `passwordsMatch`. Também expõe `runRules(data, rules)`, um
executor genérico que recebe um objeto de dados e um mapa de regras por campo
e devolve só os erros encontrados — usado em todos os formulários do projeto
para não duplicar lógica de "percorrer campos e validar".

---

## `js/mocks/` — dados e helpers usados enquanto não há backend

### `js/mocks/mock-utils.js`
Duas funções auxiliares: `bbMockDelay(valor)`, que devolve uma Promise
resolvida com o valor após `MOCK_LATENCY_MS`, simulando uma chamada de rede;
e `bbMockError(mensagem, status)`, que devolve uma Promise **rejeitada** com
um `BBApiError`, simulando uma falha de API. Todo `service` usa essas duas
funções para se comportar como se estivesse de fato chamando uma API,
incluindo delay e possibilidade de erro.

### `js/mocks/mock-data.js`
Os dados fake propriamente ditos: um usuário e credenciais de teste
(`usuario@bestbuddy.com` / `123456`), 6 animais de exemplo, 2 posts de
comunidade, 3 registros de animais desaparecidos e 1 notícia. O formato de
cada objeto segue exatamente o `API_CONTRACT.md` — ou seja, os dados já
nascem no formato que o backend deveria devolver, não no formato que o
backend devolve hoje.

---

## `js/api/client.js`
Cliente HTTP genérico usado apenas quando `USE_MOCKS: false`. Define:
- `BBApiError`: classe de erro customizada com `status` e `payload`, usada
  tanto pelas respostas reais quanto pelas mockadas — assim o código das
  páginas trata os dois casos da mesma forma.
- `bbClient`: objeto com `get`, `post`, `patch`, `delete` (todos baseados em
  `request()`), que monta a URL a partir de `API_BASE_URL`, injeta o header
  `Authorization: Bearer <token>` quando há sessão, serializa o corpo em
  JSON e converte respostas não-OK em `BBApiError`.

---

## `js/services/` — camada que as páginas efetivamente chamam

Cada service tem a mesma forma: um método por operação, que checa
`window.BB_CONFIG.USE_MOCKS` e ou devolve dado mockado (via `bbMockDelay`/
`bbMockError`) ou delega para `bbClient`. As páginas nunca sabem qual dos
dois caminhos foi tomado.

### `js/services/authService.js`
`login()`, `register()`, `requestPasswordReset()`, `confirmPasswordReset()` e
`logout()` (que limpa a sessão e redireciona para o login). No modo mock, o
`login` só aceita o email/senha de teste definidos em `mock-data.js`.

### `js/services/animalService.js`
`list()` (lista todos os animais), `getById(id)` (detalhe de um animal) e
`create(payload)` (cadastro de novo animal — usado no fluxo "Cadastrar novo
animal" mostrado no mock). No modo mock, `create` insere o novo animal no
início do array `BB_MOCK_ANIMALS` em memória.

### `js/services/adoptionService.js`
`create(payload)`, que envia a solicitação de adoção. Documenta no comentário
o shape esperado do payload (`animal_id`, dados do adotante, respostas do
formulário, motivação).

### `js/services/communityService.js`
`listNews()`, `listPosts()`, `listMissingAnimals()` e
`reportMissingAnimal(payload)`. Esses endpoints não existem no backend atual
— o service já está pronto para quando existirem, seguindo o contrato
documentado.

---

## `js/components/` — HTML reutilizável, sem framework

Cada arquivo aqui é uma função JavaScript simples que recebe dados e devolve
(ou injeta diretamente) uma string HTML. Não há Virtual DOM nem
reatividade — é geração de HTML direta, escolhida deliberadamente para
manter o projeto sem build step.

### `js/components/Navigation.js`
`bbRenderNavigation(seletorAlvo, paginaAtiva)`. Renderiza o header verde
"BEST BUDDY" + a barra de navegação (Home/Comunidade/Animais/Adoção) usada em
todas as páginas autenticadas. Marca o link da página atual com
`aria-current="page"`, mostra o primeiro nome do usuário logado e as iniciais
em um avatar, e liga o botão "Sair" ao `authService.logout()`.

### `js/components/AuthHeader.js`
`bbRenderAuthHeader(seletorAlvo)`. Versão simplificada do header, só com a
logo "BEST BUDDY", usada nas 3 telas de autenticação (que não têm barra de
navegação porque o usuário ainda não está logado).

### `js/components/Footer.js`
`bbRenderFooter(seletorAlvo)`. Rodapé usado em todas as páginas (autenticadas
e de auth), com bloco de endereço/contato da ONG e um mini-formulário de
"encontrou algum problema?" que hoje só mostra um alerta de confirmação (não
chama nenhum service — é só front, como no mock).

### `js/components/AnimalCard.js`
`bbAnimalCardHtml(animal)`. Card usado na grade de "Prontos para receber um
lar": foto (ou placeholder "Sem foto"), nome, raça, idade aproximada e sexo.
O card inteiro é um link para `pages/animals/detail.html?id=<id>`.

### `js/components/PostCard.js`
Dois exports: `bbFormatDate(isoString)` (formata data ISO para `dd/mm/aaaa`
em pt-BR, usado por vários componentes) e `bbPostCardHtml(post)`, o card de
post da comunidade (texto, autor, data).

### `js/components/MissingAnimalCard.js`
`bbMissingAnimalCardHtml(item)`. Card da seção "Desaparecidos": nome do
animal, local visto por último, descrição, contato e data do registro.

### `js/components/StateView.js`
Helpers para os três estados que toda lista de dados pode assumir:
`bbStateHtml({ title, description, isError })` gera o HTML genérico de
estado (usado tanto para "carregando" quanto para "vazio" e "erro"), e
`bbLoadingHtml` é uma constante pronta com o texto "Carregando...".

---

## `js/pages/` — lógica específica de cada tela

Um arquivo por página HTML, carregado só por ela. Aqui ficam os
`addEventListener`, chamadas aos `services`, montagem de erros de validação
e navegação entre estados de loading/sucesso/erro daquela tela específica.

### `js/pages/login.js`
Liga o submit do formulário de login: valida email/senha no client,
chama `authService.login()`, salva a sessão com `bbStorage.setSession()` e
redireciona para `?next=` (ou para a Home). Mostra erros de validação por
campo e erro de API em um alerta genérico.

### `js/pages/register.js`
Mesma lógica do login, mas para o formulário de cadastro: valida nome, CPF
(formato), email, senha (mínimo 6 caracteres) e confirmação de senha
(precisa bater com a senha). Em caso de sucesso, mostra alerta e redireciona
para o login após 1,2s.

### `js/pages/forgot-password.js`
Controla o fluxo em 2 passos da recuperação de senha: o primeiro formulário
(pedir PIN por email) fica visível até o envio funcionar; então ele some e o
segundo formulário (PIN + nova senha) aparece. Guarda o email em uma
variável de módulo (`bbResetEmail`) para usar no segundo passo.

### `js/pages/home.js`
Carrega, em paralelo, as notícias (`communityService.listNews()`) e os posts
da comunidade (`communityService.listPosts()`), cada um com seu próprio
estado de loading/vazio/erro independente.

### `js/pages/community.js`
Carrega posts e animais desaparecidos. Também liga o botão "Reportar animal
desaparecido", que hoje coleta os dados via `prompt()` do navegador (solução
deliberadamente simples — ver seção "Simplificações conhecidas" abaixo) e
chama `communityService.reportMissingAnimal()`, recarregando a lista depois.

### `js/pages/animals.js`
Carrega a lista de animais disponíveis (`animalService.list()`) e renderiza
a grade de `AnimalCard`s, com estado vazio ("nenhum animal disponível") e de
erro.

### `js/pages/animal-detail.js`
Lê o `id` da query string, busca o animal via `animalService.getById()` e
monta a página de detalhe (foto, nome, raça, idade, vacinação, uso de
medicamento, descrição) com um botão "Quero adotar" que leva ao formulário
de adoção já passando `animal_id` na URL.

### `js/pages/adoption.js`
A lógica mais longa do projeto. Lê `animal_id` da URL e mostra um resumo do
animal selecionado (ou uma mensagem pedindo para escolher um animal, se a
página foi acessada sem esse parâmetro). Valida todos os campos do
formulário de adoção, e usa uma flag `bbHasSubmitted` para **impedir envio
duplicado** caso o usuário clique no botão mais de uma vez durante o envio.

---

## `pages/` — os arquivos HTML de cada tela

Cada `.html` aqui é "casca": estrutura semântica mínima, `<div>`s vazias que
os componentes vão preencher (`#bb-nav`, `#bb-footer`, `#bb-form-alert` etc.)
e a lista de `<script>` que aquela tela precisa, sempre na mesma ordem:
`config.js` → utils → mocks → `client.js` → services → components → o
`js/pages/*.js` daquela tela por último.

### `pages/auth/login.html`
Tela de login: email, senha, link "Esqueci minha senha", link para cadastro.

### `pages/auth/register.html`
Tela de cadastro: nome, CPF, email, telefone (opcional), senha, confirmação.

### `pages/auth/forgot-password.html`
Tela de recuperação de senha, com os dois formulários (pedir PIN / confirmar
PIN + nova senha) que `forgot-password.js` alterna.

### `pages/home/index.html`
Tela inicial pós-login: seção "Notícias e informações" + seção "Posts da
comunidade". Inclui `auth-guard.js` — não é acessível sem login.

### `pages/community/index.html`
Tela de comunidade: posts + seção "Desaparecidos" com botão de reportar.
Também protegida por `auth-guard.js`.

### `pages/animals/index.html`
Grade "Prontos para receber um lar" com todos os animais disponíveis.

### `pages/animals/detail.html`
Página de detalhe de um único animal (lida via `?id=`).

### `pages/adoption/create.html`
Formulário "Preencha os dados para solicitar a adoção" (lida `?animal_id=`
da URL, normalmente vinda do botão "Quero adotar" da tela de detalhe).

---

## `assets/`
Pasta reservada para imagens/ícones estáticos do projeto (hoje vazia — os
cards de animal usam um placeholder de texto "Sem foto" enquanto não há
upload de imagem real vindo do backend).

---

## Simplificações conhecidas (deliberadas, para revisar depois)

Documentando aqui para não parecerem esquecidas:

- **`prompt()` do navegador** para reportar animal desaparecido
  (`community.js`) — resolve a funcionalidade sem precisar desenhar mais um
  modal/formulário agora; trocar por um formulário de verdade quando a tela
  for refinada.
- **CPF**: `isCPF()` valida só formato (11 dígitos), não o dígito
  verificador — validação forte de CPF fica a cargo do backend.
- **Imagens de animais**: campo `imagem` já existe no contrato de dados, mas
  não há upload nem exibição real — só placeholder.
- **Footer "encontrou um problema?"**: o mini-formulário só mostra um alerta
  local, não chama nenhum service ainda (não há endpoint definido para isso
  no `API_CONTRACT.md`).
