# 📡 Integração — Contrato de API (Endpoints)
tags: #api #contrato #endpoints #rest #json

Este documento consolida o **contrato esperado pelo Frontend**, servindo como especificação canônica para o Backend.

**Base URL**: `http://127.0.0.1:8000/api`

---

## 1. Autenticação (`/api/token/` e `/api/usuarios/`)

### `POST /token/`
Obter tokens JWT de acesso e refresh.
- **Request**:
  ```json
  {
    "email": "usuario@bestbuddy.com",
    "password": "suasenha123"
  }
  ```
- **Response 200 (Desejado)**:
  ```json
  {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "usuario@bestbuddy.com",
      "nome": "Ana Souza",
      "tipo": "PF"
    }
  }
  ```
- **Response 401**: `{"detail": "No active account found with the given credentials"}`

---

### `POST /token/refresh/`
Renovar o token de acesso expirado.
- **Request**: `{"refresh": "eyJhbGciOi..."}`
- **Response 200**: `{"access": "eyJhbGciOi..."}`

---

### `POST /usuarios/register/`
Cadastro de novo usuário adotante (Pessoa Física).
- **Request**:
  ```json
  {
    "nome": "Ana Souza",
    "cpf": "12345678901",
    "email": "ana@email.com",
    "telefone": "(16) 99999-0000",
    "password": "senhaSegura123",
    "tipo": "PF"
  }
  ```
- **Response 201**:
  ```json
  {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  }
  ```
- **Response 400**: Erros de validação (ex.: `{"email": ["Este campo deve ser único."]}`)

---

### `POST /usuarios/password-reset/`
Solicitar PIN de recuperação de senha por email.
- **Request**: `{"email": "ana@email.com"}`
- **Response 200**: `{"sent": true}`

---

### `POST /usuarios/password-reset/confirm/`
Confirmar PIN e redefinir senha.
- **Request**:
  ```json
  {
    "email": "ana@email.com",
    "pin": "1234",
    "password": "novaSenhaSegura456"
  }
  ```
- **Response 200**: `{"reset": true}`
- **Response 400**: `{"detail": "PIN inválido ou expirado."}`

---

## 2. Animais (`/api/animais/`)

### `GET /animais/`
Lista de animais disponíveis para adoção.
- **Headers**: Nenhum obrigatório (público).
- **Response 200**:
  ```json
  [
    {
      "id": 1,
      "nome": "Max",
      "raca": "SRD",
      "sexo": "M",
      "idade_aproximada": "Adulto",
      "medicamento": "Não",
      "vacinacao": "Sim",
      "contato": "(16) 99999-0001",
      "descricao": "Dócil, adora brincar com bola.",
      "imagem": null
    }
  ]
  ```

---

### `GET /animais/{id}/`
Detalhes de um animal específico.
- **Response 200**: Objeto único com a mesma estrutura acima.
- **Response 404**: `{"detail": "Não encontrado."}`

---

### `POST /animais/`
Cadastro de novo animal (ONGs / Protetores).
- **Headers**: `Authorization: Bearer <access_token>`
- **Request**:
  ```json
  {
    "nome": "Rex",
    "raca": "Labrador",
    "sexo": "M",
    "idade_aproximada": "Filhote",
    "medicamento": "Não",
    "vacinacao": "Sim",
    "contato": "(16) 99999-7777",
    "descricao": "Muito alegre e dócil."
  }
  ```
- **Response 201**: Animal criado com seu `id`.

---

## 3. Adoção (`/api/adocoes/`)

### `POST /adocoes/`
Envio de solicitação de adoção.
- **Headers**: `Authorization: Bearer <access_token>` (se logado).
- **Request**:
  ```json
  {
    "animal_id": 1,
    "nome_adotante": "Ana Souza",
    "email_adotante": "ana@email.com",
    "telefone_adotante": "(16) 99999-0001",
    "ja_teve_animais": "Sim",
    "ja_vacinado": "Sim",
    "motivacao": "Amo animais e tenho espaço para cuidar com carinho."
  }
  ```
- **Response 201**:
  ```json
  {
    "id": 10,
    "status": "A",
    "animal_id": 1,
    "nome_adotante": "Ana Souza",
    "created_at": "2026-09-07T18:00:00Z"
  }
  ```

---

## 4. Comunidade (`/api/comunidade/`)

### `GET /comunidade/noticias/`
- **Response 200**:
  ```json
  [
    {
      "id": 1,
      "titulo": "Campanha de Castração Gratuita",
      "resumo": "Neste sábado na praça central.",
      "created_at": "2026-09-01T10:00:00Z"
    }
  ]
  ```

### `GET /comunidade/posts/`
- **Response 200**:
  ```json
  [
    {
      "id": 1,
      "autor": "Carlos Lima",
      "texto": "Agradeço a todos que compareceram à feirinha!",
      "created_at": "2026-09-02T14:30:00Z"
    }
  ]
  ```

### `GET /comunidade/desaparecidos/`
- **Response 200**:
  ```json
  [
    {
      "id": 1,
      "nome": "Max",
      "local": "Jardim Botânico, São Paulo, SP",
      "contato": "(11) 91234-5678",
      "descricao": "Sumiu durante um passeio, muito medroso.",
      "created_at": "2026-09-03T09:00:00Z"
    }
  ]
  ```

### `POST /comunidade/desaparecidos/`
- **Request**:
  ```json
  {
    "nome": "Bela",
    "local": "Parque SP, Araraquara, SP",
    "contato": "(16) 98888-1122",
    "descricao": "Desapareceu após queima de fogos."
  }
  ```
- **Response 201**: Item criado com `id` e `created_at`.

Veja também:
- [[02 - Matriz de Divergências (Front vs Back)]]
- [[03 - Fluxo de Autenticação JWT]]
