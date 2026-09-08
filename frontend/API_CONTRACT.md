# API Contract — Best Buddy (esperado pelo front-end)

Este documento descreve o contrato que o front-end foi construído para
consumir. Ele reflete o **estado desejado**, não necessariamente o que o
backend Django atual (`develop`) já entrega — há bugs conhecidos no backend
que quebram esse contrato hoje (ver seção "Divergências conhecidas").

Base URL sugerida: `/api`

## Autenticação

### POST `/token/`
Request: `{ "email": "string", "password": "string" }`
Response 200: `{ "access": "string", "refresh": "string" }`
Response 401: `{ "detail": "string" }`

### POST `/usuarios/register/`
Request:
```json
{
  "email": "string",
  "password": "string",
  "tipo": "PF",
  "nome": "string",
  "cpf": "string",
  "telefone": "string"
}
```
Response 201: `{ "access": "string", "refresh": "string" }`

### POST `/usuarios/password-reset/`
Request: `{ "email": "string" }` → dispara envio de PIN por email
Response 200: `{ "sent": true }`

### POST `/usuarios/password-reset/confirm/`
Request: `{ "email": "string", "pin": "string", "password": "string" }`
Response 200: `{ "reset": true }`
Response 400: PIN inválido/expirado

## Animais

### GET `/animais/`
Response 200: lista de:
```json
{
  "id": 1,
  "nome": "string",
  "raca": "string",
  "sexo": "M | F | I",
  "idade_aproximada": "Filhote | Adulto | Idoso",
  "medicamento": "Sim | Não | Não sei",
  "vacinacao": "Sim | Não | Não sei",
  "contato": "string",
  "descricao": "string",
  "imagem": "url | null"
}
```

### GET `/animais/{id}/`
Response 200: mesmo shape acima.

### POST `/animais/`
Cria animal (requer autenticação). Mesmo shape de campos, sem `id`.

## Adoção

### POST `/adocoes/`
Request:
```json
{
  "animal_id": 1,
  "nome_adotante": "string",
  "email_adotante": "string",
  "telefone_adotante": "string",
  "ja_teve_animais": "Sim | Não | Não sei",
  "ja_vacinado": "Sim | Não | Não sei",
  "motivacao": "string"
}
```
Response 201: `{ "id": 1, "status": "A", ...payload }`

**Nota:** o front espera que `Adocao` referencie um `Animal` existente por
`animal_id` (FK), e não duplique os campos do animal como o model atual faz.

## Comunidade (não existe backend ainda — a criar)

### GET `/comunidade/noticias/`
Response 200: `[{ "id": 1, "titulo": "string", "resumo": "string", "created_at": "iso-datetime" }]`

### GET `/comunidade/posts/`
Response 200: `[{ "id": 1, "autor": "string", "texto": "string", "created_at": "iso-datetime" }]`

### GET `/comunidade/desaparecidos/`
Response 200: `[{ "id": 1, "nome": "string", "local": "string", "contato": "string", "descricao": "string", "created_at": "iso-datetime" }]`

### POST `/comunidade/desaparecidos/`
Request: `{ "nome": "string", "local": "string", "contato": "string", "descricao": "string" }`
Response 201: item criado.

## Divergências conhecidas no backend atual (a corrigir)

1. `animais/models.py` define `Animal` (singular); `serializers.py` e
   `views.py` importam `Animais` (plural) — `ImportError`, app não sobe.
2. `animais/serializers.py` referencia campos `pessoa` e `idade` que não
   existem no model `Animal`.
3. `adocoes/serializer.py` referencia campos `ongs` e `pessoa` que não
   existem no model `Adocao`.
4. `Adocao` duplica campos do animal (nome, raça, sexo, etc.) em vez de ter
   uma FK para `Animal`. Também não tem FK para `Usuario` (adotante).
5. Não existem apps/models para Comunidade (posts, notícias, desaparecidos).

Nenhuma dessas divergências bloqueia o desenvolvimento do front — os
`services` em `js/services/` já mockam o contrato correto e podem apontar
para a API real assim que o backend for ajustado.
