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
  - Imagem do pet e tipo de animal (`Cachorro`, `Gato`, `Outro`).
  - Badges informativos: Raça, Idade aproximada, Sexo formatado (Macho/Fêmea/Indeterminado) e Cidade.
  - Status de vacinação e uso de medicamentos contínuos.
  - Descrição comportamental (até 255 caracteres).
  - **Botão de Ação Primário**: **"Falar com o Tutor no WhatsApp"** (link direto para `https://wa.me/55...` com o número previamente validado por PIN durante o cadastro).
  - **Botão Secundário**: **"Denunciar Card"** (exige que o usuário esteja autenticado e abre modal com Enum de motivos de infração).

---

### `pages/animals/create.html` & `animal-create.js` (Novo Fluxo)
- **Objetivo**: Cadastro de novo animal para adoção pelo tutor logado.
- **Etapa 1 (Dados do Pet)**:
  - Seleção de `tipo_animal` (Enum: Cachorro, Gato, Outro).
  - Upload de foto, cidade, descrição (até 255 caracteres) e telefone celular com DDD.
- **Etapa 2 (Validação de WhatsApp por PIN)**:
  - Dispara código de 6 dígitos para o WhatsApp informado.
  - Usuário digita o código PIN recebido para autorizar a publicação.

---

### `pages/adoption/create.html` (Descontinuado)
> [!WARNING]
> **Fluxo Descontinuado:** Conforme a especificação revisada em [[02 - Requisitos Funcionais#RF13 — Contato Direto para Adoção (Sem Formulário Intermediário)]], o questionário burocrático de aptidão foi removido. A negociação ocorre diretamente com o tutor via WhatsApp.

---

Veja também:
- [[02 - Requisitos Funcionais]]
- [[05 - Modelagem de Dados e Relacionamentos]]
- [[06 - Matriz de Gap Analysis (O que Adicionar, Ajustar e Remover)]]
