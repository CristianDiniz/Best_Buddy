# 🚀 Plano de Ação e Roadmap de Implementação
tags: #roadmap #tarefas #checklist #implementacao #best-buddy

Este documento estrutura o plano de execução técnica das mudanças mapeadas no [[06 - Matriz de Gap Analysis (O que Adicionar, Ajustar e Remover)]], contemplando as regras de **tabela unificada de animais**, **contato herdado do tutor**, **validação de WhatsApp via Twilio Verify**, **tela de edição de perfil** e **abandono da função de posts**.

---

## 🎯 Fases de Implementação

### 🧱 Fase 1: Perfil de Usuário, Cadastro e Credenciais (MVP)
*Objetivo: Permitir criação de conta ágil com telefone de contato e tela de edição de perfil segura.*
- [ ] **1.1 Campo no Model `Usuario`:** Garantir campo `telefone = CharField(max_length=20, blank=True, null=True)`.
- [ ] **1.2 Serializer de Cadastro:** Atualizar `RegisterUsuarioSerializer` para aceitar `telefone` opcionalmente.
- [ ] **1.3 Endpoints de Perfil e Segurança (`usuarios/views.py`):**
  - `GET /api/usuarios/perfil/`: Retorna dados do usuário logado (email, telefone).
  - `PUT /api/usuarios/perfil/`: Permite atualizar telefone de contato.
  - `POST /api/usuarios/alterar-email/`: Exige senha atual, valida novo formato e atualiza email.
  - `POST /api/usuarios/alterar-senha/`: Exige senha atual e define nova senha com `set_password`.
- [ ] **1.4 Frontend — Tela "Editar Perfil" (`pages/auth/profile.html`):**
  - Card de atualização de dados e telefone de contato.
  - Card de alteração de email com senha atual.
  - Card de alteração de senha com senha atual.

---

### 🐾 Fase 2: Tabela Unificada de Animais (Adoção & Perdidos) e Localização
*Objetivo: Compartilhar a mesma tabela entre os dois serviços, com validação de Estado/Cidade e contato direto do tutor.*
- [ ] **2.1 Model `Animal` Unificado (`animais/models.py`):**
  - FK `tutor` com `Usuario`.
  - Campo `tipo_servico` (`ADOCAO`, `PERDIDO`).
  - Campo `tipo_animal` (`CACHORRO`, `GATO`, `OUTRO`).
  - Campos geográficos: `estado` (Enum com 27 UFs) e `cidade` (CharField).
  - Campo de contato flexível: `telefone_contato` (opcional caso herde de `tutor.telefone`, ou digitado pelo anunciante).
  - Campos unificados: `nome`, `descricao`, `imagem`, `status`, `inativado_em`.
  - Campos de adoção: `raca`, `sexo`, `idade_aproximada`, `medicamento`, `vacinacao`.
  - Campos de perdidos: `local` (último local visto / ponto de referência).
- [ ] **2.2 Serializers e Views (`animais/serializers.py`, `animais/views.py`):**
  - Exigir usuário autenticado para criar anúncios (`perform_create` injeta `tutor=request.user`).
  - Resolução do contato (`telefone_contato` ou fallback para `tutor.telefone`).
  - Cota de até 5 animais ativos por usuário.
  - Filtros por `tipo_servico`, `estado`, `cidade` e `tipo_animal`.
- [ ] **2.3 Frontend — Formulários de Animais e Filtros:**
  - Preenchimento inteligente de telefone: pré-carrega telefone do perfil se existente, ou abre campo para digitação.
  - Implementar preenchimento padronizado de Estado e Cidade (via ViaCEP ou catálogo do IBGE).
  - Eliminar digitação livre despadronizada de localização.

---

### 💬 Fase 3: Abandono da Função de Posts e Limpeza de Rotas
*Objetivo: Remover por completo os modelos, rotas e interfaces de posts.*
- [ ] **3.1 Backend:**
  - Remover modelo `Post` de `comunidade/models.py`.
  - Remover `AnimalDesaparecido` (já unificado em `animais.Animal`).
  - Remover endpoints de `/api/comunidade/posts/` em `urls.py` e `views.py`.
- [ ] **3.2 Frontend:**
  - Remover feed de posts de `pages/community/index.html`.
  - Ajustar a barra de navegação (`Navigation.js`).

---

### 🚀 Fase 4: Backlog de Implementações Futuras
*Consultar [[08 - Implementações futuras]] para especificações:*
- [ ] **4.1 Validação de WhatsApp via Twilio Verify:** Envio de OTP e bloqueio de cadastro sem validação.
- [ ] **4.2 App `servicos`:** Cadastro de serviços com CRMV e aprovação da Staff.
- [ ] **4.3 App `denuncias`:** Denúncia autenticada com enum para `ADOCAO` e `PERDIDO`.
- [ ] **4.4 Fila de ONGs (`SolicitacaoOng`):** Upgrade institucional com liberação de cota ilimitada.

---

## 🧪 Verificação e Testes

A cada fase executada, rodar as migrações e a suíte de testes:
```powershell
python manage.py makemigrations
python manage.py migrate
python test_endpoints.py
```
Garantindo que todos os fluxos atendam estritamente às novas especificações de requisitos e modelagem.
