# 🐾 Best Buddy — Plataforma Completa (Fullstack Monorepo)

Repositório unificado da plataforma **Best Buddy**, integrando a **API REST Backend (Django)**, o **Frontend Web (Tailwind / Vanilla JS)**, suporte a **Banco de Dados (SQLite e MySQL 8.0)**, e **Containerização Completa com Docker**.

---

## 🗂️ Estrutura do Repositório

```
Best_Buddy/ (Branch: bruno)
├── frontend/                          # Aplicação Web (HTML5, Tailwind CSS v3, Vanilla JS)
│   ├── assets/                        # Imagens, logotipos e ilustrações
│   ├── css/                           # Estilos customizados e utilitários
│   ├── js/                            # Serviços, clientes de API, storage e páginas
│   ├── pages/                         # Telas: auth, animals, adoption, community
│   ├── Dockerfile                     # Servidor Nginx para servir o frontend
│   ├── nginx.conf                     # Configuração de rotas estáticas
│   └── index.html                     # Entrada da aplicação web
├── adocoes/                           # App Django de solicitações de adoção (relacional)
├── animais/                           # App Django de catálogo e ficha dos animais
├── comunidade/                        # App Django de notícias, posts e desaparecidos
├── config/                            # Configurações do Django (settings, urls, wsgi)
├── usuarios/                          # App Django de usuários customizados (PF/PJ) e JWT
├── fixtures/                          # Dumps de dados agnósticos para carga rápida
├── media/                             # Diretório de uploads e mídias estáticas
├── vault/                             # Cofre de documentação estruturado para Obsidian
├── db.sqlite3                         # Banco SQLite local pronto com dados populados
├── docker-compose.yml                 # Orquestração do ecossistema (db, backend, frontend)
├── Dockerfile                         # Build da imagem do backend Django
├── entrypoint.sh                      # Script de inicialização, espera de banco e seed
├── manage.py                          # CLI do Django
├── seed_data.py                       # Script de carga inicial de teste
├── test_endpoints.py                  # Suíte de testes automatizados (9/9 endpoints)
├── requirements.txt                   # Dependências Python do backend
└── RELATORIO_INTEGRACAO.md            # Relatório técnico completo de auditoria
```

---

## 🐳 Como Rodar COM Docker (Recomendado)

O Docker inicializa todo o ecossistema (Backend Django, Banco MySQL 8.0 e Frontend Nginx) com um único comando, executando as migrações e o seed de dados automaticamente com caminhos relativos.

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/) instalado e em execução.

### Passo Único:
Na raiz do repositório `Best_Buddy`:
```powershell
docker compose up --build
```

### Serviços Disponíveis:
- **Frontend Web**: `http://localhost:5500`
- **Backend API REST**: `http://localhost:8000/api/`
- **Painel Django Admin**: `http://localhost:8000/admin/`
- **Banco MySQL 8.0**: `localhost:3307` (interno: porta 3306)

> **Credenciais de Teste Geradas pelo Seed:**  
> Email: `usuario@bestbuddy.com` | Senha: `123456`

---

## 💻 Como Rodar SEM Docker (Desenvolvimento Local)

### 1. Iniciar o Backend (Django + SQLite)
Abra um terminal no diretório `Best_Buddy`:
```powershell
# Ativar venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt

# Aplicar migrações e popular dados
python manage.py migrate
python seed_data.py

# Iniciar o servidor Django na porta 8000
python manage.py runserver 127.0.0.1:8000
```

### 2. Iniciar o Frontend
Abra um segundo terminal no diretório `Best_Buddy/frontend`:
```powershell
cd frontend
python -m http.server 5500
```
Acesse no navegador: `http://localhost:5500`

---

## 🧪 Como Executar a Suíte de Testes da API

Para validar se todos os 9 endpoints principais estão respondendo de acordo com o contrato esperado:
```powershell
python test_endpoints.py
```

---

## ⚙️ Variáveis de Ambiente (`.env`)

O backend possui suporte nativo a `.env` através do `python-dotenv`:

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `USE_MYSQL` | `False` | `True` ativa conexão com MySQL; `False` usa SQLite (`db.sqlite3`). |
| `DB_NAME` | `bestbuddy_db` | Nome do banco de dados MySQL. |
| `DB_USER` | `bestbuddy_user` | Usuário do MySQL. |
| `DB_PASSWORD` | `bestbuddy_pass` | Senha do MySQL. |
| `DB_HOST` | `db` (ou `localhost`) | Host do MySQL. |
| `DB_PORT` | `3306` | Porta do MySQL. |
| `RUN_SEED` | `False` | Se `True`, roda o script `seed_data.py` na inicialização do container. |

---

## 📡 Resumo dos Endpoints da API

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/token/` | Login JWT (retorna access, refresh e dados do user) | Público |
| `POST` | `/api/token/refresh/` | Renovação de token de acesso | Público |
| `POST` | `/api/usuarios/register/` | Cadastro de usuário PF / PJ | Público |
| `GET` | `/api/animais/` | Catálogo de animais para adoção | Público |
| `GET` | `/api/animais/<id>/` | Detalhes do animal específico | Público |
| `POST` | `/api/animais/` | Cadastro de novo animal | Autenticado |
| `POST` | `/api/adocoes/` | Envio de formulário de adoção | Autenticado |
| `GET` | `/api/comunidade/noticias/` | Lista de notícias da ONG | Público |
| `GET` | `/api/comunidade/posts/` | Feed de postagens da comunidade | Público |
| `POST` | `/api/comunidade/posts/` | Criação de novo post | Autenticado |
| `GET` | `/api/comunidade/desaparecidos/` | Lista de pets desaparecidos | Público |
| `POST` | `/api/comunidade/desaparecidos/` | Registro de pet desaparecido | Público |

---

## 📖 Documentação Adicional (Obsidian Vault)

O projeto conta com uma documentação estruturada para **Obsidian** na pasta [`vault/`](./vault/):
- Abra o aplicativo Obsidian e selecione **"Open folder as vault"** apontando para `Best_Buddy/vault/`.
- Consulte o relatório técnico completo em [`RELATORIO_INTEGRACAO.md`](./RELATORIO_INTEGRACAO.md).
