# 🚀 Roadmap — Checklist de Correções Imediatas
tags: #roadmap #checklist #tarefas #prioridades #concluido

Este documento registra o plano de ação executado para colocar o **Backend e o Frontend operando juntos em harmonia**, com todas as etapas validadas e testadas.

---

## ⚡ Prioridade 1: Desbloquear a Conexão Front-Back (Zero 500 / Zero 400)

- [x] **1.1. Corrigir a tabela `animais_animal` no SQLite**
  - Renomeada a tabela física `animais_animais` para `animais_animal` no `db.sqlite3`.
  - Validado via ORM: `Animal.objects.count()` responde sem erro.
- [x] **1.2. Atualizar o Serializer de Animais**
  - Incluídos `'id'`, `'descricao'`, `'imagem'` e `'created_at'` em `AnimaisSerializer`.
  - Permissão de `AnimaisViewSet` alterada para `AllowAny` no método `GET`.
- [x] **1.3. Adicionar campos `descricao` e `imagem` ao modelo `Animal`**
  - Adicionados os campos em `animais/models.py`.
  - Migrações geradas e aplicadas (`animais.0002`).
- [x] **1.4. Refatorar o modelo e serializer de `Adocao`**
  - Criada chave estrangeira `animal = ForeignKey('animais.Animal')`.
  - Incluídos os campos `nome_adotante`, `email_adotante`, `telefone_adotante`, `ja_teve_animais`, `ja_vacinado`, `motivacao`.
  - Atualizado `AdocoesSerializer` para receber o payload do frontend com `PrimaryKeyRelatedField`.
  - Migração aplicada (`adocoes.0002`).
- [x] **1.5. Limpar middlewares duplicados em `config/settings.py`**
  - Removidas chamadas repetidas e posicionado `CorsMiddleware` no topo.

---

## ⚡ Prioridade 2: Cadastro, Autenticação e Perfil Completo

- [x] **2.1. Reincluir campo `CPF` no cadastro de usuário**
  - Adicionado `cpf` em `PessoaFisica` (`usuarios/models.py`).
  - Adicionado `cpf` no `RegisterUsuarioSerializer` (`usuarios/serializer.py`).
  - Migração aplicada (`usuarios.0005`).
- [x] **2.2. Retornar dados do `user` no Login JWT**
  - Criado `CustomTokenObtainPairSerializer` retornando `user: { id, email, nome, tipo }`.
  - Rota `/api/token/` atualizada em `config/urls.py`.
  - `authService.js` no frontend atualizado para persistir `data.user` na sessão.
- [ ] **2.3. Implementar Recuperação de Senha (PIN)** *(Opcional / Futuro)*
  - Interface no frontend implementada; backend preparado para integração com serviço SMTP de envio de email.

---

## ⚡ Prioridade 3: App Comunidade (Notícias, Posts e Desaparecidos)

- [x] **3.1. Criar o app Django `comunidade`**
  - Criado app `comunidade` e registrado em `INSTALLED_APPS` no `settings.py`.
- [x] **3.2. Implementar Modelos de Comunidade**
  - `Noticia` (`titulo`, `resumo`, `conteudo`, `imagem`, `created_at`).
  - `Post` (`autor_nome`, `texto`, `created_at`).
  - `AnimalDesaparecido` (`nome`, `local`, `contato`, `descricao`, `foto`, `created_at`).
- [x] **3.3. Criar Serializers, Views e URLs**
  - `GET /api/comunidade/noticias/` (AllowAny)
  - `GET/POST /api/comunidade/posts/` (AllowAny)
  - `GET/POST /api/comunidade/desaparecidos/` (AllowAny)
  - Rota conectada em `config/urls.py` via `path('api/comunidade/', ...)`.
  - Migração aplicada (`comunidade.0001`).

---

## ⚡ Prioridade 4: Carga Inicial de Dados (Seed / Fixtures)

- [x] **4.1. Popular dados de teste no banco**
  - Script `seed_data.py` criado e executado.
  - Inseridos 6 animais completos (`Max`, `Luna`, `Thor`, `Mel`, `Bob`, `Pipoca`).
  - Inserida 1 notícia da ONG e 2 posts da comunidade.
  - Inseridos 3 animais desaparecidos.
  - Criado usuário de teste: `usuario@bestbuddy.com` / `123456`.

---

## ⚡ Prioridade 5: Virada de Chave no Frontend e Testes

- [x] **5.1. Conectar frontend à API real**
  - Suporte ao modo real validado:
    ```javascript
    USE_MOCKS: false,
    API_BASE_URL: "http://127.0.0.1:8000/api",
    ```
- [x] **5.2. Testar todos os fluxos com a suíte automatizada**:
  - Script `test_endpoints.py` executado com 9/9 testes passando com sucesso (`exit code 0`):
    - Token JWT + User Payload: OK
    - Refresh Token: OK
    - Listagem de Animais: OK (6 animais retornados)
    - Detalhe de Animal: OK
    - Solicitação de Adoção: OK (HTTP 201 Created)
    - Notícias da Comunidade: OK
    - Feed de Posts: OK
    - Lista de Desaparecidos: OK
    - Cadastro de Desaparecido: OK

---

## ⚡ Prioridade 6: Transição para MySQL e Dockerização

- [x] **6.1. Adicionar suporte dinâmico a MySQL**
  - Configurado bloco condicional `USE_MYSQL` em `settings.py`.
  - Charset `utf8mb4` definido para suporte completo a acentuação e emojis.
- [x] **6.2. Containerização Completa com Docker Compose**
  - Criado `Dockerfile` e `entrypoint.sh` para o backend (aguarda MySQL, roda migrações e seed).
  - Criado `Dockerfile` e `nginx.conf` para o frontend (Nginx na porta 5500).
  - Criado `docker-compose.yml` orquestrando os 3 serviços (`db`, `backend`, `frontend`).

Veja a documentação detalhada:
- [[04 - Guia de Execução e Testes]]
- [[05 - Configuração e Uso do Docker]]
- [[03 - Transição SQLite para MySQL]]
