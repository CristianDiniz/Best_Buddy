# 📱 Frontend — Fluxos de Telas e Páginas
tags: #frontend #ui #ux #paginas #fluxos

Este documento detalha o comportamento funcional de cada tela do frontend, incluindo validações, formulários e integração.

---

## 1. Módulo de Autenticação (`pages/auth/`)

### `login.html` & `login.js`
- **Objetivo**: Autenticar o usuário na plataforma.
- **Campos**: `email` e `password`.
- **Validações Client-side**:
  - `email`: obrigatório e formato válido de email.
  - `password`: obrigatório.
- **Fluxo de Submissão**:
  1. Bloqueia botão e exibe spinner (`Entrando...`).
  2. Chama `authService.login({ email, password })`.
  3. Salva a sessão com `bbStorage.setSession(session)`.
  4. Redireciona para o parâmetro `?next=` da query string ou para `/pages/home/index.html`.
  5. Se falhar, exibe alerta vermelho com a mensagem de erro da API.
- **Credenciais de Teste no Modo Mock**:
  - `usuario@bestbuddy.com` / `123456`

---

### `register.html` & `register.js`
- **Objetivo**: Cadastro de novos adotantes (Pessoa Física).
- **Campos**:
  - `nome` (obrigatório)
  - `cpf` (obrigatório, validação de 11 dígitos)
  - `email` (obrigatório, formato válido)
  - `telefone` (opcional / máscara)
  - `senha` (mínimo de 6 caracteres)
  - `confirmar_senha` (deve ser idêntica à senha)
- **Fluxo de Submissão**:
  1. Chama `authService.register(payload)` enviando `{ nome, cpf, email, telefone, password: senha, tipo: "PF" }`.
  2. Ao receber sucesso, exibe banner verde e redireciona após 1.2s para `login.html`.

---

### `forgot-password.html` & `forgot-password.js`
- **Objetivo**: Recuperação de senha em 2 etapas.
- **Etapa 1 (Solicitação)**:
  - Usuário informa o `email`.
  - Chama `authService.requestPasswordReset(email)`.
  - Oculta o form 1 e exibe o form 2.
- **Etapa 2 (Confirmação)**:
  - Usuário informa o `PIN` recebido e a `nova_senha` (mínimo 6 caracteres).
  - Chama `authService.confirmPasswordReset({ email, pin, password })`.
  - Redireciona para `login.html`.

---

## 2. Telas Internas Autenticadas

Todas as telas abaixo importam `js/utils/auth-guard.js`. Se o usuário não tiver token no `bbStorage`, é redirecionado para o login com a URL salva em `?next=`.

---

### `pages/home/index.html` & `home.js`
- **Componentes**:
  - `bbRenderHeroCarousel("#bb-hero")`: Carrossel informativo no topo.
  - `#bb-news`: Lista de notícias da ONG carregadas via `communityService.listNews()`.
  - `#bb-posts`: Feed da comunidade carregado via `communityService.listPosts()`.
- **Comportamento**:
  - Carregamentos paralelos e independentes com estados de loading (skeleton) e estado vazio customizados.

---

### `pages/community/index.html` & `community.js`
- **Componentes**:
  - `#bb-posts`: Posts compartilhados pelos membros da comunidade.
  - `#bb-missing`: Grade de animais desaparecidos com foto, último local visto, contato do tutor e data.
  - `#bb-report-btn`: Botão "Reportar animal desaparecido".
- **Comportamento Atual**:
  - O reporte atualmente utiliza caixas `prompt()` do navegador para capturar `nome`, `local`, `contato` e `descricao` e chama `communityService.reportMissingAnimal()`.
  - *Melhoria planejada*: Substituir os `prompts` por um modal estilizado em Tailwind.

---

### `pages/animals/index.html` & `animals.js`
- **Objetivo**: Catálogo completo dos animais prontos para adoção.
- **Comportamento**:
  - Carrega a lista com `animalService.list()`.
  - Renderiza uma grade com `AnimalCard` (foto ou placeholder, nome, raça, sexo e idade).
  - Cada card é clicável e direciona para `pages/animals/detail.html?id=<id>`.

---

### `pages/animals/detail.html` & `animal-detail.js`
- **Objetivo**: Ficha técnica e perfil detalhado do animal escolhido.
- **Parâmetro de URL**: `?id=<id>`
- **Exibição**:
  - Imagem do pet.
  - Badges informativos: Raça, Idade aproximada e Sexo formatado (Macho/Fêmea/Indeterminado).
  - Status de vacinação e uso de medicamentos contínuos.
  - Descrição comportamental e história do resgate.
  - Botão de ação primário: **"Quero adotar"**, que direciona para `/pages/adoption/create.html?animal_id=<id>`.

---

### `pages/adoption/create.html` & `adoption.js`
- **Objetivo**: Formulário de intenção de adoção responsável.
- **Parâmetro de URL**: `?animal_id=<id>`
- **Comportamento**:
  1. Busca os dados do animal selecionado via `animalService.getById(animal_id)` e exibe um mini-card de resumo no topo.
  2. Caso a página seja aberta sem `animal_id`, bloqueia o formulário e avisa o usuário para selecionar um pet primeiro.
  3. **Campos do Formulário**:
     - `nome_adotante` (obrigatório)
     - `email_adotante` (obrigatório, formato email)
     - `telefone_adotante` (obrigatório)
     - Radios: `ja_teve_animais` (Sim/Não/Não sei)
     - Radios: `ja_vacinado` (Sim/Não/Não sei)
     - `motivacao` (Texto longo: "Conte um pouco sobre você e por que deseja adotar")
  4. **Proteção Anti-duplicação**: Flag `bbHasSubmitted` impede múltiplos cliques enquanto a requisição está em andamento.
  5. Ao submeter com sucesso, exibe banner verde e oculta o formulário.

Veja também:
- [[03 - Serviços e Camada de API]]
- [[01 - Contrato de API (Endpoints)]]
