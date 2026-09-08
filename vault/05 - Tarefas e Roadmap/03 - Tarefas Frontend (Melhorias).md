# 💻 Roadmap — Tarefas e Melhorias do Frontend
tags: #frontend #melhorias #ux #ui #tarefas

Embora o frontend esteja muito bem estruturado e com o design polido, existem oportunidades claras de refinamento para quando a conexão com o backend real for consolidada.

---

## 1. Captura e Armazenamento do Usuário no Login (`authService.js`)

### Situação Atual:
Ao chamar a API real de login:
```javascript
const data = await bbClient.post("/token/", { email, password }, { auth: false });
return { access: data.access, refresh: data.refresh, user: null }; // user sempre nulo
```

### Melhoria:
Atualizar para receber `data.user` retornado pelo token customizado ou decodificar o payload do JWT:

```javascript
// js/services/authService.js
async login({ email, password }) {
  if (window.BB_CONFIG.USE_MOCKS) {
    if (email === BB_MOCK_CREDENTIALS.email && password === BB_MOCK_CREDENTIALS.password) {
      const session = { access: "mock-access-token", refresh: "mock-refresh-token", user: BB_MOCK_USER };
      return bbMockDelay(session);
    }
    return bbMockError("Email ou senha inválidos.", 401);
  }
  const data = await bbClient.post("/token/", { email, password }, { auth: false });
  return { 
    access: data.access, 
    refresh: data.refresh, 
    user: data.user || { email, nome: email.split("@")[0] } 
  };
},
```

---

## 2. Substituir `prompt()` por Modal em Animais Desaparecidos (`community.js`)

### Situação Atual:
O botão "Reportar animal desaparecido" utiliza 4 caixas nativas `prompt()` do navegador sequencialmente:
```javascript
const nome = prompt("Nome do animal:");
const local = prompt("Onde foi visto por último?") || "";
const contato = prompt("Seu contato:") || "";
const descricao = prompt("Descreva o animal:") || "";
```

### Melhoria Proposta:
Criar um `<dialog>` nativo ou modal Tailwind no `community/index.html`:
- Campos estilizados com `.bb-input`.
- Validação client-side nos campos obrigatórios (`nome`, `local`, `contato`).
- Botão com estado de loading enquanto a requisição `communityService.reportMissingAnimal()` executa.

---

## 3. Pré-preenchimento Automático do Formulário de Adoção (`adoption.js`)

### Melhoria de UX:
Se o usuário já está autenticado e logado no sistema, podemos puxar seus dados de `bbStorage.getUser()` e pré-preencher os inputs:
- Nome completo
- Email
- Telefone (caso salvo no perfil)

Isso poupa digitação do usuário e melhora a taxa de conversão das adoções.

---

## 4. Modal / Página para "Cadastrar Novo Animal" (Admin / ONG)

### Situação Atual:
O `animalService.create(payload)` existe no código, mas não há um botão ou formulário na interface para novos animais serem adicionados (hoje isso é feito diretamente via painel do Django Admin).

### Melhoria:
Criar `pages/animals/create.html` (ou modal flutuante na tela de animais visível apenas para usuários do tipo `"PJ"` ou administradores).

---

## 5. Exibição de Fotos Reais com Fallback

No `AnimalCard.js` e `animal-detail.js`, garantir que a URL vinda da API Django seja tratada corretamente:
- Se a imagem for relativa (`/media/animais/foto.jpg`), concatenar com `API_BASE_URL` ou servir de forma absoluta.
- Se for nula, exibir o placeholder elegante "Sem foto" existente.

Veja também:
- [[01 - Checklist de Correções Imediatas]]
- [[04 - Guia de Execução e Testes]]
