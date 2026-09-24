# 👥 Atores e Matriz de Permissões
tags: #atores #permissoes #rbac #seguranca #best-buddy

Este documento define os **5 perfis de acesso** (atores) do sistema **Best Buddy**, especificando os privilégios, limites operacionais e restrições de cada categoria de usuário.

---

## 🎭 1. Definição dos Atores

### 1. Visitante (Não Autenticado)
* **Perfil:** Qualquer pessoa acessando o site sem login ou cadastro prévio.
* **Poderes:** Navegar e visualizar todas as vitrines (animais para adoção, animais perdidos, catálogo de serviços e notícias). Entrar em contato direto com o tutor via WhatsApp para interesse de adoção ou resgate de perdidos.
* **Restrições:**
  - **Não pode** cadastrar animais para adoção nem reportar perdidos.
  - **Não pode** solicitar serviços credenciados.
  - **Não pode registrar denúncias** (exige autenticação obrigatória).
  - Se clicar em botões de ação restrita, deve ser redirecionado para a tela de login/cadastro.
  - Proibido de acessar a rota administrativa (`/admin/`), recebendo erro `403 Forbidden`.

### 2. Usuário Autenticado (Comum / PF)
* **Perfil:** Usuário cadastrado pelo fluxo de autenticação com login ativo via JWT.
* **Poderes:**
  - Acessar a tela **"Editar Perfil"** para alterar seu email (com senha atual e revalidação), alterar senha (com senha atual) e vincular/alterar seu número de WhatsApp via **Twilio Verify**.
  - Cadastrar até **5 animais ativos** simultâneos (adoção ou perdidos na tabela unificada `Animal`), **desde que possua `telefone_validado == True`**.
  - Solicitar criação do seu card de serviços (entra em fila de aprovação).
  - Solicitar upgrade de conta para ONG (formulário institucional).
  - **Registrar denúncias fundamentadas** escolhendo o motivo em uma lista padronizada (Enum) e detalhando a ocorrência (sobre adoção, perdidos ou serviços).
  - Editar e gerenciar exclusivamente os seus próprios anúncios (incluindo marcar seu animal como "Adotado" ou "Encontrado").
* **Restrições:**
  - Bloqueado de cadastrar novos animais ao atingir a cota de 5 registros ativos.
  - Bloqueado de cadastrar animais enquanto não validar o WhatsApp via Twilio.
  - Não pode editar registros de outros usuários.
  - Proibido de acessar o painel `/admin/`.

### 3. Usuário de ONG (Aprovado)
* **Perfil:** Usuário institucional cujo pedido de upgrade foi homologado por um membro da Staff ou SuperUser.
* **Poderes:**
  - Mesmos poderes do usuário comum, porém com **criação ILIMITADA** de registros de animais para adoção e animais perdidos na tabela unificada `Animal` (exige `telefone_validado == True`).
* **Restrições:** Não possui acesso ao painel `/admin/`. Não pode editar registros de outros usuários.

### 4. Staff (Moderador / Gestor Operacional)
* **Perfil:** Moderador cadastrado previamente por um SuperUser no painel Django (`is_staff=True`, `is_superuser=False`).
* **Poderes:**
  - Acessar o painel administrativo (`/admin/`).
  - Inativar cadastros de animais ou serviços considerados falsos, abusivos ou irregulares.
  - Analisar, aprovar ou recusar solicitações de conta de ONG.
  - Analisar, aprovar ou recusar solicitações de serviços.
  - Analisar a fila de denúncias categorizadas e aplicar despachos de moderação.
* **Restrições Estritas:**
  > [!WARNING]
  > **Regras Restritivas da Staff:**
  > - **Não pode** alterar o conteúdo dos dados cadastrais de serviços pertencentes a outros usuários (apenas aprovar, rejeitar ou inativar).
  > - **Não pode** alterar ou excluir perfis de outros membros da Staff nem de SuperUsers.
  > - **Não pode** visualizar campos de auditoria de sistema (`created_at` e `updated_at`).

### 5. SuperUser (Administrador Geral)
* **Perfil:** Administrador supremo do sistema (`is_superuser=True`).
* **Poderes:**
  - Acesso total e irrestrito ao painel Django e banco de dados.
  - Criar, editar, redefinir senhas e excluir contas de Staff.
  - Manipular todas as tabelas, aprovações, denúncias e auditorias.
* **Restrições:** O cadastro e edição de contas SuperUser só podem ser realizados por outro SuperUser já existente.

---

## 📊 2. Matriz de Permissões CRUD

| Recurso / Funcionalidade | Visitante (Anônimo) | Usuário Comum (PF) | Usuário ONG | Staff (Moderador) | SuperUser (Admin) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Visualizar vitrines públicas** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Contato direto via WhatsApp (Tutor)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Gerenciar próprio perfil (Email/Senha/WhatsApp)** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Validar WhatsApp via Twilio Verify** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Cadastrar animal para adoção (`telefone_validado`)** | ❌ Não (Redireciona) | 🟡 Sim (Até 5 ativos) | 🟢 Sim (Ilimitado) | 🟢 Sim | 🟢 Sim |
| **Cadastrar animal perdido (`telefone_validado`)** | ❌ Não (Redireciona) | 🟡 Sim (Até 5 ativos) | 🟢 Sim (Ilimitado) | 🟢 Sim | 🟢 Sim |
| **Editar próprios animais/cards** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Concluir anúncio (Adotado / Encontrado)** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Editar animais de terceiros** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | 🟢 Sim |
| **Inativar cards de terceiros** | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Solicitar cadastro de serviço** | ❌ Não (Redireciona) | ✅ Sim (Requer aprovação) | ✅ Sim (Requer aprovação) | ✅ Sim | ✅ Sim |
| **Aprovar solicitações de serviço** | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Editar dados de serviço alheio**| ❌ Não | ❌ Não | ❌ Não | ❌ **Proibido** | 🟢 Sim |
| **Solicitar upgrade para ONG** | ❌ Não (Redireciona) | ✅ Sim (Fila moderação) | — Já é ONG | — | — |
| **Aprovar conta de ONG** | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Publicar post na comunidade** | ❌ **Descontinuado** | ❌ **Descontinuado** | ❌ **Descontinuado** | ❌ **Descontinuado** | ❌ **Descontinuado** |
| **Registrar denúncia (Enum de motivos)** | ❌ **Não (Exige Login)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Moderar fila de denúncias** | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Acessar painel `/admin/`** | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden | ✅ Sim | ✅ Sim |
| **Gerenciar contas de Staff** | ❌ Não | ❌ Não | ❌ Não | ❌ **Proibido** | 🟢 Sim |
| **Ver logs `created/updated_at`** | ❌ Não | ❌ Não | ❌ Não | ❌ **Oculto** | 🟢 Sim |

---

## 🔗 Próximas Notas Relacionadas
- [[02 - Requisitos Funcionais]] — Especificação de cada funcionalidade.
- [[04 - Regras de Negócio]] — Regras de cota, expiração e moderação.
- [[05 - Modelagem de Dados e Relacionamentos]] — Como esses perfis se refletem no banco de dados.
