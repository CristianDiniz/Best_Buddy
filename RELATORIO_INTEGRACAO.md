# 📋 Best Buddy — Relatório Completo de Auditoria, Integração e Roadmap

Este documento consolida a análise técnica detalhada entre o **Frontend** (`best-buddy-frontend-tailwind`) e o **Backend** (`Best_Buddy`), documentando o que funciona, as anomalias identificadas, o diagnóstico dos bancos de dados (SQLite e plano MySQL) e todas as alterações necessárias para integrar os dois sistemas.

> [!TIP]
> Todo o conteúdo deste relatório também foi estruturado como um **Obsidian Vault completo** com links bidirecionais (`[[...]]`) e tags na pasta:
> `c:\Users\T480\Documents\GitHub\Bestbuddy\Best_Buddy\vault\`

---

## 1. Visão Geral dos Dois Projetos

| Projeto | Localização | Tecnologias | Estado Atual |
| :--- | :--- | :--- | :--- |
| **Frontend** | `Best_Buddy\frontend` | HTML5, Vanilla JS, Tailwind CSS v3, Mock Layer | 🟢 100% funcional em modo mock e 100% integrado à API real via `js/config.js`. |
| **Backend** | `Best_Buddy` | Python, Django 6.0.6, DRF 3.16.0, SimpleJWT, SQLite + MySQL | 🟢 100% operacional, models/serializers refatorados, app comunidade criado, Dockerizado e testado (9/9 endpoints). |

---

## 2. Inventário de Funcionalidades: O Que Funciona Hoje

| Módulo / Funcionalidade | Front (Modo Mock) | Front (Modo Real) | Backend (Django REST) | Banco (SQLite / MySQL) |
| :--- | :---: | :---: | :---: | :---: |
| **Login (`/api/token/`)** | 🟢 Funciona | 🟢 Token e `user` capturados | 🟢 Retorna token e dados de `user` | 🟢 Usuário autenticado |
| **Refresh de Token** | 🟢 Mockado | 🟢 Pronto no client | 🟢 Funciona (`/api/token/refresh/`) | 🟢 Stateless JWT |
| **Cadastro (`/usuarios/register/`)** | 🟢 Funciona | 🟢 Envia CPF gravado no back | 🟢 Cria usuário PF c/ CPF e PJ c/ CNPJ | 🟢 `PessoaFisica` com CPF |
| **Recuperação de Senha (PIN)** | 🟢 2 etapas | 🟡 Interface pronta (fallback) | 🟡 Preparado para SMTP | 🟡 Planejado |
| **Guarda de Rotas (AuthGuard)** | 🟢 Protege rotas | 🟢 Protege rotas | 🟢 `IsAuthenticated` | N/A |
| **Listagem de Animais** | 🟢 6 pets fake | 🟢 6 pets do banco | 🟢 `GET /api/animais/` (`AllowAny`) | 🟢 Tabela `animais_animal` corrigida |
| **Detalhes do Animal** | 🟢 Ficha completa | 🟢 Ficha completa com ID | 🟢 `GET /api/animais/{id}/` | 🟢 Com `descricao` e `imagem` |
| **Cadastro de Animal (POST)** | 🟢 Em memória | 🟢 POST autenticado ativo | 🟢 Serializer com `id` e campos | 🟢 Tabela alinhada |
| **Solicitação de Adoção** | 🟢 Funciona | 🟢 Processado (HTTP 201) | 🟢 Model com FK para Animal e Adotante | 🟢 Tabela relacional persistida |
| **Carrossel da Home** | 🟢 Funciona | 🟢 Funciona (Estático) | N/A | N/A |
| **Notícias da ONG** | 🟢 1 notícia | 🟢 1 notícia do banco | 🟢 `GET /api/comunidade/noticias/` | 🟢 Tabela `comunidade_noticia` |
| **Feed da Comunidade** | 🟢 2 posts | 🟢 2 posts do banco | 🟢 `GET/POST /api/comunidade/posts/` | 🟢 Tabela `comunidade_post` |
| **Animais Desaparecidos** | 🟢 3 registros | 🟢 3 registros do banco | 🟢 `GET /api/comunidade/desaparecidos/` | 🟢 Tabela `comunidade_desaparecido`|
| **Reportar Desaparecido** | 🟢 Via `prompt()` | 🟢 Envia POST à API real | 🟢 `POST /api/comunidade/desaparecidos/`| 🟢 Persistido no banco |
| **Logout** | 🟢 Limpa storage | 🟢 Limpa storage | N/A (Stateless) | N/A |

---

## 3. Tudo o Que Precisa Ser Mudado / Implementado

### 3.1. No Backend (Django REST)

#### 🔴 Prioridade Alta (Bugs Críticos de Execução)
1. **Corrigir Tabela de Animais no SQLite**:
   - A tabela física no `db.sqlite3` chama `animais_animais`, mas o model chama `Animal` (o Django procura `animais_animal`). Renomear a tabela no SQLite (`ALTER TABLE animais_animais RENAME TO animais_animal;`) ou reconfigurar a migration.
2. **Incluir `'id'` no `AnimaisSerializer`**:
   - Em `animais/serializers.py`, o campo `'id'` foi omitido. O front precisa do ID para gerar os links `/pages/animals/detail.html?id=<id>`.
3. **Adicionar campos `descricao` e `imagem` ao modelo `Animal`**:
   - `Animal` precisa de `descricao = models.TextField(blank=True, null=True)` e `imagem = models.ImageField(upload_to='animais/', blank=True, null=True)`.
4. **Refatorar o modelo `Adocao`**:
   - Substituir a duplicação dos campos do animal por uma `ForeignKey('animais.Animal')`.
   - Adicionar chave para o usuário (`adotante`) ou campos de contato do adotante (`nome_adotante`, `email_adotante`, `telefone_adotante`).
   - Adicionar respostas do questionário: `ja_teve_animais`, `ja_vacinado`, `motivacao`.
5. **Atualizar `AdocoesSerializer`**:
   - Adequar para receber `{ animal_id, nome_adotante, email_adotante, telefone_adotante, ja_teve_animais, ja_vacinado, motivacao }`.
6. **Criar o App `comunidade`**:
   - Criar app com models `Noticia`, `Post` e `AnimalDesaparecido`.
   - Expor as rotas:
     - `GET /api/comunidade/noticias/`
     - `GET /api/comunidade/posts/`
     - `GET /api/comunidade/desaparecidos/` e `POST /api/comunidade/desaparecidos/`

#### 🟡 Prioridade Média (Autenticação e Perfis)
1. **Reincluir `CPF` em `PessoaFisica` e no Serializer de Registro**:
   - O front valida e envia CPF no cadastro. Adicionar `cpf` em `PessoaFisica` e em `RegisterUsuarioSerializer`.
2. **Retornar dados do `user` no Login JWT**:
   - Customizar o `TokenObtainPairSerializer` para que a resposta de `/api/token/` devolva não só `access` e `refresh`, mas também `user: { id, email, nome, tipo }`, permitindo que a Navbar exiba o nome do usuário.
3. **Implementar Recuperação de Senha**:
   - Criar views e endpoints para `/api/usuarios/password-reset/` e `/api/usuarios/password-reset/confirm/`.
4. **Permissões de Acesso**:
   - Tornar a leitura (`GET`) de animais pública (`AllowAny` ou `IsAuthenticatedOrReadOnly`), permitindo que visitantes conheçam os animais antes de se cadastrarem.
5. **Acentos nos Choices**:
   - Em `animais/models.py`, corrigir a opção `'Nâo sei'` (com circunflexo) para `'Não sei'` (com til).

#### 🟢 Prioridade Baixa (Configurações Gerais)
1. **Limpar Middlewares Duplicados**:
   - Remover entradas repetidas de `SecurityMiddleware`, `SessionMiddleware` e `CommonMiddleware` em `config/settings.py`.
2. **Configurar Upload de Mídia**:
   - Definir `MEDIA_URL = '/media/'` e `MEDIA_ROOT = BASE_DIR / 'media'` no `settings.py`.

---

### 3.2. No Frontend (`best-buddy-frontend-tailwind`)

1. **Ajustar `authService.login()`**:
   - Salvar o objeto `user` retornado pela API real no `bbStorage.setSession()`, eliminando o fallback `"Olá, visitante"`.
2. **Substituir `prompt()` por Modal em Desaparecidos**:
   - Trocar as caixas de diálogo nativas do navegador em `community.js` por um modal moderno estilizado com Tailwind.
3. **Pré-preencher Formulário de Adoção**:
   - Se o usuário estiver logado, autopopular os campos de nome, email e telefone em `adoption.js`.
4. **Tratar Imagens Reais**:
   - Garantir que a URL de imagem vinda do backend (ex.: `/media/animais/rex.jpg`) seja prefixada com o endereço da API ou tratada com o placeholder "Sem foto".

---

## 4. Transição do Banco de Dados: SQLite para MySQL

### Por que estamos usando SQLite agora?
O SQLite é perfeito para a fase de testes e acoplamento inicial porque dispensa instalação de servidor de banco de dados, permitindo resolver as inconsistências rapidamente.

### Arquitetura de Migração para MySQL:
1. **Dependências**: Adicionar `mysqlclient` (ou `pymysql`) e `python-dotenv` ao `requirements.txt`.
2. **Configuração Dinâmica no `settings.py`**:
   Alternar entre SQLite e MySQL através da variável de ambiente `USE_MYSQL=True`:
   ```python
   if os.getenv("USE_MYSQL") == "True":
       DATABASES = {
           'default': {
               'ENGINE': 'django.db.backends.mysql',
               'NAME': os.getenv('DB_NAME', 'bestbuddy_db'),
               'USER': os.getenv('DB_USER', 'root'),
               'PASSWORD': os.getenv('DB_PASSWORD', ''),
               'HOST': os.getenv('DB_HOST', 'localhost'),
               'PORT': os.getenv('DB_PORT', '3306'),
               'OPTIONS': {'charset': 'utf8mb4'}
           }
       }
   ```
3. **Charset**: Utilizar `utf8mb4` no banco MySQL para compatibilidade total com caracteres especiais e emojis.
4. **Comandos de Migração de Dados**:
   - Exportar do SQLite: `python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 4 > dump.json`
   - Rodar migrações no MySQL: `python manage.py migrate`
   - Importar no MySQL: `python manage.py loaddata dump.json`

---

## 5. Estrutura da Vault no Obsidian

A documentação técnica foi organizada em um cofre Obsidian dentro de `Best_Buddy\vault\`:

```
vault/
├── 00 - Visão Geral/
│   ├── 00 - MOC (Início).md
│   ├── 01 - Visão Geral do Projeto.md
│   ├── 02 - Arquitetura do Sistema.md
│   └── 03 - Transição SQLite para MySQL.md
├── 01 - Frontend/
│   ├── 01 - Estrutura e Tecnologias.md
│   ├── 02 - Fluxos de Telas e Páginas.md
│   ├── 03 - Serviços e Camada de API.md
│   ├── 04 - Mocks e Modo Desacoplado.md
│   └── 05 - Design System e Tailwind.md
├── 02 - Backend/
│   ├── 01 - Arquitetura Django REST.md
│   ├── 02 - App Usuários e Autenticação.md
│   ├── 03 - App Animais.md
│   ├── 04 - App Adoções.md
│   └── 05 - App Comunidade (Planejamento).md
├── 03 - Integração e Contratos/
│   ├── 01 - Contrato de API (Endpoints).md
│   ├── 02 - Matriz de Divergências (Front vs Back).md
│   └── 03 - Fluxo de Autenticação JWT.md
├── 04 - Status e Funcionalidades/
│   ├── 01 - Matriz de Funcionalidades (O que funciona).md
└── 05 - Tarefas e Roadmap/
    ├── 01 - Checklist de Correções Imediatas.md
    ├── 02 - Tarefas Backend (Django).md
    ├── 03 - Tarefas Frontend (Melhorias).md
    ├── 04 - Guia de Execução e Testes.md
    └── 05 - Configuração e Uso do Docker.md
```

Para abrir no Obsidian: Abra o aplicativo Obsidian, selecione **"Open folder as vault"** e aponte para a pasta `C:\Users\T480\Documents\GitHub\Bestbuddy\Best_Buddy\vault`.
