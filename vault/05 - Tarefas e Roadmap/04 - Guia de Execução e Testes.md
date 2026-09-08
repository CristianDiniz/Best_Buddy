# 🧪 Roadmap — Guia de Execução e Testes Integrados
tags: #testing #execucao #guia #powershell #dev

Este guia fornece o passo a passo prático para inicializar ambos os ambientes localmente e testar a integração do Best Buddy.

---

## 1. Como Iniciar o Backend Django

Abra um terminal (PowerShell) no diretório do backend:

```powershell
cd C:\Users\T480\Documents\GitHub\Bestbuddy\Best_Buddy

# 1. Ativar o ambiente virtual Python (se houver venv) ou usar o Python global
# Exemplo: .\venv\Scripts\Activate.ps1

# 2. Executar as migrações pendentes
python manage.py migrate

# 3. Criar superusuário (caso queira acessar o Django Admin)
python manage.py createsuperuser

# 4. Iniciar o servidor de desenvolvimento na porta 8000
python manage.py runserver 127.0.0.1:8000
```

> [!NOTE]
> O Django responderá em: `http://127.0.0.1:8000/`
> Painel Administrativo em: `http://127.0.0.1:8000/admin/`

---

## 2. Como Iniciar o Frontend

Abra um segundo terminal no diretório do frontend dentro do repositório:

```powershell
cd C:\Users\T480\Documents\GitHub\Bestbuddy\Best_Buddy\frontend

# Iniciar servidor estático local na porta 5500
python -m http.server 5500
```

> [!TIP]
> A porta 5500 é a mesma esperada nas regras de CORS do backend (`config/settings.py`). Acesse pelo navegador em: `http://localhost:5500`.

---

## 3. Roteiro de Testes Ponta a Ponta (E2E Manual)

### Teste 1: Modo Mock (Validação Visual)
1. Certifique-se de que `USE_MOCKS: true` em `frontend/js/config.js`.
2. Acesse `http://localhost:5500`.
3. Faça login com:
   - Email: `usuario@bestbuddy.com`
   - Senha: `123456`
4. Verifique:
   - Redirecionamento para a Home.
   - Saudação "Olá, Ana" no topo e avatar com letra "A".
   - Notícias e posts carregados.
   - Aba "Animais": grade de 6 pets com fotos/placeholders.
   - Clicar em um animal: abrir detalhe (`detail.html?id=1`).
   - Clicar em "Quero adotar": formulário preenchido com resumo do pet.
   - Submissão de adoção: feedback de sucesso verde.

---

### Teste 2: Modo Real Integrado (Backend + SQLite / MySQL)
1. No arquivo `frontend/js/config.js`, altere:
   ```javascript
   window.BB_CONFIG = {
     USE_MOCKS: false,
     API_BASE_URL: "http://127.0.0.1:8000/api",
     MOCK_LATENCY_MS: 0,
   };
   ```
2. No backend rodando na porta 8000:
   - Cadastre uma conta em `http://localhost:5500/pages/auth/register.html`.
   - Realize o login com a conta recém-criada.
   - Navegue pelo catálogo de animais e submeta uma intenção de adoção real.
   - Abra o Django Admin (`http://127.0.0.1:8000/admin/`) e comprove que o registro de adoção foi gravado no banco de dados com a chave estrangeira do animal e os dados do adotante.

---

### Executar a Suíte de Testes Automatizados (9/9 Endpoints)
No diretório `Best_Buddy`, execute o script de verificação ponta a ponta:
```powershell
python test_endpoints.py
```
Esse script valida:
1. Obtenção de Token JWT com retorno do payload de `user`.
2. Renovação de token via `/api/token/refresh/`.
3. Listagem pública de animais (`GET /api/animais/`).
4. Detalhes de um animal (`GET /api/animais/{id}/`).
5. Criação de solicitação de adoção relacional (`POST /api/adocoes/`).
6. Consulta de notícias da ONG (`GET /api/comunidade/noticias/`).
7. Consulta e envio de posts no feed (`GET` e `POST /api/comunidade/posts/`).
8. Mural de desaparecidos (`GET` e `POST /api/comunidade/desaparecidos/`).

---

## 5. Como Executar com Docker (Ecossistema Completo)

Você também pode subir o Backend Django, Banco MySQL 8.0 e Frontend Nginx com apenas um comando:

```powershell
docker compose up --build
```

O container do backend executa automaticamente o script de espera pelo MySQL, roda todas as migrações e executa a carga inicial de dados (`seed_data.py`).

Veja o guia detalhado em:
- [[05 - Configuração e Uso do Docker]]
- [[01 - Checklist de Correções Imediatas]]
- [[03 - Transição SQLite para MySQL]]
