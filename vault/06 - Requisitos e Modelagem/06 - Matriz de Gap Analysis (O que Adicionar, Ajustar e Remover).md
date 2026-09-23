# 🔍 Matriz de Gap Analysis (O que Adicionar, Ajustar e Remover)
tags: #gap-analysis #auditoria #divergencias #comparativo #roadmap #best-buddy

Este documento apresenta a análise de divergências entre a base de código do projeto (`Best_Buddy`) e as diretrizes consolidadas e simplificadas de arquitetura.

---

## 🟢 1. O que ADICIONAR ao Projeto

| Recurso / Item | Onde Deve Ser Adicionado | Detalhes Técnicos da Adição | Prioridade |
| :--- | :--- | :--- | :---: |
| **Tela "Editar Perfil"** | Frontend: `pages/auth/profile.html`<br>Backend: `usuarios/views.py` | Telas e endpoints para: 1) Alterar email com confirmação de senha atual e envio de token de revalidação; 2) Alterar senha com senha atual; 3) Gerenciamento e status de validação de WhatsApp. | 🔴 Alta |
| **Campos `telefone` e `telefone_validado` no Usuário** | Backend: `usuarios/models.py`<br>Frontend: `register.html` e `profile.html` | Inclusão de `telefone` (CharField opcional no primeiro momento) e `telefone_validado` (BooleanField, default=False) diretamente no modelo `Usuario`. | 🔴 Alta |
| **Integração com Twilio Verify (WhatsApp)** | Backend: `usuarios/views.py`<br>Frontend: Modal no perfil | Endpoints para disparar OTP via Twilio Verify (canal `whatsapp`) e checar código recebido. Ao aprovar, salva o número e ativa `telefone_validado = True`. | 🔴 Alta |
| **Tabela Unificada de Animais (`Animal`)** | Backend: `animais/models.py`<br>Frontend: `animals/index.html` e cadastro | Unificar adoção e animais perdidos em uma única tabela com flag `tipo_servico` (`ADOCAO` / `PERDIDO`). Contato resolvido via FK com o tutor autenticado (`animal.tutor.telefone`). | 🔴 Alta |
| **Bloqueio de Cadastro sem WhatsApp Validado** | Backend: `animais/serializers.py`<br>Frontend: Navegação e formulários | Usuários com `telefone_validado == False` são impedidos de anunciar pets e orientados a validar o WhatsApp no perfil. | 🔴 Alta |
| **Módulo de Denúncias Autenticadas** | Backend: App `denuncias`<br>Frontend: Modal nos cards | Model `Denuncia` associado a `Usuario` e campo `motivo_categoria` como Enum, com alvos `ADOCAO`, `PERDIDO` e `SERVICO`. | 🔴 Alta |
| **Módulo de Serviços Credenciados** | Backend: App `servicos`<br>Frontend: `pages/services/` | Model `Servico` com múltipla escolha de serviços prestados, CRMV se veterinário, horários e aprovação formal pela Staff. | 🔴 Alta |
| **Módulo de Solicitação de ONG** | Backend: App `usuarios`<br>Frontend: Tela de perfil | Model `SolicitacaoOng` com CNPJ, Razão Social, Telefone e Endereço, para homologação pela Staff. | 🔴 Alta |

---

## 🟡 2. O que AJUSTAR no Projeto

| Recurso / Item a Ajustar | Situação Anterior | Como Deve Ficar Conforme as Novas Diretrizes | Prioridade |
| :--- | :--- | :--- | :---: |
| **Contato nos Cards de Animais** | Campo de texto livre (`contato = models.CharField`) digitado em cada animal. | **FK Direta com Usuário Tutor**: O contato do anúncio vem de `animal.tutor.telefone`. Ao alterar no perfil, todos os anúncios do tutor atualizam automaticamente. | 🔴 Alta |
| **Cadastro Inicial de Usuário** | Exigia dados de pessoa física/jurídica completos. | Aceitar `email`, `senha`, `confirmação_de_senha` e `telefone` (opcional). Demais dados são preenchidos no perfil ou fluxos específicos. | 🔴 Alta |
| **Filtros e Visualização de Animais** | Telas e endpoints fragmentados entre adoção e desaparecidos em apps distintos. | Vitrine com filtros ou abas unificadas para "Adoção" e "Animais Perdidos" consumindo a mesma tabela `animais_animal`. | 🔴 Alta |
| **Navegação do Header (Navbar)** | Exibia links descontinuados. | Incluir link "Meu Perfil" para usuário logado, exibir status do WhatsApp e remover referências a posts. | 🟡 Média |

---

## 🔴 3. O que REMOVER ou DESCONTINUAR

| Item a Remover / Descontinuar | Onde Estava | Motivo da Remoção / O que Fazer | Prioridade |
| :--- | :--- | :--- | :---: |
| **Função Completa de Posts** | `comunidade/models.py` (`Post`), `comunidade/views.py`, frontend | **Abandonado por completo**: O mural livre de postagens de usuários foi descontinuado do produto. | 🔴 Alta |
| **Tabela Local `ValidacaoWhatsapp`** | Proposta anterior / models | **Removida**: O controle de OTP e envio via WhatsApp é gerenciado pelo Twilio Verify, sem necessidade de tabela local de PINs. | 🔴 Alta |
| **Tabela Separada `AnimalDesaparecido`** | `comunidade/models.py` | **Unificada**: Migrada para `animais_animal` com `tipo_servico='PERDIDO'`. | 🔴 Alta |
| **Formulário de Interesse em Adoção** | `adocoes/models.py`, `frontend/pages/adoption/` | **Descontinuado**: Adoção é feita por contato direto com o tutor via WhatsApp. Questionário interno descartado. | 🔴 Alta |

---

## 🔗 Próximas Notas Relacionadas
- [[07 - Plano de Ação e Roadmap de Implementação]] — Passos de implementação.
- [[05 - Modelagem de Dados e Relacionamentos]] — Schema de banco de dados consolidado.
- [[02 - Requisitos Funcionais]] — Especificação de cada requisito.
