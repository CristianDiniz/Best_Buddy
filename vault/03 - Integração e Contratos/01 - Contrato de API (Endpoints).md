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

## 3. Adoção Direta (Contato via WhatsApp)

> [!WARNING]
> **Endpoint Descontinuado:** O endpoint `POST /adocoes/` e o modelo intermediário de propostas foram **descontinuados**.
> O fluxo de adoção foi simplificado para contato direto entre interessado e tutor via WhatsApp (`https://wa.me/55...`). A conclusão da adoção é feita pelo tutor atualizando o status do pet diretamente em `PATCH /animais/{id}/` (`status: "ADOTADO"`).

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
- **Headers**: `Authorization: Bearer <access_token>` (exige login)
- **Request**:
  ```json
  {
    "nome": "Bela",
    "local": "Parque SP, Araraquara, SP",
    "cidade": "Araraquara",
    "contato": "(16) 98888-1122",
    "descricao": "Desapareceu após queima de fogos."
  }
  ```
- **Response 201**: Item criado com `id` e `created_at`.

---

## 5. Validação de WhatsApp (`/api/animais/whatsapp/`)

### `POST /animais/whatsapp/solicitar-pin/`
Dispara PIN de 6 dígitos para o número informado via WhatsApp.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request**: `{"telefone": "(16) 99999-8888"}`
- **Response 200**: `{"sucesso": true, "mensagem": "Código PIN enviado com sucesso via WhatsApp."}`

### `POST /animais/whatsapp/verificar-pin/`
Confirma o código digitado pelo tutor.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request**: `{"telefone": "(16) 99999-8888", "codigo_pin": "123456"}`
- **Response 200**: `{"verificado": true, "token_validacao": "val_token_xyz"}`

---

## 6. Denúncias (`/api/denuncias/`)

### `POST /denuncias/`
Registro de denúncia qualificada por usuário autenticado.
- **Headers**: `Authorization: Bearer <access_token>` (obrigatório)
- **Request**:
  ```json
  {
    "tipo_alvo": "ADOCAO",
    "alvo_id": 1,
    "motivo_categoria": "MAUS_TRATOS",
    "justificativa_texto": "Animal apresenta sinais graves de desnutrição e abandono nas fotos."
  }
  ```
- **Response 201**:
  ```json
  {
    "id": 5,
    "status": "PENDENTE",
    "motivo_categoria": "MAUS_TRATOS",
    "created_at": "2026-09-15T20:00:00Z"
  }
  ```
- **Response 401**: `{"detail": "Authentication credentials were not provided."}`

---

## 7. Serviços (`/api/servicos/`)

### `GET /servicos/`
Listagem pública de prestadores homologados.
- **Query Params Suportados**: `?cidade=Araraquara&tipo_servico=veterinario`
- **Response 200**: Lista de serviços com status `APROVADO`.

### `POST /servicos/`
Solicitação de inclusão de serviço profissional.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request**:
  ```json
  {
    "tipo_cadastro": "PJ",
    "nome": "Clínica Veterinária PetCare",
    "tipos_servicos": ["veterinario", "internacao", "banho_tosa"],
    "crmv": "SP-12345",
    "horario_atendimento": "Segunda a Sábado, 08h às 18h",
    "telefone": "(16) 3333-4444",
    "aceita_whatsapp": true,
    "cidades_atuacao": "Araraquara, Américo Brasiliense",
    "informacoes_extras": "Atendimento 24h em emergências."
  }
  ```
- **Response 201**: Criado com status `PENDENTE` (aguarda moderação no Admin).

---

## 8. Solicitação de ONG (`/api/usuarios/solicitar-ong/`)

### `POST /usuarios/solicitar-ong/`
Submissão de pedido de upgrade institucional para cota ilimitada.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request**:
  ```json
  {
    "cnpj": "12.345.678/0001-90",
    "razao_social": "Associação Protetora dos Animais Vira-Lata",
    "nome_contato": "Mariana Ribeiro",
    "email_contato": "contato@viralata.org.br",
    "telefone": "(16) 3333-9999",
    "endereco": "Rua dos Resgatados, 100 - Araraquara/SP"
  }
  ```
- **Response 201**: Pedido gravado com status `PENDENTE` para triagem da Staff.

---

Veja também:
- [[02 - Matriz de Divergências (Front vs Back)]]
- [[03 - Fluxo de Autenticação JWT]]
- [[02 - Requisitos Funcionais]]
- [[05 - Modelagem de Dados e Relacionamentos]]
