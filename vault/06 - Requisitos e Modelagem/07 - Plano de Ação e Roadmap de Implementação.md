# 🚀 Plano de Ação e Roadmap de Implementação
tags: #roadmap #tarefas #checklist #implementacao #best-buddy

Este documento estrutura o plano de execução técnica das mudanças mapeadas no [[06 - Matriz de Gap Analysis (O que Adicionar, Ajustar e Remover)]], contemplando as regras de **tabela unificada de animais**, **contato herdado do tutor**, **validação de WhatsApp via Twilio Verify**, **tela de edição de perfil** e **abandono da função de posts**.

---

## 🎯 Fases de Implementação

### 🧱 Fase 1: Perfil de Usuário, Cadastro e Validação Twilio
*Objetivo: Permitir criação de conta ágil com telefone opcional, implementar validação WhatsApp via Twilio e tela de edição de perfil.*
- [ ] **1.1 Campos no Model `Usuario`:** Adicionar `telefone = CharField` e `telefone_validado = BooleanField(default=False)`.
- [ ] **1.2 Serializer de Cadastro:** Atualizar `RegisterUsuarioSerializer` para aceitar `telefone` e definir `telefone_validado=False`.
- [ ] **1.3 Endpoints de Perfil e Segurança (`usuarios/views.py`):**
  - `GET /api/usuarios/perfil/`: Dados do usuário logado e status de validação do telefone.
  - `POST /api/usuarios/alterar-email/`: Exige senha atual, gera token assinado e envia email de revalidação.
  - `POST /api/usuarios/confirmar-email/`: Confirma o novo email com token.
  - `POST /api/usuarios/alterar-senha/`: Exige senha atual e define nova senha com `set_password`.
- [ ] **1.4 Integração Twilio Verify (WhatsApp):**
  - `POST /api/usuarios/whatsapp/enviar/`: Dispara código PIN para o número via Twilio Verify (canal WhatsApp).
  - `POST /api/usuarios/whatsapp/verificar/`: Confere o PIN; se correto, salva `usuario.telefone` e `telefone_validado=True`.
- [ ] **1.5 Frontend — Tela "Editar Perfil" (`pages/auth/profile.html`):**
  - Gestão de WhatsApp com status e modal de validação Twilio.
  - Card de alteração de email com senha atual.
  - Card de alteração de senha com senha atual.

---

### 🐾 Fase 2: Tabela Unificada de Animais (Adoção & Perdidos)
*Objetivo: Compartilhar a mesma tabela entre os dois serviços, vinculando o contato diretamente ao tutor validado.*
- [ ] **2.1 Model `Animal` Unificado (`animais/models.py`):**
  - FK `tutor` com `Usuario`.
  - Campo `tipo_servico` (`ADOCAO`, `PERDIDO`).
  - Campo `tipo_animal` (`CACHORRO`, `GATO`, `OUTRO`).
  - Campos unificados: `nome`, `cidade`, `descricao`, `imagem`, `status`, `inativado_em`.
  - Campos de adoção: `raca`, `sexo`, `idade_aproximada`, `medicamento`, `vacinacao`.
  - Campos de perdidos: `local` (último local visto).
  - Property `contato`: derivada diretamente de `tutor.telefone`.
- [ ] **2.2 Serializers e Views (`animais/serializers.py`, `animais/views.py`):**
  - Validar obrigatoriedade de `request.user.telefone_validado == True` ao criar anúncios.
  - Injetar `tutor=request.user` no `perform_create`.
  - Cota de 5 animais ativos para usuário comum.
  - Filtros por `tipo_servico`, `cidade` e `tipo_animal`.

---

### 💬 Fase 3: Abandono da Função de Posts
*Objetivo: Remover por completo os modelos, rotas e interfaces de posts.*
- [ ] **3.1 Backend:**
  - Remover modelo `Post` de `comunidade/models.py`.
  - Remover `AnimalDesaparecido` (unificado em `animais.Animal`).
  - Remover endpoints de `/api/comunidade/posts/` em `urls.py` e `views.py`.
  - Atualizar `denuncias` para excluir `POST` dos tipos de alvo permitidos.
- [ ] **3.2 Frontend:**
  - Remover feed de posts de `pages/community/index.html`.
  - Ajustar a barra de navegação (`Navigation.js`).

---

### 🏥 Fase 4: Serviços Credenciados, ONGs e Denúncias
*Objetivo: Finalizar os módulos complementares da plataforma.*
- [ ] **4.1 App `servicos`:** Cadastro de serviços com CRMV e aprovação da Staff.
- [ ] **4.2 App `denuncias`:** Denúncia autenticada com enum para `ADOCAO`, `PERDIDO` e `SERVICO`.
- [ ] **4.3 Fila de ONGs (`SolicitacaoOng`):** Upgrade institucional com liberação de cota ilimitada.

---

## 🧪 Verificação e Testes

A cada fase executada, rodar as migrações e a suíte de testes:
```powershell
python manage.py makemigrations
python manage.py migrate
python test_endpoints.py
```
Garantindo que todos os fluxos atendam estritamente às novas especificações de requisitos e modelagem.
