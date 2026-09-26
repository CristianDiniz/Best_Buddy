# 🚀 Plano de Ação e Roadmap de Implementação
tags: #roadmap #tarefas #checklist #implementacao #ibge #best-buddy

Este documento estrutura o plano de execução técnica das mudanças do **Best Buddy**, atualizado após a integração do frontend recente e consolidando a utilização da **API de Localidades do IBGE** para eliminação de campos digitáveis e otimização total do banco de dados (sem necessidade de catálogo local de cidades).

---

## 🧭 Visão Geral do Fluxo com API do IBGE

```
[Frontend: ibgeService.js]
       │
       ├──> GET /estados ───────> Popula <select> de Estados (27 UFs)
       │
       └──> GET /estados/{UF}/municipios ─> Popula <select> de Cidades dinamicamente
                                                        │
[Envio para API Django] <───────────────────────────────┘
       │
       └──> Salva apenas: estado="SP" e cidade="Campinas" (sem catálogo no banco!)
```

---

## 🎯 Fases de Implementação Manual (Passo a Passo)

### 🧱 Fase 1: Backend — Modelagem e Migrações (`animais/models.py`)
*Objetivo: Preparar o modelo `Animal` para armazenar a UF do Enum e suportar contato flexível.*
- [ ] **1.1 Enum de Estados no Model:**
  - Criar `class Estado(models.TextChoices)` com as 27 siglas e nomes das UFs.
  - Adicionar campo `estado = models.CharField(max_length=2, choices=Estado.choices, default='SP', verbose_name="Estado (UF)")`.
- [ ] **1.2 Campo de Contato Flexível:**
  - Adicionar `telefone_contato = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefone de Contato do Anúncio")`.
  - Atualizar a property `@property def contato(self):` para retornar `self.telefone_contato or (self.tutor.telefone if self.tutor else "")`.
- [ ] **1.3 Executar Migrações:**
  - Executar no terminal: `python manage.py makemigrations animais` e `python manage.py migrate`.
- [ ] **1.4 Teste da Fase 1:**
  - Validar no `python manage.py shell` a criação de instância com UF e resolução de contato.

---

### ⚙️ Fase 2: Backend — Serializer e Filtros da API (`animais/`)
*Objetivo: Expor os novos campos na API e permitir filtro de busca por Estado.*
- [ ] **2.1 Atualização de Campos no `AnimaisSerializer`:**
  - Incluir `'estado'` e `'telefone_contato'` na lista `fields` de `AnimaisSerializer`.
- [ ] **2.2 Flexibilização da Validação de Telefone:**
  - Remover a trava anterior de Twilio no método `validate()`.
  - Nova regra: O usuário autenticado deve ter telefone no cadastro do perfil (`tutor.telefone`) OU deve informar o `telefone_contato` no payload do anúncio.
- [ ] **2.3 Filtro por Estado na View (`AnimaisViewSet`):**
  - No método `get_queryset()` de `animais/views.py`, adicionar suporte ao query param `?estado=SP`:
    ```python
    estado = self.request.query_params.get('estado')
    if estado:
        queryset = queryset.filter(estado__iexact=estado)
    ```
- [ ] **2.4 Teste da Fase 2:**
  - Testar criação de anúncio via endpoint e verificar se o filtro `?estado=...` responde corretamente.

---

### 🌐 Fase 3: Frontend — Serviço de Integração com o IBGE (`js/services/ibgeService.js`)
*Objetivo: Criar um módulo JavaScript centralizado, leve e reutilizável para consultar estados e cidades sem onerar o banco.*
- [ ] **3.1 Criação de `js/services/ibgeService.js`:**
  - `getEstados()`: Consulta `https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome`.
  - `getCidadesPorEstado(uf)`: Consulta `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`.
  - Implementar cache simples em memória (objeto JS) para evitar requisições repetidas ao mesmo estado durante a navegação.
- [ ] **3.2 Importação nas Páginas:**
  - Incluir `<script src="../../js/services/ibgeService.js"></script>` nos arquivos HTML necessários.

---

### 📝 Fase 4: Frontend — Formulários de Anúncio com IBGE e Contato Flexível
*Objetivo: Eliminar campo de texto livre de cidade e aplicar cascata de seleção Estado $\rightarrow$ Cidade nos modais de publicação.*
- [ ] **4.1 Modal de Adoção (`pages/animals/index.html` e `js/pages/animals.js`):**
  - No HTML: Substituir input texto por `<select id="pet-estado">` e `<select id="pet-cidade" disabled>`.
  - Adicionar campo de telefone inteligente: carrega o telefone do perfil se existente, ou exibe input obrigatório para digitação caso o usuário não tenha telefone.
  - No JS: Ao abrir o modal, carregar UFs com `ibgeService.getEstados()`. No evento `change` do estado, carregar as cidades correspondentes e habilitar o select de cidades.
- [ ] **4.2 Modal de Animal Perdido (`pages/community/index.html` e `js/pages/community.js`):**
  - Mesma estrutura: selects em cascata Estado $\rightarrow$ Cidade via `ibgeService` e telefone inteligente.

---

### 🔍 Fase 5: Frontend — Filtros Geográficos nas Vitrines
*Objetivo: Permitir que visitantes filtrem os animais por Estado e Cidade de forma estruturada.*
- [ ] **5.1 Dropdowns de Filtro nas Vitrines (`animals/index.html` e `community/index.html`):**
  - Adicionar `<select id="filter-estado">` com opção "Todos os estados" e as UFs do IBGE.
  - Adicionar `<select id="filter-cidade" disabled>` que lista as cidades ao escolher um estado.
- [ ] **5.2 Integração com a Busca:**
  - Ao mudar o Estado ou a Cidade, disparar a busca na API passando `?estado=UF&cidade=Nome`.

---

### ⏳ Fase 6: Rotina de Expiração Automática (90 + 30 dias)
*Objetivo: Automatizar o ciclo de vida dos anúncios (`RF16` e `RF17`).*
- [ ] **6.1 Comando Django (`animais/management/commands/expirar_anuncios.py`):**
  - Inativar anúncios com mais de 90 dias (`status = 'INATIVO'`, `inativado_em = now()`).
  - Excluir registros inativos há mais de 30 dias (120 dias no total).
- [ ] **6.2 Teste do Comando:**
  - Executar `python manage.py expirar_anuncios` e validar a atualização no banco.

---

### 🧪 Fase 7: Testes Integrados e Homologação Final
- [ ] **7.1 Bateria de Testes (`test_endpoints.py`):**
  - Validar criação de animais com `estado` e `cidade` do IBGE.
  - Validar filtros combinados.
  - Validar cota de 5 animais.
- [ ] **7.2 Homologação no Navegador:**
  - Testar fluxo completo de visitante navegando, filtrando por estado/cidade, logando, anunciando com os selects do IBGE e testando botão de WhatsApp.
