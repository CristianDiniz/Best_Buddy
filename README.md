# 🐾 Best Buddy — Plataforma de Adoção e Proteção Animal

Plataforma comunitária web voltada para a **proteção animal**, **adoção responsável** e **localização de pets perdidos**. O ecossistema conecta adotantes, ONGs/protetores independentes e a comunidade local em um ambiente integrado.

---

## 🏗️ Arquitetura do Sistema

O projeto é estruturado em uma arquitetura desacoplada e conteinerizada:

- **Frontend (`/frontend`)**: Interface web moderna e responsiva desenvolvida em **HTML5**, **Vanilla JavaScript (ES6+)** e **Tailwind CSS v3**. Servida via **Nginx** na porta `5500`. Possui camada de Mocks para desenvolvimento offline e cliente HTTP configurado para se conectar à API Django real.
- **Backend (Raiz)**: API REST desenvolvida em **Python 3.12** com **Django 6.0** e **Django REST Framework (DRF)**, com autenticação JWT (SimpleJWT). Roda na porta `8000`.
- **Banco de Dados**: Suporte dual configurável via variável de ambiente:
  - **SQLite** (`db.sqlite3`): Pronto para testes rápidos e desenvolvimento local.
  - **MySQL 8.0**: Executado via container Docker na porta `3307` (mapeada para `3306` internamente).

---

## 🐳 Como Executar com Docker (Recomendado)

O projeto é orquestrado via Docker Compose, permitindo subir todo o ecossistema (Banco de Dados + Backend Django + Frontend Nginx) com um único comando:

```powershell
docker compose up --build
```

### Endereços de Acesso:
- **Frontend**: [http://localhost:5500](http://localhost:5500)
- **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **Painel Administrativo Django**: [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **Banco de Dados MySQL**: `localhost:3307` (Usuário: `bestbuddy_user`, Senha: `bestbuddy_pass`)

> [!NOTE]
> O container do Nginx do frontend faz proxy reverso automático das rotas `/api/` e `/media/` para o container do backend Django.

---

## 💻 Como Executar Localmente Sem Docker

### 1. Inicializar o Backend (Django)

1. Certifique-se de ter o Python 3.12+ instalado:
   ```powershell
   pip install -r requirements.txt
   ```
2. Aplique as migrações no banco SQLite local:
   ```powershell
   python manage.py migrate
   ```
3. (Opcional) Popule o banco com dados de teste:
   ```powershell
   python seed_data.py
   ```
4. Inicie o servidor da API:
   ```powershell
   python manage.py runserver 0.0.0.0:8000
   ```
   A API estará acessível em `http://localhost:8000`.

### 2. Inicializar o Frontend (Estático)

Como os estilos do Tailwind já vêm compilados em `frontend/css/tailwind.build.css`, basta servir a pasta estática:

```powershell
cd frontend
python -m http.server 5500
```
Acesse: [http://localhost:5500](http://localhost:5500)

Para editar estilos do Tailwind ou configurar o modo Mock vs Real, consulte o [frontend/README.md](file:///c:/Users/T480/Documents/GitHub/BestBuddy/Best_Buddy/frontend/README.md).

---

## 📁 Estrutura de Diretórios do Projeto

```
Best_Buddy/
├── frontend/                          # Aplicação Web (HTML5 + Vanilla JS + Tailwind + Nginx)
│   ├── index.html                     # Ponto de entrada do site
│   ├── Dockerfile                     # Container Nginx do frontend
│   ├── nginx.conf                     # Configuração do Nginx (proxy reverso /api/)
│   ├── tailwind.config.js             # Tokens de estilo do Tailwind
│   ├── package.json                   # Scripts do Tailwind CLI (build:css / watch:css)
│   ├── API_CONTRACT.md                # Especificação dos endpoints da API
│   ├── ARCHITECTURE.md                # Guia detalhado da arquitetura do frontend
│   ├── README.md                      # Documentação específica do frontend
│   ├── pages/                         # Telas HTML (auth, home, community, animals, adoption)
│   ├── js/                            # Lógica JavaScript (serviços, mocks, componentes, utils)
│   ├── css/                           # Estilos (input.css e tailwind.build.css)
│   └── assets/                        # Imagens estáticas
├── animais/                           # App Django: Catálogo de pets (adoção e perdidos) com contato direto via WhatsApp
├── comunidade/                        # App Django: Notícias e mural comunitário
├── config/                            # Configurações do Django (settings, urls, wsgi)
├── usuarios/                          # App Django: Autenticação JWT, perfis PF e PJ com validação de WhatsApp
├── fixtures/                          # Dados de carga inicial (fixtures JSON)
├── vault/                             # Documentação técnica completa para Obsidian
├── .github/                           # Workflows de CI/CD (GitHub Actions)
├── db.sqlite3                         # Banco de dados local SQLite
├── docker-compose.yml                 # Orquestrador Docker (db, backend, frontend)
├── Dockerfile                         # Build do container Django Backend
├── entrypoint.sh                      # Script de inicialização e espera do banco no Docker
├── manage.py                          # CLI do Django
├── requirements.txt                   # Dependências Python do Backend
├── seed_data.py                       # Script de carga inicial no banco
├── test_endpoints.py                  # Suíte de testes automatizados dos endpoints
├── RELATORIO_INTEGRACAO.md            # Relatório técnico completo de auditoria e integração
└── LICENSE                            # Licença de uso
```

---

## 🧪 Testes Automatizados

O repositório inclui uma suíte completa de testes de integração dos endpoints da API:

```powershell
python test_endpoints.py
```
Todos os 9 endpoints principais (Autenticação JWT, Listagem e Detalhe de Animais, Solicitação de Adoção, Notícias, Posts, Animais Desaparecidos e Cadastro com CPF) são validados automaticamente.

---

## 📚 Documentação Técnica Adicional

- [README do Frontend](file:///c:/Users/T480/Documents/GitHub/BestBuddy/Best_Buddy/frontend/README.md): Guia de desenvolvimento e customização visual da interface.
- [Contrato da API](file:///c:/Users/T480/Documents/GitHub/BestBuddy/Best_Buddy/frontend/API_CONTRACT.md): Especificação de contratos de payload e resposta esperados.
- [Relatório de Integração](file:///c:/Users/T480/Documents/GitHub/BestBuddy/Best_Buddy/RELATORIO_INTEGRACAO.md): Diagnóstico aprofundado dos modelos, migrações e auditoria.
- **Obsidian Vault**: Para visualizar a documentação interativa com links bidirecionais, abra a pasta `vault/` no aplicativo [Obsidian](https://obsidian.md).
