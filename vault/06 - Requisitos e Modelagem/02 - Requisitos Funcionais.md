# ⚙️ Requisitos Funcionais (RF)
tags: #requisitos-funcionais #rf #especificacao #features #best-buddy

Este documento cataloga os Requisitos Funcionais do sistema **Best Buddy**, organizados por módulo de negócio, atualizados com a unificação da tabela de animais, abandono de posts e inclusão da tela de perfil e validação Twilio.

---

## 🔐 Módulo 1: Autenticação, Perfil e Segurança

### `RF01` — Cadastro de Usuário
* **Descrição:** O formulário de cadastro deve ser ágil e exigir:
  - `email` (válido e único).
  - `senha` (hasheada com segurança no backend).
  - `confirmação_de_senha`.
  - `telefone` (celular com DDD, opcional no momento da criação da conta).
* **Validação:** O usuário pode concluir a criação de conta sem ter o telefone vinculado de imediato. A conta é criada com `telefone_validado = False`.

### `RF01.1` — Tela de "Editar Perfil"
* **Descrição:** Interface autenticada para o usuário gerenciar suas credenciais e contato:
  1. **Alteração de Email:** Exige a confirmação da senha atual. Ao submeter, o sistema dispara um e-mail de revalidação com token assinado para o novo endereço.
  2. **Alteração de Senha:** Exige a confirmação da senha atual para permitir a definição da nova senha.
  3. **Validação de WhatsApp via Twilio:** O usuário insere o número de celular e solicita o código de verificação enviado via WhatsApp pelo serviço **Twilio Verify**. Após validar o código PIN com sucesso, o número é vinculado ao usuário e a flag `telefone_validado` é ativada (`True`).
  4. **Substituição de Número:** Caso deseje alterar o número cadastrado, o usuário deve revalidar o novo número via Twilio WhatsApp. Ao ser aprovado, o novo número substitui o anterior no perfil e passa a refletir automaticamente em todos os anúncios de animais ativos do usuário.

### `RF02` — Autenticação de Usuário (Login)
* **Descrição:** Autenticação via email e senha retornando par de tokens JWT (`access` e `refresh`) e dados do usuário (`id`, `email`, `tipo_usuario`, `telefone`, `telefone_validado`).

### `RF03` — Redirecionamento de Usuário Logado
* **Descrição:** Se o usuário já estiver logado e tentar acessar as páginas de autenticação (`/login.html` ou `/register.html`), o sistema deve redirecioná-lo automaticamente para a Home (`/pages/home/index.html`).

### `RF04` — Interceptação de Visitantes
* **Descrição:** Botões de criação de conteúdo ("Anunciar Animal", "Reportar Desaparecido", "Solicitar Serviço") devem permanecer visíveis para visitantes. Ao serem clicados sem autenticação, o visitante é redirecionado para login/cadastro.

### `RF05` — Recuperação de Senha
* **Descrição:** O usuário solicita recuperação informando o email cadastrado. O sistema envia um email com link seguro contendo token temporal para redefinição de senha.

### `RF06` — Isolamento da Rota Administrativa
* **Descrição:** A rota `/admin/` não deve possuir links visíveis na navegação pública e deve ser restrita exclusivamente a usuários com `is_staff=True` ou `is_superuser=True`.

---

## 🐾 Módulo 2: Animais (Tabela Unificada: Adoção e Perdidos)

> [!IMPORTANT]
> **Tabela Unificada:** Os serviços de "Adoção" e "Animal Perdido" compartilham a mesma tabela `Animal` (`animais_animal`), utilizando o discriminador `tipo_servico` (`ADOCAO` ou `PERDIDO`).

### `RF07` — Vitrine Pública de Adoção
* **Descrição:** Listagem pública de animais cadastrados com `tipo_servico='ADOCAO'` e status `Disponível`, exibindo card com foto, nome (opcional), cidade, sexo, porte/idade aproximada e botão direto para o WhatsApp do tutor.

