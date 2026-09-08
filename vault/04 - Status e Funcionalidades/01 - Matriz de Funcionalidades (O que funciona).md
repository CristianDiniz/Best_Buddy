# 📊 Status — Matriz de Funcionalidades
tags: #status #funcionalidades #inventory #fullstack #integrado

Este documento é o inventário detalhado de todas as tarefas e funcionalidades do projeto Best Buddy, detalhando o que está funcionando no **Frontend (Mock)**, **Frontend (Real)**, **Backend Django** e no **Banco de Dados (SQLite e MySQL)**.

---

## 1. Tabela Geral de Funcionalidades

| Módulo / Funcionalidade          |  Front (Modo Mock)  |          Front (Modo Real)           |        Backend (Django REST)        |           Banco (SQLite / MySQL)            |
| :------------------------------- | :-----------------: | :----------------------------------: | :---------------------------------: | :-----------------------------------------: |
| **Login com Email e Senha**      |     🟢 Funciona     |  🟢 Funciona (`data.user` no header)  | 🟢 Funciona (`/api/token/` c/ user) |      🟢 Tabela `usuarios_usuario` ok        |
| **Renovação de Token (Refresh)** |     🟢 Mockado      |         🟢 Pronto no client          | 🟢 Funciona (`/api/token/refresh/`) |            🟢 Tokens stateless              |
| **Cadastro de Usuário (PF)**     |     🟢 Funciona     |         🟢 Funciona com CPF          |      🟢 Salva CPF/CNPJ com hash     | 🟢 Tabela `usuarios_pessoafisica` com CPF   |
| **Recuperação de Senha (PIN)**   |     🟢 Funciona     |    🟡 Interface pronta (fallback)    |        🟡 Planejado p/ SMTP         |            🟡 Planejado p/ SMTP             |
| **Guarda de Rotas (AuthGuard)**  |     🟢 Funciona     |             🟢 Funciona              |        🟢 `IsAuthenticated`         |                    N/A                      |
| **Listagem de Animais**          |  🟢 6 animais fake  |          🟢 6 animais do DB          | 🟢 `GET /api/animais/` (`AllowAny`) |     🟢 Tabela `animais_animal` corrigida    |
| **Detalhes do Animal**           |     🟢 Funciona     |        🟢 Ficha completa c/ ID       | 🟢 `GET /api/animais/{id}/`         |       🟢 Com `descricao` e `imagem`         |
| **Cadastro de Animal (POST)**    |    🟢 Em memória    |       🟢 POST autenticado ativo      |   🟢 Serializer com `id` e campos   |            🟢 Tabela alinhada               |
| **Solicitação de Adoção**        |     🟢 Funciona     |      🟢 Sucesso (HTTP 201)           | 🟢 Model com FK `Animal` + adotante |    🟢 Tabela `adocoes_adocao` com FK        |
| **Carrossel da Home**            |     🟢 Funciona     |        🟢 Funciona (Estático)        |                 N/A                 |                    N/A                      |
| **Mural de Notícias**            |  🟢 1 notícia fake  |         🟢 1 notícia real            |   🟢 App `comunidade` ativo         |      🟢 Tabela `comunidade_noticia`         |
| **Feed de Posts da Comunidade**  |   🟢 2 posts fake   |          🟢 2 posts reais            |   🟢 App `comunidade` ativo         |       🟢 Tabela `comunidade_post`           |
| **Mural de Desaparecidos**       | 🟢 3 registros fake |        🟢 3 registros reais          |   🟢 App `comunidade` ativo         | 🟢 Tabela `comunidade_animaldesaparecido`   |
| **Reportar Desaparecido**        |  🟢 Via `prompt()`  |        🟢 Envia POST à API real      |   🟢 POST em `/comunidade/`         |  🟢 Registro persistido no banco            |
| **Logout**                       |  🟢 Limpa storage   |           🟢 Limpa storage           |           N/A (Stateless)           |                    N/A                      |

---

## 2. O que Está 100% Pronto no Frontend

1. **Design System & Responsividade**:
   - Layout responsivo para Desktop, Tablet e Mobile.
   - Microanimações de entrada, foco e hover bem calibradas.
   - Skeletons de loading em todas as listas de dados.
2. **Formulários e Validação**:
   - Validador genérico client-side com feedback inline por campo.
   - Bloqueio de envio duplicado no formulário de adoção.
   - Tratamento de erro 400/401/404 da API com toasts e feedback visual.
3. **Navegação Autenticada**:
   - Barra superior dinâmica com página ativa destacada, avatar com as iniciais do usuário logado e menu de logout.
4. **Resiliência Desacoplada**:
   - O modo mock (`USE_MOCKS: true`) permanece 100% disponível para testes offline e demonstrações.

---

## 3. O que Está Pronto no Backend

1. **Estrutura Base e Segurança**:
   - Django 6 e Django REST Framework com SimpleJWT.
   - `django-cors-headers` configurado no topo dos middlewares.
   - Suporte híbrido SQLite / MySQL via variável de ambiente `USE_MYSQL`.
2. **Autenticação e Perfis**:
   - Modelo `Usuario` com email único, perfis `PessoaFisica` (com CPF) e `PessoaJuridica`.
   - `CustomTokenObtainPairSerializer` devolvendo tokens e o objeto `user` (`id`, `email`, `nome`, `tipo`).
3. **Gestão de Animais e Adoções**:
   - Modelo `Animal` com `descricao`, `imagem` e permissão pública de leitura.
   - Modelo `Adocao` relacional com `ForeignKey` para o animal e questionário completo do adotante.
4. **App Comunidade**:
   - Notícias da ONG, Feed da Comunidade e Mural de Desaparecidos.
5. **Automação & Containerização**:
   - Dockerfile e docker-compose orquestrando Django, MySQL 8.0 e Nginx com migrações e seed automático na inicialização.
   - Suíte de testes `test_endpoints.py` validando 9/9 endpoints com sucesso.

---

## 4. Estado Atual dos Bloqueios (Superados)

Todos os bloqueios arquiteturais anteriores foram resolvidos:
1. ✅ A tabela física foi corrigida para `animais_animal`.
2. ✅ O modelo `Adocao` foi reestruturado para vincular o adotante e o pet via chave estrangeira.
3. ✅ O app `comunidade` foi criado e integrado com suas migrations aplicadas.
4. ✅ O serializer de login agora preenche o objeto `user` no frontend.

Consulte os detalhes técnicos em:
- [[02 - Diagnóstico dos Bugs Atuais]]
- [[01 - Checklist de Correções Imediatas]]
- [[05 - Configuração e Uso do Docker]]