### `RF08` — Filtros de Busca em Adoção
* **Descrição:** Filtros de pesquisa por:
  - **Cidade** (busca textual ou select).
  - **Tempo de postagem** (mais recentes, última semana, último mês).
  - **Tipo de animal** (Cachorro, Gato, Outro).

### `RF09` — Cadastro de Pet para Adoção
* **Descrição:** Formulário para usuário logado anunciar um animal para adoção (`tipo_servico='ADOCAO'`):
  - **Pré-requisito Mandatório:** O usuário **deve possuir `telefone_validado = True`**. Caso contrário, o sistema bloqueia o cadastro e orienta o usuário a validar seu WhatsApp no perfil.
  - **Contato Automático:** O anúncio não possui campo livre de telefone; ele herda o contato diretamente da chave estrangeira `tutor` (`tutor.telefone`).
  - **Campos:** Foto do animal, tipo de animal (`CACHORRO`, `GATO`, `OUTRO`), cidade, descrição (máximo 255 caracteres), e opcionais: nome, raça, sexo, idade aproximada, medicação e vacinas.

### `RF10` — Vínculo de Propriedade
* **Descrição:** Cada animal cadastrado deve ser associado à chave estrangeira `tutor_id` do usuário anunciante.

### `RF11` — Cota de 5 Animais Ativos para Usuário Comum
* **Descrição:** O sistema valida a quantidade de animais ativos do usuário. Caso seja usuário comum e já possua 5 registros ativos (adoção + perdidos), a criação de um novo deve ser rejeitada com mensagem orientativa.

### `RF12` — Edição e Conclusão pelo Tutor
* **Descrição:** O tutor pode editar os dados do anúncio ou marcá-lo como "Adotado" a qualquer momento.

### `RF13` — Adoção Direta via WhatsApp (Sem Questionário Intermediário)
* **Descrição:** Interessados entram em contato diretamente com o tutor pelo botão de WhatsApp que abre conversa direta (`https://wa.me/55...`) com o número validado do tutor.

---

## 🔍 Módulo 3: Animais Perdidos (Desaparecidos)

### `RF14` — Mural de Animais Perdidos
* **Descrição:** Mural público exibindo pets registrados com `tipo_servico='PERDIDO'` e status `Perdido`, com foto, último local visto, cidade e botão direto de contato com o tutor via WhatsApp.

### `RF15` — Filtros em Animais Perdidos
* **Descrição:** Filtros de pesquisa por cidade, tempo de postagem e tipo de animal no mural de desaparecidos.

### `RF16` — Formulário de Registro de Animal Perdido
* **Descrição:** Modal ou tela estruturada para usuário logado registrar um pet perdido (`tipo_servico='PERDIDO'`):
  - **Pré-requisito Mandatório:** O usuário **deve possuir `telefone_validado = True`**.
  - **Contato Automático:** O contato é herdado diretamente de `tutor.telefone`.
  - **Campos:** Foto do animal, tipo de animal, cidade, último local visto (ponto de referência), nome do animal (opcional) e informações extras (máximo 255 caracteres).

### `RF17` — Resolução e Moderação de Perdidos
* **Descrição:** O tutor pode marcar o animal como "Encontrado" a qualquer momento. A Staff pode inativar anúncios caso detecte conteúdo falso ou impróprio.

---

## 🏥 Módulo 4: Serviços Profissionais e Clínicas

### `RF18` — Vitrine de Serviços
* **Descrição:** Exibição pública de cards de serviços aprovados, com foto, nome do estabelecimento/profissional, lista de serviços prestados, horários, telefone/WhatsApp e cidades atendidas.

### `RF19` — Solicitação de Credenciamento de Serviço
* **Descrição:** Usuário logado pode submeter proposta de credenciamento informando:
  - Tipo de cadastro: PF ou PJ.
  - Foto do profissional ou fachada do local.
  - Nome da clínica ou profissional.
  - Tipos de serviços (múltipla escolha).
  - CRMV obrigatório caso inclua serviço veterinário.
  - Horário de atendimento, telefone comercial, cidades de atuação e informações extras (máx. 255 chars).

### `RF20` — Fila de Aprovação de Serviços
* **Descrição:** O serviço é criado com status `Pendente` e só passa a ser exibido na vitrine após aprovação por Staff ou SuperUser.

### `RF21` — Moderação Estrita da Staff
* **Descrição:** A Staff pode suspender ou inativar o serviço, mas é impedida de alterar o conteúdo dos dados cadastrais do prestador.

---

## 💬 Módulo 5: Comunidade (Posts Descontinuados)

> [!CAUTION]
> **Decisão de Produto — Abandono da Função de Posts:**
> A funcionalidade de mural livre de postagens de usuários (`Post`) foi **completamente abandonada e descontinuada**.
> Os requisitos anteriores `RF25`, `RF26` e `RF27` não estão mais ativos no sistema. A seção da comunidade passa a focar exclusivamente em notícias, artigos e informativos institucionais oficiais.

---

## 🏢 Módulo 6: Solicitação e Upgrade de ONG

### `RF22` — Formulário de Solicitação de ONG
* **Descrição:** Usuário logado submete dados da organização: CNPJ, Razão Social, Nome do contato, Email de contato, Telefone e Endereço completo.

### `RF23` — Fila de Moderação e Concessão de Cota Ilimitada
* **Descrição:** A solicitação é enviada para análise no painel administrativo. Ao ser aprovada pela Staff/SuperUser, o usuário ganha perfil `ONG`, liberando cota ilimitada para anúncio de animais.

---

## 🚨 Módulo 7: Sistema de Denúncias Universal

### `RF24` — Denúncia em Cards com Login Obrigatório
* **Descrição:** Botão de denúncia disponível nos cards de adoção, animais perdidos e serviços prestados. Ação restrita a **usuários autenticados**. O tipo de alvo aceita `ADOCAO`, `PERDIDO` e `SERVICO` *(alvo `POST` descontinuado)*.

### `RF25` — Motivo Obrigatório via Enum
* **Descrição:** A denúncia exige a seleção de uma categoria pré-definida (Maus-tratos, Fraude/Golpe, Dados Falsos, Animal já adotado, Exercício ilegal da profissão, Spam/Ofensivo ou Outro) e justificativa textual.

### `RF26` — Fila de Moderação de Denúncias
* **Descrição:** Painel no Django Admin para triagem de denúncias pela Staff, com histórico, parecer e atalho para inativar o conteúdo denunciado.

---

## 🛡️ Módulo 8: Painel Administrativo com Restrições de Staff

### `RF27` — Gestão de Staff Exclusiva de SuperUser
* **Descrição:** Apenas SuperUsers têm permissão para criar, editar privilégios ou remover membros da Staff.

### `RF28` — Ocultação de Logs para Staff
* **Descrição:** Membros da Staff não devem visualizar as colunas de auditoria `created_at` e `updated_at`.

### `RF29` — Bloqueio de Alteração Entre Moderadores
* **Descrição:** Usuários Staff não podem alterar perfis de outros membros da Staff ou de SuperUsers.

---

## ⏳ Módulo 9: Rotina Automática de Expiração (90 + 30 dias)

### `RF30` — Inativação aos 90 Dias
* **Descrição:** Anúncios de animais para adoção que completarem 90 dias sem adoção tornam-se inativos automaticamente.

### `RF31` — Janela de Reativação de 30 Dias e Exclusão aos 120 Dias
* **Descrição:** O tutor tem até 30 dias após a inativação para reativar o anúncio por mais 90 dias. Registros inativos por mais de 30 dias (120 dias no total) são permanentemente excluídos do banco por comando agendado.

---

## 🔗 Próximas Notas Relacionadas
- [[04 - Regras de Negócio]] — Diretrizes e validações mandatórias.
- [[05 - Modelagem de Dados e Relacionamentos]] — Diagrama ERD e dicionário de dados.
- [[06 - Matriz de Gap Analysis (O que Adicionar, Ajustar e Remover)]] — Auditoria comparativa.
